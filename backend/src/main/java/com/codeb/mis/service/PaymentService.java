package com.codeb.mis.service;

import com.codeb.mis.dto.PagedResponse;
import com.codeb.mis.dto.PaymentDto;
import com.codeb.mis.entity.*;
import com.codeb.mis.exception.BadRequestException;
import com.codeb.mis.exception.ResourceNotFoundException;
import com.codeb.mis.repository.InvoiceRepository;
import com.codeb.mis.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public PagedResponse<PaymentDto.Response> getPayments(String search, Payment.PaymentStatus status,
                                                        Long clientId, Long invoiceId, String paymentMethod,
                                                        LocalDate startDate, LocalDate endDate,
                                                        Long salespersonId,
                                                        int page, int size) {
        User currentUser = auditService.getCurrentUser();
        if (currentUser != null && currentUser.getRole() == User.Role.SALES_PERSON) {
            salespersonId = currentUser.getUserId();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("paymentId").descending());
        Page<Payment> pageResult = paymentRepository.searchPayments(
                search != null && !search.isBlank() ? search : null,
                status,
                clientId,
                invoiceId,
                paymentMethod != null && !paymentMethod.isBlank() ? paymentMethod : null,
                startDate,
                endDate,
                salespersonId,
                pageable
        );
        return PagedResponse.from(pageResult.map(PaymentDto.Response::fromEntity));
    }

    @Transactional(readOnly = true)
    public PaymentDto.Response getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));
        return PaymentDto.Response.fromEntity(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentDto.Response> getPaymentsByInvoice(Long invoiceId) {
        return paymentRepository.findByInvoiceInvoiceId(invoiceId).stream()
                .map(PaymentDto.Response::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public PaymentDto.Response recordPayment(PaymentDto.Request request) {
        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + request.getInvoiceId()));

        if (invoice.getStatus() == Invoice.InvoiceStatus.CANCELLED) {
            throw new BadRequestException("Cannot record payment against a cancelled invoice");
        }

        if (invoice.getStatus() == Invoice.InvoiceStatus.PAID) {
            throw new BadRequestException("Invoice is already fully paid. Balance due is INR 0.00");
        }

        BigDecimal paymentAmount = request.getAmount().setScale(2, RoundingMode.HALF_UP);
        if (paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than zero");
        }

        if (paymentAmount.compareTo(invoice.getBalanceDue()) > 0) {
            throw new BadRequestException(String.format("Payment amount (INR %,.2f) cannot exceed outstanding balance (INR %,.2f)", 
                    paymentAmount, invoice.getBalanceDue()));
        }

        User recordedBy = auditService.getCurrentUser();

        Payment payment = Payment.builder()
                .invoice(invoice)
                .client(invoice.getClient())
                .paymentDate(request.getPaymentDate())
                .paymentReference(request.getPaymentReference())
                .paymentMethod(request.getPaymentMethod())
                .amount(paymentAmount)
                .status(request.getStatus() != null ? request.getStatus() : Payment.PaymentStatus.SUCCESS)
                .notes(request.getNotes())
                .recordedBy(recordedBy)
                .build();

        Payment saved = paymentRepository.save(payment);

        // Update Invoice status and balance
        if (saved.getStatus() == Payment.PaymentStatus.SUCCESS) {
            BigDecimal newAmountPaid = invoice.getAmountPaid().add(paymentAmount).setScale(2, RoundingMode.HALF_UP);
            BigDecimal newBalanceDue = invoice.getTotalAmount().subtract(newAmountPaid).setScale(2, RoundingMode.HALF_UP);
            if (newBalanceDue.compareTo(BigDecimal.ZERO) < 0) {
                newBalanceDue = BigDecimal.ZERO;
            }

            invoice.setAmountPaid(newAmountPaid);
            invoice.setBalanceDue(newBalanceDue);

            if (newBalanceDue.compareTo(BigDecimal.ZERO) == 0) {
                invoice.setStatus(Invoice.InvoiceStatus.PAID);
            } else {
                invoice.setStatus(Invoice.InvoiceStatus.PARTIALLY_PAID);
            }

            invoiceRepository.save(invoice);
        }

        auditService.log("RECORD_PAYMENT", "PAYMENT", saved.getPaymentId().toString(), 
                String.format("Recorded payment of INR %,.2f via %s for invoice %s. New status: %s", 
                        paymentAmount, saved.getPaymentMethod(), invoice.getInvoiceNumber(), invoice.getStatus()));

        return PaymentDto.Response.fromEntity(saved);
    }

    @Transactional
    public PaymentDto.Response updatePaymentStatus(Long id, Payment.PaymentStatus newStatus) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));

        Payment.PaymentStatus oldStatus = payment.getStatus();
        if (oldStatus == newStatus) {
            return PaymentDto.Response.fromEntity(payment);
        }

        Invoice invoice = payment.getInvoice();

        // If reversing success to failed/refunded
        if (oldStatus == Payment.PaymentStatus.SUCCESS && (newStatus == Payment.PaymentStatus.FAILED || newStatus == Payment.PaymentStatus.REFUNDED)) {
            BigDecimal newAmountPaid = invoice.getAmountPaid().subtract(payment.getAmount()).setScale(2, RoundingMode.HALF_UP);
            if (newAmountPaid.compareTo(BigDecimal.ZERO) < 0) {
                newAmountPaid = BigDecimal.ZERO;
            }
            BigDecimal newBalanceDue = invoice.getTotalAmount().subtract(newAmountPaid).setScale(2, RoundingMode.HALF_UP);

            invoice.setAmountPaid(newAmountPaid);
            invoice.setBalanceDue(newBalanceDue);

            if (newAmountPaid.compareTo(BigDecimal.ZERO) == 0) {
                invoice.setStatus(Invoice.InvoiceStatus.ISSUED);
            } else {
                invoice.setStatus(Invoice.InvoiceStatus.PARTIALLY_PAID);
            }
            invoiceRepository.save(invoice);
        } 
        // If transitioning from failed/pending to success
        else if (oldStatus != Payment.PaymentStatus.SUCCESS && newStatus == Payment.PaymentStatus.SUCCESS) {
            BigDecimal newAmountPaid = invoice.getAmountPaid().add(payment.getAmount()).setScale(2, RoundingMode.HALF_UP);
            BigDecimal newBalanceDue = invoice.getTotalAmount().subtract(newAmountPaid).setScale(2, RoundingMode.HALF_UP);
            if (newBalanceDue.compareTo(BigDecimal.ZERO) < 0) {
                newBalanceDue = BigDecimal.ZERO;
            }

            invoice.setAmountPaid(newAmountPaid);
            invoice.setBalanceDue(newBalanceDue);

            if (newBalanceDue.compareTo(BigDecimal.ZERO) == 0) {
                invoice.setStatus(Invoice.InvoiceStatus.PAID);
            } else {
                invoice.setStatus(Invoice.InvoiceStatus.PARTIALLY_PAID);
            }
            invoiceRepository.save(invoice);
        }

        payment.setStatus(newStatus);
        Payment saved = paymentRepository.save(payment);

        auditService.log("UPDATE_PAYMENT_STATUS", "PAYMENT", saved.getPaymentId().toString(), 
                "Changed payment status from " + oldStatus + " to " + newStatus);

        return PaymentDto.Response.fromEntity(saved);
    }
}

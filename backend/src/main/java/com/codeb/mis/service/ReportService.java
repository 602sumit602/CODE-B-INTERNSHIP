package com.codeb.mis.service;

import com.codeb.mis.dto.InvoiceDto;
import com.codeb.mis.entity.*;
import com.codeb.mis.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.StringWriter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ClientRepository clientRepository;
    private final EstimateRepository estimateRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public Map<String, Object> getSalesReport(LocalDate startDate, LocalDate endDate, Long clientId, Long salespersonId) {
        User currentUser = auditService.getCurrentUser();
        final Long targetSalespersonId = (currentUser != null && currentUser.getRole() == User.Role.SALES_PERSON)
                ? currentUser.getUserId()
                : salespersonId;

        List<Invoice> invoices = invoiceRepository.findAll().stream()
                .filter(i -> i.getStatus() != Invoice.InvoiceStatus.CANCELLED)
                .filter(i -> startDate == null || !i.getInvoiceDate().isBefore(startDate))
                .filter(i -> endDate == null || !i.getInvoiceDate().isAfter(endDate))
                .filter(i -> clientId == null || (i.getClient() != null && i.getClient().getClientId().equals(clientId)))
                .filter(i -> {
                    if (targetSalespersonId == null) return true;
                    return i.getSalesperson() != null && i.getSalesperson().getUserId().equals(targetSalespersonId);
                })
                .toList();

        BigDecimal totalBilled = invoices.stream().map(Invoice::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalPaid = invoices.stream().map(Invoice::getAmountPaid).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalDue = invoices.stream().map(Invoice::getBalanceDue).reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> result = new HashMap<>();
        result.put("invoicesCount", invoices.size());
        result.put("totalBilled", totalBilled);
        result.put("totalPaid", totalPaid);
        result.put("totalDue", totalDue);
        result.put("invoices", invoices.stream().map(InvoiceDto.Response::fromEntity).toList());
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getOutstandingReport(Long clientId) {
        List<Invoice> outstanding = invoiceRepository.findAll().stream()
                .filter(i -> i.getStatus() != Invoice.InvoiceStatus.CANCELLED && i.getStatus() != Invoice.InvoiceStatus.PAID)
                .filter(i -> clientId == null || (i.getClient() != null && i.getClient().getClientId().equals(clientId)))
                .toList();

        BigDecimal totalOutstanding = outstanding.stream().map(Invoice::getBalanceDue).reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> result = new HashMap<>();
        result.put("count", outstanding.size());
        result.put("totalOutstanding", totalOutstanding);
        result.put("invoices", outstanding.stream().map(InvoiceDto.Response::fromEntity).toList());
        return result;
    }

    @Transactional(readOnly = true)
    public String exportInvoicesCsv() {
        List<Invoice> invoices = invoiceRepository.findAll();
        StringWriter writer = new StringWriter();
        writer.write("Invoice Number,Date,Due Date,Client Name,Salesperson,Subtotal,Discount,GST,Total,Amount Paid,Balance Due,Status\n");

        for (Invoice i : invoices) {
            writer.write(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,\"%s\"\n",
                    i.getInvoiceNumber(),
                    i.getInvoiceDate(),
                    i.getDueDate(),
                    i.getClient() != null ? i.getClient().getClientName().replace("\"", "\"\"") : "",
                    i.getSalesperson() != null ? i.getSalesperson().getFullName().replace("\"", "\"\"") : "",
                    i.getSubtotal(),
                    i.getDiscount(),
                    i.getGst(),
                    i.getTotalAmount(),
                    i.getAmountPaid(),
                    i.getBalanceDue(),
                    i.getStatus()));
        }
        return writer.toString();
    }

    @Transactional(readOnly = true)
    public String exportEstimatesCsv() {
        List<Estimate> estimates = estimateRepository.findAll();
        StringWriter writer = new StringWriter();
        writer.write("Estimate Number,Date,Valid Until,Client Name,Salesperson,Subtotal,Discount,GST,Grand Total,Status\n");

        for (Estimate e : estimates) {
            writer.write(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%.2f,%.2f,%.2f,%.2f,\"%s\"\n",
                    e.getEstimateNumber(),
                    e.getEstimateDate(),
                    e.getValidUntil(),
                    e.getClient() != null ? e.getClient().getClientName().replace("\"", "\"\"") : "",
                    e.getSalesperson() != null ? e.getSalesperson().getFullName().replace("\"", "\"\"") : "",
                    e.getSubtotal(),
                    e.getDiscount(),
                    e.getGst(),
                    e.getGrandTotal(),
                    e.getStatus()));
        }
        return writer.toString();
    }

    @Transactional(readOnly = true)
    public String exportPaymentsCsv() {
        List<Payment> payments = paymentRepository.findAll();
        StringWriter writer = new StringWriter();
        writer.write("Payment ID,Invoice Number,Client Name,Date,Method,Reference,Amount,Status\n");

        for (Payment p : payments) {
            writer.write(String.format("%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%.2f,\"%s\"\n",
                    p.getPaymentId(),
                    p.getInvoice() != null ? p.getInvoice().getInvoiceNumber() : "",
                    p.getClient() != null ? p.getClient().getClientName().replace("\"", "\"\"") : "",
                    p.getPaymentDate(),
                    p.getPaymentMethod(),
                    p.getPaymentReference() != null ? p.getPaymentReference() : "",
                    p.getAmount(),
                    p.getStatus()));
        }
        return writer.toString();
    }

    @Transactional(readOnly = true)
    public String exportClientsCsv() {
        List<Client> clients = clientRepository.findAll();
        StringWriter writer = new StringWriter();
        writer.write("Client ID,Name,Contact Person,Email,Phone,City,State,GSTIN,Group,Chain,Brand,Subzone,Status\n");

        for (Client c : clients) {
            writer.write(String.format("%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                    c.getClientId(),
                    c.getClientName().replace("\"", "\"\""),
                    c.getContactPerson() != null ? c.getContactPerson().replace("\"", "\"\"") : "",
                    c.getEmail() != null ? c.getEmail() : "",
                    c.getPhone() != null ? c.getPhone() : "",
                    c.getCity() != null ? c.getCity() : "",
                    c.getState() != null ? c.getState() : "",
                    c.getGstin() != null ? c.getGstin() : "",
                    c.getGroup() != null ? c.getGroup().getGroupName() : "",
                    c.getChain() != null ? c.getChain().getChainName() : "",
                    c.getBrand() != null ? c.getBrand().getBrandName() : "",
                    c.getSubzone() != null ? c.getSubzone().getSubzoneName() : "",
                    c.getStatus()));
        }
        return writer.toString();
    }
}

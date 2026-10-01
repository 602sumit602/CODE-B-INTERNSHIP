package com.codeb.mis.service;

import com.codeb.mis.dto.EstimateDto;
import com.codeb.mis.dto.InvoiceDto;
import com.codeb.mis.dto.PagedResponse;
import com.codeb.mis.entity.*;
import com.codeb.mis.exception.BadRequestException;
import com.codeb.mis.exception.ResourceNotFoundException;
import com.codeb.mis.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EstimateService {

    private final EstimateRepository estimateRepository;
    private final ClientRepository clientRepository;
    private final ChainRepository chainRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final SettingService settingService;

    @Lazy
    private final InvoiceService invoiceService;

    @Transactional(readOnly = true)
    public PagedResponse<EstimateDto.Response> getEstimates(String search, Estimate.EstimateStatus status,
                                                          Long clientId, Long salespersonId,
                                                          LocalDate startDate, LocalDate endDate,
                                                          int page, int size) {
        User currentUser = auditService.getCurrentUser();
        // If current user is SALES_PERSON, restrict to their own estimates
        if (currentUser != null && currentUser.getRole() == User.Role.SALES_PERSON) {
            salespersonId = currentUser.getUserId();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("estimateId").descending());
        Page<Estimate> pageResult = estimateRepository.searchEstimates(
                search != null && !search.isBlank() ? search : null,
                status,
                clientId,
                salespersonId,
                startDate,
                endDate,
                pageable
        );
        return PagedResponse.from(pageResult.map(EstimateDto.Response::fromEntity));
    }

    @Transactional(readOnly = true)
    public EstimateDto.Response getEstimateById(Long id) {
        Estimate estimate = estimateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estimate not found with ID: " + id));

        checkAccess(estimate);
        return EstimateDto.Response.fromEntity(estimate);
    }

    @Transactional
    public EstimateDto.Response createEstimate(EstimateDto.Request request) {
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with ID: " + request.getClientId()));

        Chain chain = null;
        if (request.getChainId() != null) {
            chain = chainRepository.findById(request.getChainId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chain not found with ID: " + request.getChainId()));
        } else if (client.getChain() != null) {
            chain = client.getChain();
        }

        User salesperson = auditService.getCurrentUser();
        if (salesperson == null) {
            // Default to first active user if in special context
            salesperson = userRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new BadRequestException("No user found"));
        }

        BigDecimal gstRate = request.getGstRate() != null ? request.getGstRate() : settingService.getGstRate();

        Estimate estimate = Estimate.builder()
                .estimateNumber(generateEstimateNumber())
                .client(client)
                .chain(chain)
                .estimateDate(request.getEstimateDate())
                .validUntil(request.getValidUntil())
                .salesperson(salesperson)
                .status(request.getStatus() != null ? request.getStatus() : Estimate.EstimateStatus.DRAFT)
                .gstRate(gstRate)
                .notes(request.getNotes())
                .items(new ArrayList<>())
                .build();

        populateAndCalculateEstimate(estimate, request.getItems(), gstRate);

        Estimate saved = estimateRepository.save(estimate);
        auditService.log("CREATE_ESTIMATE", "ESTIMATE", saved.getEstimateId().toString(), 
                "Created estimate " + saved.getEstimateNumber() + " for client: " + client.getClientName());

        return EstimateDto.Response.fromEntity(saved);
    }

    @Transactional
    public EstimateDto.Response updateEstimate(Long id, EstimateDto.Request request) {
        Estimate estimate = estimateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estimate not found with ID: " + id));

        checkAccess(estimate);

        if (estimate.getStatus() == Estimate.EstimateStatus.CONVERTED) {
            throw new BadRequestException("Cannot update an estimate that has already been converted to an invoice");
        }

        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with ID: " + request.getClientId()));

        Chain chain = null;
        if (request.getChainId() != null) {
            chain = chainRepository.findById(request.getChainId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chain not found with ID: " + request.getChainId()));
        }

        estimate.setClient(client);
        estimate.setChain(chain);
        estimate.setEstimateDate(request.getEstimateDate());
        estimate.setValidUntil(request.getValidUntil());
        if (request.getStatus() != null) estimate.setStatus(request.getStatus());
        estimate.setNotes(request.getNotes());

        BigDecimal gstRate = request.getGstRate() != null ? request.getGstRate() : estimate.getGstRate();
        estimate.setGstRate(gstRate);

        // Clear existing items and recalculate
        estimate.getItems().clear();
        populateAndCalculateEstimate(estimate, request.getItems(), gstRate);

        Estimate saved = estimateRepository.save(estimate);
        auditService.log("UPDATE_ESTIMATE", "ESTIMATE", saved.getEstimateId().toString(), 
                "Updated estimate: " + saved.getEstimateNumber());

        return EstimateDto.Response.fromEntity(saved);
    }

    @Transactional
    public EstimateDto.Response approveEstimate(Long id) {
        Estimate estimate = estimateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estimate not found with ID: " + id));

        if (estimate.getStatus() == Estimate.EstimateStatus.CONVERTED) {
            throw new BadRequestException("Cannot approve an estimate that is already converted to an invoice");
        }

        estimate.setStatus(Estimate.EstimateStatus.APPROVED);
        Estimate saved = estimateRepository.save(estimate);

        auditService.log("APPROVE_ESTIMATE", "ESTIMATE", saved.getEstimateId().toString(), 
                "Approved estimate: " + saved.getEstimateNumber());

        return EstimateDto.Response.fromEntity(saved);
    }

    @Transactional
    public EstimateDto.Response rejectEstimate(Long id) {
        Estimate estimate = estimateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estimate not found with ID: " + id));

        if (estimate.getStatus() == Estimate.EstimateStatus.CONVERTED) {
            throw new BadRequestException("Cannot reject an already converted estimate");
        }

        estimate.setStatus(Estimate.EstimateStatus.REJECTED);
        Estimate saved = estimateRepository.save(estimate);

        auditService.log("REJECT_ESTIMATE", "ESTIMATE", saved.getEstimateId().toString(), 
                "Rejected estimate: " + saved.getEstimateNumber());

        return EstimateDto.Response.fromEntity(saved);
    }

    @Transactional
    public InvoiceDto.Response convertToInvoice(Long id) {
        Estimate estimate = estimateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estimate not found with ID: " + id));

        if (estimate.getStatus() == Estimate.EstimateStatus.CONVERTED) {
            throw new BadRequestException("This estimate has already been converted to an invoice");
        }

        if (estimate.getStatus() == Estimate.EstimateStatus.REJECTED || estimate.getStatus() == Estimate.EstimateStatus.EXPIRED) {
            throw new BadRequestException("Cannot convert a " + estimate.getStatus() + " estimate to an invoice");
        }

        InvoiceDto.Response invoice = invoiceService.createInvoiceFromEstimate(estimate);

        estimate.setStatus(Estimate.EstimateStatus.CONVERTED);
        estimateRepository.save(estimate);

        auditService.log("CONVERT_ESTIMATE", "ESTIMATE", estimate.getEstimateId().toString(), 
                "Converted estimate " + estimate.getEstimateNumber() + " to invoice " + invoice.getInvoiceNumber());

        return invoice;
    }

    @Transactional
    public void deleteEstimate(Long id) {
        Estimate estimate = estimateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estimate not found with ID: " + id));

        User currentUser = auditService.getCurrentUser();
        if (currentUser != null && currentUser.getRole() != User.Role.ADMIN) {
            throw new BadRequestException("Only administrators can delete estimates");
        }

        if (estimate.getStatus() == Estimate.EstimateStatus.CONVERTED) {
            throw new BadRequestException("Cannot delete an estimate that has already been converted to an invoice");
        }

        auditService.log("DELETE_ESTIMATE", "ESTIMATE", estimate.getEstimateId().toString(), 
                "Deleted estimate: " + estimate.getEstimateNumber());

        estimateRepository.delete(estimate);
    }

    private void populateAndCalculateEstimate(Estimate estimate, List<EstimateDto.ItemRequest> itemRequests, BigDecimal gstRate) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;

        for (EstimateDto.ItemRequest ir : itemRequests) {
            BigDecimal qty = BigDecimal.valueOf(ir.getQuantity());
            BigDecimal grossLine = ir.getUnitPrice().multiply(qty).setScale(2, RoundingMode.HALF_UP);
            BigDecimal disc = ir.getDiscount() != null ? ir.getDiscount() : BigDecimal.ZERO;
            if (disc.compareTo(grossLine) > 0) {
                disc = grossLine;
            }
            BigDecimal taxableLine = grossLine.subtract(disc).setScale(2, RoundingMode.HALF_UP);
            BigDecimal taxLine = taxableLine.multiply(gstRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            BigDecimal totalLine = taxableLine.add(taxLine).setScale(2, RoundingMode.HALF_UP);

            EstimateItem item = EstimateItem.builder()
                    .description(ir.getDescription().trim())
                    .quantity(ir.getQuantity())
                    .unitPrice(ir.getUnitPrice().setScale(2, RoundingMode.HALF_UP))
                    .discount(disc)
                    .tax(taxLine)
                    .total(totalLine)
                    .build();

            estimate.addItem(item);
            subtotal = subtotal.add(grossLine);
            totalDiscount = totalDiscount.add(disc);
        }

        BigDecimal taxableAmount = subtotal.subtract(totalDiscount).setScale(2, RoundingMode.HALF_UP);
        BigDecimal gstAmount = taxableAmount.multiply(gstRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = taxableAmount.add(gstAmount).setScale(2, RoundingMode.HALF_UP);

        estimate.setSubtotal(subtotal);
        estimate.setDiscount(totalDiscount);
        estimate.setTaxableAmount(taxableAmount);
        estimate.setGst(gstAmount);
        estimate.setGrandTotal(grandTotal);
    }

    private String generateEstimateNumber() {
        int year = Year.now().getValue();
        long count = estimateRepository.count() + 1;
        String number;
        do {
            number = String.format("CB-EST-%d-%03d", year, count);
            count++;
        } while (estimateRepository.existsByEstimateNumber(number));
        return number;
    }

    private void checkAccess(Estimate estimate) {
        User currentUser = auditService.getCurrentUser();
        if (currentUser != null && currentUser.getRole() == User.Role.SALES_PERSON) {
            if (estimate.getSalesperson() != null && !estimate.getSalesperson().getUserId().equals(currentUser.getUserId())) {
                throw new BadRequestException("You do not have permission to view or manage this estimate");
            }
        }
    }
}

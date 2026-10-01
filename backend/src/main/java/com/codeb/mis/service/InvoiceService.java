package com.codeb.mis.service;

import com.codeb.mis.dto.InvoiceDto;
import com.codeb.mis.dto.PagedResponse;
import com.codeb.mis.entity.*;
import com.codeb.mis.exception.BadRequestException;
import com.codeb.mis.exception.ResourceNotFoundException;
import com.codeb.mis.repository.*;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ClientRepository clientRepository;
    private final ChainRepository chainRepository;
    private final EstimateRepository estimateRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final SettingService settingService;

    @Transactional(readOnly = true)
    public PagedResponse<InvoiceDto.Response> getInvoices(String search, Invoice.InvoiceStatus status,
                                                        Long clientId, Long salespersonId,
                                                        LocalDate startDate, LocalDate endDate,
                                                        int page, int size) {
        User currentUser = auditService.getCurrentUser();
        if (currentUser != null && currentUser.getRole() == User.Role.SALES_PERSON) {
            salespersonId = currentUser.getUserId();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("invoiceId").descending());
        Page<Invoice> pageResult = invoiceRepository.searchInvoices(
                search != null && !search.isBlank() ? search : null,
                status,
                clientId,
                salespersonId,
                startDate,
                endDate,
                pageable
        );
        return PagedResponse.from(pageResult.map(InvoiceDto.Response::fromEntity));
    }

    @Transactional(readOnly = true)
    public InvoiceDto.Response getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + id));

        checkAccess(invoice);
        return InvoiceDto.Response.fromEntity(invoice);
    }

    @Transactional
    public InvoiceDto.Response createInvoice(InvoiceDto.Request request) {
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with ID: " + request.getClientId()));

        Chain chain = null;
        if (request.getChainId() != null) {
            chain = chainRepository.findById(request.getChainId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chain not found with ID: " + request.getChainId()));
        } else if (client.getChain() != null) {
            chain = client.getChain();
        }

        Estimate estimate = null;
        if (request.getEstimateId() != null) {
            estimate = estimateRepository.findById(request.getEstimateId()).orElse(null);
        }

        User salesperson = auditService.getCurrentUser();
        if (salesperson == null) {
            salesperson = userRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new BadRequestException("No user found"));
        }

        BigDecimal gstRate = request.getGstRate() != null ? request.getGstRate() : settingService.getGstRate();

        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber())
                .client(client)
                .chain(chain)
                .estimate(estimate)
                .invoiceDate(request.getInvoiceDate())
                .dueDate(request.getDueDate())
                .salesperson(salesperson)
                .status(request.getStatus() != null ? request.getStatus() : Invoice.InvoiceStatus.ISSUED)
                .gstRate(gstRate)
                .notes(request.getNotes())
                .amountPaid(BigDecimal.ZERO)
                .items(new ArrayList<>())
                .build();

        populateAndCalculateInvoice(invoice, request.getItems(), gstRate);
        invoice.setBalanceDue(invoice.getTotalAmount());

        Invoice saved = invoiceRepository.save(invoice);
        auditService.log("CREATE_INVOICE", "INVOICE", saved.getInvoiceId().toString(), 
                "Created invoice " + saved.getInvoiceNumber() + " for client: " + client.getClientName());

        return InvoiceDto.Response.fromEntity(saved);
    }

    @Transactional
    public InvoiceDto.Response createInvoiceFromEstimate(Estimate estimate) {
        // Prevent duplicate invoice generation
        List<Invoice> existing = invoiceRepository.findByEstimateEstimateId(estimate.getEstimateId());
        if (!existing.isEmpty()) {
            return InvoiceDto.Response.fromEntity(existing.get(0));
        }

        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber())
                .client(estimate.getClient())
                .chain(estimate.getChain())
                .estimate(estimate)
                .invoiceDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(30))
                .salesperson(estimate.getSalesperson())
                .status(Invoice.InvoiceStatus.ISSUED)
                .subtotal(estimate.getSubtotal())
                .discount(estimate.getDiscount())
                .taxableAmount(estimate.getTaxableAmount())
                .gstRate(estimate.getGstRate())
                .gst(estimate.getGst())
                .totalAmount(estimate.getGrandTotal())
                .amountPaid(BigDecimal.ZERO)
                .balanceDue(estimate.getGrandTotal())
                .notes("Converted from Estimate " + estimate.getEstimateNumber() + ". " + (estimate.getNotes() != null ? estimate.getNotes() : ""))
                .items(new ArrayList<>())
                .build();

        for (EstimateItem ei : estimate.getItems()) {
            InvoiceItem item = InvoiceItem.builder()
                    .description(ei.getDescription())
                    .quantity(ei.getQuantity())
                    .unitPrice(ei.getUnitPrice())
                    .discount(ei.getDiscount())
                    .gst(ei.getTax())
                    .total(ei.getTotal())
                    .build();
            invoice.addItem(item);
        }

        Invoice saved = invoiceRepository.save(invoice);
        auditService.log("INVOICE_FROM_ESTIMATE", "INVOICE", saved.getInvoiceId().toString(), 
                "Generated invoice " + saved.getInvoiceNumber() + " from estimate " + estimate.getEstimateNumber());

        return InvoiceDto.Response.fromEntity(saved);
    }

    @Transactional
    public InvoiceDto.Response updateInvoice(Long id, InvoiceDto.Request request) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + id));

        checkAccess(invoice);

        if (invoice.getStatus() == Invoice.InvoiceStatus.PAID) {
            throw new BadRequestException("Cannot edit a fully paid invoice");
        }

        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with ID: " + request.getClientId()));

        Chain chain = null;
        if (request.getChainId() != null) {
            chain = chainRepository.findById(request.getChainId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chain not found with ID: " + request.getChainId()));
        }

        invoice.setClient(client);
        invoice.setChain(chain);
        invoice.setInvoiceDate(request.getInvoiceDate());
        invoice.setDueDate(request.getDueDate());
        if (request.getStatus() != null) invoice.setStatus(request.getStatus());
        invoice.setNotes(request.getNotes());

        BigDecimal gstRate = request.getGstRate() != null ? request.getGstRate() : invoice.getGstRate();
        invoice.setGstRate(gstRate);

        invoice.getItems().clear();
        populateAndCalculateInvoice(invoice, request.getItems(), gstRate);

        BigDecimal balance = invoice.getTotalAmount().subtract(invoice.getAmountPaid()).setScale(2, RoundingMode.HALF_UP);
        invoice.setBalanceDue(balance.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : balance);

        // Update status based on balance
        if (invoice.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
            if (invoice.getBalanceDue().compareTo(BigDecimal.ZERO) == 0) {
                invoice.setStatus(Invoice.InvoiceStatus.PAID);
            } else {
                invoice.setStatus(Invoice.InvoiceStatus.PARTIALLY_PAID);
            }
        }

        Invoice saved = invoiceRepository.save(invoice);
        auditService.log("UPDATE_INVOICE", "INVOICE", saved.getInvoiceId().toString(), 
                "Updated invoice: " + saved.getInvoiceNumber());

        return InvoiceDto.Response.fromEntity(saved);
    }

    @Transactional
    public InvoiceDto.Response cancelInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + id));

        if (invoice.getStatus() == Invoice.InvoiceStatus.PAID) {
            throw new BadRequestException("Cannot cancel a paid invoice");
        }

        invoice.setStatus(Invoice.InvoiceStatus.CANCELLED);
        Invoice saved = invoiceRepository.save(invoice);

        auditService.log("CANCEL_INVOICE", "INVOICE", saved.getInvoiceId().toString(), 
                "Cancelled invoice: " + saved.getInvoiceNumber());

        return InvoiceDto.Response.fromEntity(saved);
    }

    @Transactional
    public void deleteInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + id));

        User currentUser = auditService.getCurrentUser();
        if (currentUser != null && currentUser.getRole() != User.Role.ADMIN) {
            throw new BadRequestException("Only administrators can delete invoices");
        }

        if (invoice.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
            throw new BadRequestException("Cannot delete an invoice that has recorded payments. Please cancel it or delete payments first.");
        }

        auditService.log("DELETE_INVOICE", "INVOICE", invoice.getInvoiceId().toString(), 
                "Deleted invoice: " + invoice.getInvoiceNumber());

        invoiceRepository.delete(invoice);
    }

    @Transactional(readOnly = true)
    public byte[] generateInvoicePdf(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + invoiceId));

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 40, 40);
            PdfWriter.getInstance(document, out);
            document.open();

            // Font Styles
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(15, 23, 42)); // Slate 900
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(79, 70, 229)); // Indigo 600
            Font sectionHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new Color(51, 65, 85));
            Font regularFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(71, 85, 105));
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(15, 23, 42));
            Font tableHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
            Font tableBodyFont = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(30, 41, 59));

            // Top Header Table (Company info & Invoice badge)
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{60, 40});

            PdfPCell leftHeader = new PdfPCell();
            leftHeader.setBorder(Rectangle.NO_BORDER);
            leftHeader.addElement(new Paragraph("CODE-B", titleFont));
            leftHeader.addElement(new Paragraph("MANAGEMENT INFORMATION SYSTEM", subtitleFont));
            leftHeader.addElement(new Paragraph("GSTIN: 27AABCC9988K1Z5 | PAN: AABCC9988K", regularFont));
            leftHeader.addElement(new Paragraph("support@codeb.com | +91 98765 43210", regularFont));
            leftHeader.addElement(new Paragraph("Tower 4, Mindspace Tech Park, Mumbai, MH - 400051", regularFont));
            headerTable.addCell(leftHeader);

            PdfPCell rightHeader = new PdfPCell();
            rightHeader.setBorder(Rectangle.NO_BORDER);
            rightHeader.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph invTitle = new Paragraph("TAX INVOICE", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(79, 70, 229)));
            invTitle.setAlignment(Element.ALIGN_RIGHT);
            rightHeader.addElement(invTitle);

            Paragraph invNum = new Paragraph(invoice.getInvoiceNumber(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(15, 23, 42)));
            invNum.setAlignment(Element.ALIGN_RIGHT);
            rightHeader.addElement(invNum);

            Paragraph invDate = new Paragraph("Invoice Date: " + invoice.getInvoiceDate().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy")), regularFont);
            invDate.setAlignment(Element.ALIGN_RIGHT);
            rightHeader.addElement(invDate);

            Paragraph invDue = new Paragraph("Due Date: " + invoice.getDueDate().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy")), regularFont);
            invDue.setAlignment(Element.ALIGN_RIGHT);
            rightHeader.addElement(invDue);

            Paragraph invStatus = new Paragraph("Status: " + invoice.getStatus().name(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, 
                    invoice.getStatus() == Invoice.InvoiceStatus.PAID ? new Color(16, 185, 129) : new Color(245, 158, 11)));
            invStatus.setAlignment(Element.ALIGN_RIGHT);
            rightHeader.addElement(invStatus);

            headerTable.addCell(rightHeader);
            document.add(headerTable);

            document.add(new Paragraph(" ")); // blank line

            // Divider Line
            PdfPTable divider = new PdfPTable(1);
            divider.setWidthPercentage(100);
            PdfPCell lineCell = new PdfPCell();
            lineCell.setBorder(Rectangle.BOTTOM);
            lineCell.setBorderColor(new Color(226, 232, 240));
            lineCell.setFixedHeight(2);
            divider.addCell(lineCell);
            document.add(divider);

            document.add(new Paragraph(" "));

            // Bill To & Invoice Meta
            PdfPTable clientTable = new PdfPTable(2);
            clientTable.setWidthPercentage(100);
            clientTable.setWidths(new float[]{55, 45});

            PdfPCell billToCell = new PdfPCell();
            billToCell.setBorder(Rectangle.NO_BORDER);
            billToCell.addElement(new Paragraph("BILL TO:", sectionHeaderFont));
            Client c = invoice.getClient();
            billToCell.addElement(new Paragraph(c.getClientName(), boldFont));
            if (c.getContactPerson() != null) billToCell.addElement(new Paragraph("Attn: " + c.getContactPerson(), regularFont));
            if (c.getAddress() != null) billToCell.addElement(new Paragraph(c.getAddress() + ", " + (c.getCity() != null ? c.getCity() : "") + ", " + (c.getState() != null ? c.getState() : ""), regularFont));
            if (c.getGstin() != null) billToCell.addElement(new Paragraph("GSTIN: " + c.getGstin(), boldFont));
            if (c.getEmail() != null) billToCell.addElement(new Paragraph("Email: " + c.getEmail(), regularFont));
            if (c.getPhone() != null) billToCell.addElement(new Paragraph("Phone: " + c.getPhone(), regularFont));
            clientTable.addCell(billToCell);

            PdfPCell metaCell = new PdfPCell();
            metaCell.setBorder(Rectangle.NO_BORDER);
            metaCell.addElement(new Paragraph("SALES & REFERENCE DETAILS:", sectionHeaderFont));
            if (invoice.getSalesperson() != null) {
                metaCell.addElement(new Paragraph("Sales Representative: " + invoice.getSalesperson().getFullName(), regularFont));
            }
            if (invoice.getChain() != null) {
                metaCell.addElement(new Paragraph("Chain / Group: " + invoice.getChain().getChainName(), regularFont));
            }
            if (invoice.getEstimate() != null) {
                metaCell.addElement(new Paragraph("Estimate Ref: " + invoice.getEstimate().getEstimateNumber(), regularFont));
            }
            metaCell.addElement(new Paragraph("Place of Supply: " + (c.getState() != null ? c.getState() : "Maharashtra"), regularFont));
            clientTable.addCell(metaCell);

            document.add(clientTable);
            document.add(new Paragraph(" "));

            // Items Table
            PdfPTable itemsTable = new PdfPTable(6);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new float[]{6, 44, 10, 14, 12, 14});

            // Headers
            Color headerBg = new Color(79, 70, 229);
            String[] headers = {"#", "Description", "Qty", "Unit Price", "Discount", "Total (INR)"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, tableHeaderFont));
                cell.setBackgroundColor(headerBg);
                cell.setPadding(6);
                cell.setHorizontalAlignment(h.equals("Description") ? Element.ALIGN_LEFT : Element.ALIGN_RIGHT);
                itemsTable.addCell(cell);
            }

            int index = 1;
            for (InvoiceItem item : invoice.getItems()) {
                Color rowBg = (index % 2 == 0) ? new Color(248, 250, 252) : Color.WHITE;

                PdfPCell c1 = new PdfPCell(new Phrase(String.valueOf(index++), tableBodyFont));
                c1.setBackgroundColor(rowBg);
                c1.setHorizontalAlignment(Element.ALIGN_RIGHT);
                c1.setPadding(5);
                itemsTable.addCell(c1);

                PdfPCell c2 = new PdfPCell(new Phrase(item.getDescription(), tableBodyFont));
                c2.setBackgroundColor(rowBg);
                c2.setPadding(5);
                itemsTable.addCell(c2);

                PdfPCell c3 = new PdfPCell(new Phrase(String.valueOf(item.getQuantity()), tableBodyFont));
                c3.setBackgroundColor(rowBg);
                c3.setHorizontalAlignment(Element.ALIGN_RIGHT);
                c3.setPadding(5);
                itemsTable.addCell(c3);

                PdfPCell c4 = new PdfPCell(new Phrase(String.format("%,.2f", item.getUnitPrice()), tableBodyFont));
                c4.setBackgroundColor(rowBg);
                c4.setHorizontalAlignment(Element.ALIGN_RIGHT);
                c4.setPadding(5);
                itemsTable.addCell(c4);

                PdfPCell c5 = new PdfPCell(new Phrase(String.format("%,.2f", item.getDiscount()), tableBodyFont));
                c5.setBackgroundColor(rowBg);
                c5.setHorizontalAlignment(Element.ALIGN_RIGHT);
                c5.setPadding(5);
                itemsTable.addCell(c5);

                PdfPCell c6 = new PdfPCell(new Phrase(String.format("%,.2f", item.getTotal()), tableBodyFont));
                c6.setBackgroundColor(rowBg);
                c6.setHorizontalAlignment(Element.ALIGN_RIGHT);
                c6.setPadding(5);
                itemsTable.addCell(c6);
            }

            document.add(itemsTable);
            document.add(new Paragraph(" "));

            // Financial Summary & Bank Details
            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(100);
            summaryTable.setWidths(new float[]{55, 45});

            PdfPCell bankCell = new PdfPCell();
            bankCell.setBorder(Rectangle.NO_BORDER);
            bankCell.addElement(new Paragraph("BANK & PAYMENT DETAILS:", sectionHeaderFont));
            bankCell.addElement(new Paragraph("Bank Name: HDFC Bank Ltd", regularFont));
            bankCell.addElement(new Paragraph("Account Name: Code-B Solutions Pvt Ltd", regularFont));
            bankCell.addElement(new Paragraph("Account Number: 50200012345678", boldFont));
            bankCell.addElement(new Paragraph("IFSC Code: HDFC0000123", boldFont));
            bankCell.addElement(new Paragraph("UPI ID: codeb@hdfcbank", regularFont));
            if (invoice.getNotes() != null && !invoice.getNotes().isBlank()) {
                bankCell.addElement(new Paragraph(" "));
                bankCell.addElement(new Paragraph("Notes: " + invoice.getNotes(), regularFont));
            }
            summaryTable.addCell(bankCell);

            PdfPTable calcTable = new PdfPTable(2);
            calcTable.setWidthPercentage(100);
            calcTable.setWidths(new float[]{60, 40});

            addSummaryRow(calcTable, "Subtotal:", String.format("INR %,.2f", invoice.getSubtotal()), regularFont);
            addSummaryRow(calcTable, "Discount:", String.format("- INR %,.2f", invoice.getDiscount()), regularFont);
            addSummaryRow(calcTable, "Taxable Amount:", String.format("INR %,.2f", invoice.getTaxableAmount()), boldFont);
            addSummaryRow(calcTable, "GST (" + invoice.getGstRate() + "%):", String.format("INR %,.2f", invoice.getGst()), regularFont);
            addSummaryRow(calcTable, "Total Amount:", String.format("INR %,.2f", invoice.getTotalAmount()), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new Color(79, 70, 229)));
            addSummaryRow(calcTable, "Amount Paid:", String.format("INR %,.2f", invoice.getAmountPaid()), regularFont);
            addSummaryRow(calcTable, "Balance Due:", String.format("INR %,.2f", invoice.getBalanceDue()), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(220, 38, 38)));

            PdfPCell calcContainer = new PdfPCell(calcTable);
            calcContainer.setBorder(Rectangle.NO_BORDER);
            summaryTable.addCell(calcContainer);

            document.add(summaryTable);

            document.add(new Paragraph(" "));
            Paragraph footer = new Paragraph("Thank you for choosing Code-B! This is a computer-generated tax invoice and requires no physical signature.", 
                    FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, Color.GRAY));
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new BadRequestException("Failed to generate PDF: " + e.getMessage());
        }
    }

    private void addSummaryRow(PdfPTable table, String label, String value, Font font) {
        PdfPCell lCell = new PdfPCell(new Phrase(label, font));
        lCell.setBorder(Rectangle.NO_BORDER);
        lCell.setPadding(3);
        lCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(lCell);

        PdfPCell vCell = new PdfPCell(new Phrase(value, font));
        vCell.setBorder(Rectangle.NO_BORDER);
        vCell.setPadding(3);
        vCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(vCell);
    }

    private void populateAndCalculateInvoice(Invoice invoice, List<InvoiceDto.ItemRequest> itemRequests, BigDecimal gstRate) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;

        for (InvoiceDto.ItemRequest ir : itemRequests) {
            BigDecimal qty = BigDecimal.valueOf(ir.getQuantity());
            BigDecimal grossLine = ir.getUnitPrice().multiply(qty).setScale(2, RoundingMode.HALF_UP);
            BigDecimal disc = ir.getDiscount() != null ? ir.getDiscount() : BigDecimal.ZERO;
            if (disc.compareTo(grossLine) > 0) {
                disc = grossLine;
            }
            BigDecimal taxableLine = grossLine.subtract(disc).setScale(2, RoundingMode.HALF_UP);
            BigDecimal taxLine = taxableLine.multiply(gstRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            BigDecimal totalLine = taxableLine.add(taxLine).setScale(2, RoundingMode.HALF_UP);

            InvoiceItem item = InvoiceItem.builder()
                    .description(ir.getDescription().trim())
                    .quantity(ir.getQuantity())
                    .unitPrice(ir.getUnitPrice().setScale(2, RoundingMode.HALF_UP))
                    .discount(disc)
                    .gst(taxLine)
                    .total(totalLine)
                    .build();

            invoice.addItem(item);
            subtotal = subtotal.add(grossLine);
            totalDiscount = totalDiscount.add(disc);
        }

        BigDecimal taxableAmount = subtotal.subtract(totalDiscount).setScale(2, RoundingMode.HALF_UP);
        BigDecimal gstAmount = taxableAmount.multiply(gstRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = taxableAmount.add(gstAmount).setScale(2, RoundingMode.HALF_UP);

        invoice.setSubtotal(subtotal);
        invoice.setDiscount(totalDiscount);
        invoice.setTaxableAmount(taxableAmount);
        invoice.setGst(gstAmount);
        invoice.setTotalAmount(grandTotal);
    }

    private String generateInvoiceNumber() {
        int year = Year.now().getValue();
        long count = invoiceRepository.count() + 1;
        String number;
        do {
            number = String.format("CB-INV-%d-%03d", year, count);
            count++;
        } while (invoiceRepository.existsByInvoiceNumber(number));
        return number;
    }

    private void checkAccess(Invoice invoice) {
        User currentUser = auditService.getCurrentUser();
        if (currentUser != null && currentUser.getRole() == User.Role.SALES_PERSON) {
            if (invoice.getSalesperson() != null && !invoice.getSalesperson().getUserId().equals(currentUser.getUserId())) {
                throw new BadRequestException("You do not have permission to view or manage this invoice");
            }
        }
    }
}

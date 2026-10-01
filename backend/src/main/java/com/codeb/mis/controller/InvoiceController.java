package com.codeb.mis.controller;

import com.codeb.mis.dto.ApiResponse;
import com.codeb.mis.dto.InvoiceDto;
import com.codeb.mis.dto.PagedResponse;
import com.codeb.mis.entity.Invoice;
import com.codeb.mis.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Tag(name = "Invoice Management", description = "Invoice Generation, Tracking, and PDF APIs")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    @Operation(summary = "Get paginated invoices with search and filters")
    public ResponseEntity<ApiResponse<PagedResponse<InvoiceDto.Response>>> getInvoices(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Invoice.InvoiceStatus status,
            @RequestParam(required = false) Long clientId,
            @RequestParam(required = false) Long salespersonId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<InvoiceDto.Response> response = invoiceService.getInvoices(
                search, status, clientId, salespersonId, startDate, endDate, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get invoice by ID")
    public ResponseEntity<ApiResponse<InvoiceDto.Response>> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getInvoiceById(id)));
    }

    @PostMapping
    @Operation(summary = "Create invoice")
    public ResponseEntity<ApiResponse<InvoiceDto.Response>> createInvoice(@Valid @RequestBody InvoiceDto.Request request) {
        InvoiceDto.Response created = invoiceService.createInvoice(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Invoice created successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update invoice")
    public ResponseEntity<ApiResponse<InvoiceDto.Response>> updateInvoice(
            @PathVariable Long id,
            @Valid @RequestBody InvoiceDto.Request request) {
        InvoiceDto.Response updated = invoiceService.updateInvoice(id, request);
        return ResponseEntity.ok(ApiResponse.success("Invoice updated successfully", updated));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel invoice")
    public ResponseEntity<ApiResponse<InvoiceDto.Response>> cancelInvoice(@PathVariable Long id) {
        InvoiceDto.Response cancelled = invoiceService.cancelInvoice(id);
        return ResponseEntity.ok(ApiResponse.success("Invoice cancelled successfully", cancelled));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete invoice (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.ok(ApiResponse.success("Invoice deleted successfully", null));
    }

    @GetMapping("/{id}/pdf")
    @Operation(summary = "Download / Print professional Invoice PDF")
    public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable Long id) {
        byte[] pdfBytes = invoiceService.generateInvoicePdf(id);
        InvoiceDto.Response invoice = invoiceService.getInvoiceById(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", invoice.getInvoiceNumber() + ".pdf");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}

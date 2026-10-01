package com.codeb.mis.controller;

import com.codeb.mis.dto.ApiResponse;
import com.codeb.mis.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Business Reports and Data Export APIs")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/sales")
    @Operation(summary = "Get aggregated sales report")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSalesReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long clientId,
            @RequestParam(required = false) Long salespersonId) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getSalesReport(startDate, endDate, clientId, salespersonId)));
    }

    @GetMapping("/outstanding")
    @Operation(summary = "Get outstanding payments report")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOutstandingReport(
            @RequestParam(required = false) Long clientId) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getOutstandingReport(clientId)));
    }

    @GetMapping(value = "/export/invoices", produces = "text/csv")
    @Operation(summary = "Export invoices as CSV")
    public ResponseEntity<String> exportInvoicesCsv() {
        String csv = reportService.exportInvoicesCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"invoices-report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @GetMapping(value = "/export/estimates", produces = "text/csv")
    @Operation(summary = "Export estimates as CSV")
    public ResponseEntity<String> exportEstimatesCsv() {
        String csv = reportService.exportEstimatesCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"estimates-report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @GetMapping(value = "/export/payments", produces = "text/csv")
    @Operation(summary = "Export payments as CSV")
    public ResponseEntity<String> exportPaymentsCsv() {
        String csv = reportService.exportPaymentsCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"payments-report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @GetMapping(value = "/export/clients", produces = "text/csv")
    @Operation(summary = "Export clients as CSV")
    public ResponseEntity<String> exportClientsCsv() {
        String csv = reportService.exportClientsCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"clients-report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}

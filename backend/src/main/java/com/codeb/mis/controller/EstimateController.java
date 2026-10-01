package com.codeb.mis.controller;

import com.codeb.mis.dto.ApiResponse;
import com.codeb.mis.dto.EstimateDto;
import com.codeb.mis.dto.InvoiceDto;
import com.codeb.mis.dto.PagedResponse;
import com.codeb.mis.entity.Estimate;
import com.codeb.mis.service.EstimateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/estimates")
@RequiredArgsConstructor
@Tag(name = "Estimate Management", description = "Sales Estimate Workflow and Conversion APIs")
public class EstimateController {

    private final EstimateService estimateService;

    @GetMapping
    @Operation(summary = "Get paginated estimates with search and filters")
    public ResponseEntity<ApiResponse<PagedResponse<EstimateDto.Response>>> getEstimates(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Estimate.EstimateStatus status,
            @RequestParam(required = false) Long clientId,
            @RequestParam(required = false) Long salespersonId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<EstimateDto.Response> response = estimateService.getEstimates(
                search, status, clientId, salespersonId, startDate, endDate, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get estimate by ID")
    public ResponseEntity<ApiResponse<EstimateDto.Response>> getEstimateById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(estimateService.getEstimateById(id)));
    }

    @PostMapping
    @Operation(summary = "Create sales estimate")
    public ResponseEntity<ApiResponse<EstimateDto.Response>> createEstimate(@Valid @RequestBody EstimateDto.Request request) {
        EstimateDto.Response created = estimateService.createEstimate(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Estimate created successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update sales estimate")
    public ResponseEntity<ApiResponse<EstimateDto.Response>> updateEstimate(
            @PathVariable Long id,
            @Valid @RequestBody EstimateDto.Request request) {
        EstimateDto.Response updated = estimateService.updateEstimate(id, request);
        return ResponseEntity.ok(ApiResponse.success("Estimate updated successfully", updated));
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve sales estimate")
    public ResponseEntity<ApiResponse<EstimateDto.Response>> approveEstimate(@PathVariable Long id) {
        EstimateDto.Response approved = estimateService.approveEstimate(id);
        return ResponseEntity.ok(ApiResponse.success("Estimate approved successfully", approved));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject sales estimate")
    public ResponseEntity<ApiResponse<EstimateDto.Response>> rejectEstimate(@PathVariable Long id) {
        EstimateDto.Response rejected = estimateService.rejectEstimate(id);
        return ResponseEntity.ok(ApiResponse.success("Estimate marked as rejected", rejected));
    }

    @PostMapping("/{id}/convert-to-invoice")
    @Operation(summary = "Convert estimate directly to invoice")
    public ResponseEntity<ApiResponse<InvoiceDto.Response>> convertToInvoice(@PathVariable Long id) {
        InvoiceDto.Response invoice = estimateService.convertToInvoice(id);
        return ResponseEntity.ok(ApiResponse.success("Estimate successfully converted to invoice", invoice));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete estimate (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteEstimate(@PathVariable Long id) {
        estimateService.deleteEstimate(id);
        return ResponseEntity.ok(ApiResponse.success("Estimate deleted successfully", null));
    }
}

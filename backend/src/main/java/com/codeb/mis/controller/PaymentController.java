package com.codeb.mis.controller;

import com.codeb.mis.dto.ApiResponse;
import com.codeb.mis.dto.PagedResponse;
import com.codeb.mis.dto.PaymentDto;
import com.codeb.mis.entity.Payment;
import com.codeb.mis.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payment Management", description = "Payment Recording and Status Tracking APIs")
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    @Operation(summary = "Get paginated payments with search and filters")
    public ResponseEntity<ApiResponse<PagedResponse<PaymentDto.Response>>> getPayments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Payment.PaymentStatus status,
            @RequestParam(required = false) Long clientId,
            @RequestParam(required = false) Long invoiceId,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long salespersonId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<PaymentDto.Response> response = paymentService.getPayments(
                search, status, clientId, invoiceId, paymentMethod, startDate, endDate, salespersonId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment by ID")
    public ResponseEntity<ApiResponse<PaymentDto.Response>> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPaymentById(id)));
    }

    @GetMapping("/invoice/{invoiceId}")
    @Operation(summary = "Get all payments recorded for an invoice")
    public ResponseEntity<ApiResponse<List<PaymentDto.Response>>> getPaymentsByInvoice(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPaymentsByInvoice(invoiceId)));
    }

    @PostMapping
    @Operation(summary = "Record a new payment for an invoice")
    public ResponseEntity<ApiResponse<PaymentDto.Response>> recordPayment(@Valid @RequestBody PaymentDto.Request request) {
        PaymentDto.Response created = paymentService.recordPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Payment recorded successfully", created));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update payment status (e.g. mark REFUNDED or FAILED)")
    public ResponseEntity<ApiResponse<PaymentDto.Response>> updateStatus(
            @PathVariable Long id,
            @RequestParam Payment.PaymentStatus status) {
        PaymentDto.Response updated = paymentService.updatePaymentStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Payment status updated to " + status, updated));
    }
}

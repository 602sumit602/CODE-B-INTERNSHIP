package com.codeb.mis.controller;

import com.codeb.mis.dto.*;
import com.codeb.mis.entity.Client;
import com.codeb.mis.service.ClientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@Tag(name = "Client Management", description = "Client CRUD and relationship APIs")
public class ClientController {

    private final ClientService clientService;

    @GetMapping
    @Operation(summary = "Get clients with search, filtering, and pagination")
    public ResponseEntity<ApiResponse<PagedResponse<ClientDto.Response>>> getClients(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long groupId,
            @RequestParam(required = false) Long chainId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) Long subzoneId,
            @RequestParam(required = false) Client.Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<ClientDto.Response> response = clientService.getClients(search, groupId, chainId, brandId, subzoneId, status, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/active")
    @Operation(summary = "Get all active clients for dropdowns")
    public ResponseEntity<ApiResponse<List<ClientDto.Response>>> getActiveClients() {
        return ResponseEntity.ok(ApiResponse.success(clientService.getActiveClients()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get client by ID")
    public ResponseEntity<ApiResponse<ClientDto.Response>> getClientById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(clientService.getClientById(id)));
    }

    @PostMapping
    @Operation(summary = "Create client")
    public ResponseEntity<ApiResponse<ClientDto.Response>> createClient(@Valid @RequestBody ClientDto.Request request) {
        ClientDto.Response created = clientService.createClient(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Client created successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update client")
    public ResponseEntity<ApiResponse<ClientDto.Response>> updateClient(
            @PathVariable Long id,
            @Valid @RequestBody ClientDto.Request request) {
        ClientDto.Response updated = clientService.updateClient(id, request);
        return ResponseEntity.ok(ApiResponse.success("Client updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete client")
    public ResponseEntity<ApiResponse<Void>> deleteClient(@PathVariable Long id) {
        clientService.deleteClient(id);
        return ResponseEntity.ok(ApiResponse.success("Client deleted successfully", null));
    }

    @GetMapping("/{id}/estimates")
    @Operation(summary = "Get all estimates for a specific client")
    public ResponseEntity<ApiResponse<List<EstimateDto.Response>>> getClientEstimates(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(clientService.getClientEstimates(id)));
    }

    @GetMapping("/{id}/invoices")
    @Operation(summary = "Get all invoices for a specific client")
    public ResponseEntity<ApiResponse<List<InvoiceDto.Response>>> getClientInvoices(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(clientService.getClientInvoices(id)));
    }

    @GetMapping("/{id}/payments")
    @Operation(summary = "Get all payments for a specific client")
    public ResponseEntity<ApiResponse<List<PaymentDto.Response>>> getClientPayments(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(clientService.getClientPayments(id)));
    }
}

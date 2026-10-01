package com.codeb.mis.dto;

import com.codeb.mis.entity.Invoice;
import com.codeb.mis.entity.InvoiceItem;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class InvoiceDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long invoiceId;
        private String invoiceNumber;
        private Long clientId;
        private String clientName;
        private String clientGstin;
        private String clientEmail;
        private String clientPhone;
        private String clientAddress;
        private String clientCity;
        private String clientState;

        private Long chainId;
        private String chainName;

        private Long estimateId;
        private String estimateNumber;

        private LocalDate invoiceDate;
        private LocalDate dueDate;

        private Long salespersonId;
        private String salespersonName;

        private BigDecimal subtotal;
        private BigDecimal discount;
        private BigDecimal taxableAmount;
        private BigDecimal gstRate;
        private BigDecimal gst;
        private BigDecimal totalAmount;
        private BigDecimal amountPaid;
        private BigDecimal balanceDue;

        private Invoice.InvoiceStatus status;
        private String notes;

        @Builder.Default
        private List<ItemResponse> items = new ArrayList<>();

        @Builder.Default
        private List<PaymentDto.Response> payments = new ArrayList<>();

        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response fromEntity(Invoice invoice) {
            if (invoice == null) return null;
            return Response.builder()
                    .invoiceId(invoice.getInvoiceId())
                    .invoiceNumber(invoice.getInvoiceNumber())
                    .clientId(invoice.getClient() != null ? invoice.getClient().getClientId() : null)
                    .clientName(invoice.getClient() != null ? invoice.getClient().getClientName() : null)
                    .clientGstin(invoice.getClient() != null ? invoice.getClient().getGstin() : null)
                    .clientEmail(invoice.getClient() != null ? invoice.getClient().getEmail() : null)
                    .clientPhone(invoice.getClient() != null ? invoice.getClient().getPhone() : null)
                    .clientAddress(invoice.getClient() != null ? invoice.getClient().getAddress() : null)
                    .clientCity(invoice.getClient() != null ? invoice.getClient().getCity() : null)
                    .clientState(invoice.getClient() != null ? invoice.getClient().getState() : null)
                    .chainId(invoice.getChain() != null ? invoice.getChain().getChainId() : null)
                    .chainName(invoice.getChain() != null ? invoice.getChain().getChainName() : null)
                    .estimateId(invoice.getEstimate() != null ? invoice.getEstimate().getEstimateId() : null)
                    .estimateNumber(invoice.getEstimate() != null ? invoice.getEstimate().getEstimateNumber() : null)
                    .invoiceDate(invoice.getInvoiceDate())
                    .dueDate(invoice.getDueDate())
                    .salespersonId(invoice.getSalesperson() != null ? invoice.getSalesperson().getUserId() : null)
                    .salespersonName(invoice.getSalesperson() != null ? invoice.getSalesperson().getFullName() : null)
                    .subtotal(invoice.getSubtotal())
                    .discount(invoice.getDiscount())
                    .taxableAmount(invoice.getTaxableAmount())
                    .gstRate(invoice.getGstRate())
                    .gst(invoice.getGst())
                    .totalAmount(invoice.getTotalAmount())
                    .amountPaid(invoice.getAmountPaid())
                    .balanceDue(invoice.getBalanceDue())
                    .status(invoice.getStatus())
                    .notes(invoice.getNotes())
                    .items(invoice.getItems() != null ? invoice.getItems().stream().map(ItemResponse::fromEntity).collect(Collectors.toList()) : new ArrayList<>())
                    .payments(invoice.getPayments() != null ? invoice.getPayments().stream().map(PaymentDto.Response::fromEntity).collect(Collectors.toList()) : new ArrayList<>())
                    .createdAt(invoice.getCreatedAt())
                    .updatedAt(invoice.getUpdatedAt())
                    .build();
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemResponse {
        private Long invoiceItemId;
        private String description;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal discount;
        private BigDecimal gst;
        private BigDecimal total;

        public static ItemResponse fromEntity(InvoiceItem item) {
            if (item == null) return null;
            return ItemResponse.builder()
                    .invoiceItemId(item.getInvoiceItemId())
                    .description(item.getDescription())
                    .quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice())
                    .discount(item.getDiscount())
                    .gst(item.getGst())
                    .total(item.getTotal())
                    .build();
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        @NotNull(message = "Client is required")
        private Long clientId;

        private Long chainId;
        private Long estimateId;

        @NotNull(message = "Invoice date is required")
        private LocalDate invoiceDate;

        @NotNull(message = "Due date is required")
        private LocalDate dueDate;

        private Invoice.InvoiceStatus status = Invoice.InvoiceStatus.ISSUED;

        private BigDecimal gstRate = new BigDecimal("18.00");
        private String notes;

        @NotEmpty(message = "At least one item is required in invoice")
        @Valid
        private List<ItemRequest> items;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemRequest {
        @NotBlank(message = "Description is required")
        private String description;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;

        @NotNull(message = "Unit price is required")
        @DecimalMin(value = "0.00", message = "Unit price must be non-negative")
        private BigDecimal unitPrice;

        private BigDecimal discount = BigDecimal.ZERO;
    }
}

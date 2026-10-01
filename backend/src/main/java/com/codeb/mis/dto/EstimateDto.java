package com.codeb.mis.dto;

import com.codeb.mis.entity.Estimate;
import com.codeb.mis.entity.EstimateItem;
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

public class EstimateDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long estimateId;
        private String estimateNumber;
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

        private LocalDate estimateDate;
        private LocalDate validUntil;

        private Long salespersonId;
        private String salespersonName;

        private Estimate.EstimateStatus status;
        private BigDecimal subtotal;
        private BigDecimal discount;
        private BigDecimal taxableAmount;
        private BigDecimal gstRate;
        private BigDecimal gst;
        private BigDecimal grandTotal;
        private String notes;

        @Builder.Default
        private List<ItemResponse> items = new ArrayList<>();
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response fromEntity(Estimate estimate) {
            if (estimate == null) return null;
            return Response.builder()
                    .estimateId(estimate.getEstimateId())
                    .estimateNumber(estimate.getEstimateNumber())
                    .clientId(estimate.getClient() != null ? estimate.getClient().getClientId() : null)
                    .clientName(estimate.getClient() != null ? estimate.getClient().getClientName() : null)
                    .clientGstin(estimate.getClient() != null ? estimate.getClient().getGstin() : null)
                    .clientEmail(estimate.getClient() != null ? estimate.getClient().getEmail() : null)
                    .clientPhone(estimate.getClient() != null ? estimate.getClient().getPhone() : null)
                    .clientAddress(estimate.getClient() != null ? estimate.getClient().getAddress() : null)
                    .clientCity(estimate.getClient() != null ? estimate.getClient().getCity() : null)
                    .clientState(estimate.getClient() != null ? estimate.getClient().getState() : null)
                    .chainId(estimate.getChain() != null ? estimate.getChain().getChainId() : null)
                    .chainName(estimate.getChain() != null ? estimate.getChain().getChainName() : null)
                    .estimateDate(estimate.getEstimateDate())
                    .validUntil(estimate.getValidUntil())
                    .salespersonId(estimate.getSalesperson() != null ? estimate.getSalesperson().getUserId() : null)
                    .salespersonName(estimate.getSalesperson() != null ? estimate.getSalesperson().getFullName() : null)
                    .status(estimate.getStatus())
                    .subtotal(estimate.getSubtotal())
                    .discount(estimate.getDiscount())
                    .taxableAmount(estimate.getTaxableAmount())
                    .gstRate(estimate.getGstRate())
                    .gst(estimate.getGst())
                    .grandTotal(estimate.getGrandTotal())
                    .notes(estimate.getNotes())
                    .items(estimate.getItems() != null ? estimate.getItems().stream().map(ItemResponse::fromEntity).collect(Collectors.toList()) : new ArrayList<>())
                    .createdAt(estimate.getCreatedAt())
                    .updatedAt(estimate.getUpdatedAt())
                    .build();
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemResponse {
        private Long itemId;
        private String description;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal discount;
        private BigDecimal tax;
        private BigDecimal total;

        public static ItemResponse fromEntity(EstimateItem item) {
            if (item == null) return null;
            return ItemResponse.builder()
                    .itemId(item.getItemId())
                    .description(item.getDescription())
                    .quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice())
                    .discount(item.getDiscount())
                    .tax(item.getTax())
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

        @NotNull(message = "Estimate date is required")
        private LocalDate estimateDate;

        @NotNull(message = "Valid until date is required")
        private LocalDate validUntil;

        private Estimate.EstimateStatus status = Estimate.EstimateStatus.DRAFT;

        private BigDecimal gstRate = new BigDecimal("18.00");
        private String notes;

        @NotEmpty(message = "At least one item is required in estimate")
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

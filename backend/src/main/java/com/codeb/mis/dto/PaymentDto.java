package com.codeb.mis.dto;

import com.codeb.mis.entity.Payment;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PaymentDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long paymentId;
        private Long invoiceId;
        private String invoiceNumber;
        private Long clientId;
        private String clientName;
        private LocalDate paymentDate;
        private String paymentReference;
        private String paymentMethod;
        private BigDecimal amount;
        private Payment.PaymentStatus status;
        private String notes;
        private Long recordedById;
        private String recordedByName;
        private LocalDateTime createdAt;

        public static Response fromEntity(Payment payment) {
            if (payment == null) return null;
            return Response.builder()
                    .paymentId(payment.getPaymentId())
                    .invoiceId(payment.getInvoice() != null ? payment.getInvoice().getInvoiceId() : null)
                    .invoiceNumber(payment.getInvoice() != null ? payment.getInvoice().getInvoiceNumber() : null)
                    .clientId(payment.getClient() != null ? payment.getClient().getClientId() : null)
                    .clientName(payment.getClient() != null ? payment.getClient().getClientName() : null)
                    .paymentDate(payment.getPaymentDate())
                    .paymentReference(payment.getPaymentReference())
                    .paymentMethod(payment.getPaymentMethod())
                    .amount(payment.getAmount())
                    .status(payment.getStatus())
                    .notes(payment.getNotes())
                    .recordedById(payment.getRecordedBy() != null ? payment.getRecordedBy().getUserId() : null)
                    .recordedByName(payment.getRecordedBy() != null ? payment.getRecordedBy().getFullName() : null)
                    .createdAt(payment.getCreatedAt())
                    .build();
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        @NotNull(message = "Invoice is required")
        private Long invoiceId;

        @NotNull(message = "Payment date is required")
        private LocalDate paymentDate;

        private String paymentReference;

        @NotBlank(message = "Payment method is required")
        private String paymentMethod;

        @NotNull(message = "Payment amount is required")
        @DecimalMin(value = "0.01", message = "Payment amount must be greater than zero")
        private BigDecimal amount;

        private Payment.PaymentStatus status = Payment.PaymentStatus.SUCCESS;
        private String notes;
    }
}

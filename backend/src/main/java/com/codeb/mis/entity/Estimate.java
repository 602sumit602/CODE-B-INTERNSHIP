package com.codeb.mis.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "estimates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Estimate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "estimate_id")
    private Long estimateId;

    @Column(name = "estimate_number", nullable = false, unique = true, length = 50)
    private String estimateNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "chain_id")
    private Chain chain;

    @Column(name = "estimate_date", nullable = false)
    private LocalDate estimateDate;

    @Column(name = "valid_until", nullable = false)
    private LocalDate validUntil;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "salesperson_id", nullable = false)
    private User salesperson;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private EstimateStatus status = EstimateStatus.DRAFT;

    @Column(name = "subtotal", nullable = false, precision = 15, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "discount", nullable = false, precision = 15, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(name = "taxable_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal taxableAmount = BigDecimal.ZERO;

    @Column(name = "gst_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal gstRate = new BigDecimal("18.00");

    @Column(name = "gst", nullable = false, precision = 15, scale = 2)
    private BigDecimal gst = BigDecimal.ZERO;

    @Column(name = "grand_total", nullable = false, precision = 15, scale = 2)
    private BigDecimal grandTotal = BigDecimal.ZERO;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "estimate", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    @Builder.Default
    private List<EstimateItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum EstimateStatus {
        DRAFT,
        SENT,
        APPROVED,
        REJECTED,
        EXPIRED,
        CONVERTED
    }

    public void addItem(EstimateItem item) {
        items.add(item);
        item.setEstimate(this);
    }

    public void removeItem(EstimateItem item) {
        items.remove(item);
        item.setEstimate(null);
    }
}

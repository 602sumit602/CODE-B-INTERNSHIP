package com.codeb.mis.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDto {

    private long totalClients;
    private long activeClients;
    private long totalGroups;
    private long totalChains;
    private long totalBrands;
    private long totalSubzones;

    private long totalEstimates;
    private long pendingEstimates;
    private long approvedEstimates;
    private long convertedEstimates;

    private long totalInvoices;
    private long paidInvoices;
    private long pendingInvoices;
    private long overdueInvoices;

    private BigDecimal totalSales;
    private BigDecimal totalCollected;
    private BigDecimal totalOutstanding;

    @Builder.Default
    private List<MonthlySalesItem> monthlySales = new ArrayList<>();

    @Builder.Default
    private Map<String, Long> invoiceStatusDistribution = Map.of();

    @Builder.Default
    private Map<String, Long> estimateStatusDistribution = Map.of();

    @Builder.Default
    private Map<String, Long> paymentMethodDistribution = Map.of();

    @Builder.Default
    private List<RecentActivityItem> recentActivities = new ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlySalesItem {
        private String month;
        private BigDecimal sales;
        private BigDecimal collected;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentActivityItem {
        private Long logId;
        private String username;
        private String action;
        private String module;
        private String recordId;
        private String details;
        private String timestamp;
    }
}

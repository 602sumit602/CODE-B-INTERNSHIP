package com.codeb.mis.controller;

import com.codeb.mis.dto.ApiResponse;
import com.codeb.mis.dto.DashboardDto;
import com.codeb.mis.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Business Dashboard, Analytics, and KPI metrics")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @Operation(summary = "Get aggregated dashboard statistics, KPIs, and chart data")
    public ResponseEntity<ApiResponse<DashboardDto>> getDashboardSummary() {
        DashboardDto summary = dashboardService.getDashboardSummary();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}

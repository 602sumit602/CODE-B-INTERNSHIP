package com.codeb.mis.controller;

import com.codeb.mis.dto.ApiResponse;
import com.codeb.mis.dto.AuditLogDto;
import com.codeb.mis.dto.PagedResponse;
import com.codeb.mis.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "System Audit Trail and User Actions")
public class AuditLogController {

    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get paginated system audit logs (Admin only)")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLogDto>>> getAuditLogs(
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        PagedResponse<AuditLogDto> response = auditService.getAuditLogs(module, search, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

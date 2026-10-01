package com.codeb.mis.controller;

import com.codeb.mis.dto.ApiResponse;
import com.codeb.mis.dto.SettingDto;
import com.codeb.mis.service.SettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@Tag(name = "Settings Management", description = "System Settings and Configurations")
public class SettingController {

    private final SettingService settingService;

    @GetMapping
    @Operation(summary = "Get all system settings")
    public ResponseEntity<ApiResponse<List<SettingDto>>> getSettings() {
        return ResponseEntity.ok(ApiResponse.success(settingService.getAllSettings()));
    }

    @PutMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update system setting (Admin only)")
    public ResponseEntity<ApiResponse<SettingDto>> updateSetting(
            @PathVariable String key,
            @RequestBody SettingDto dto) {
        SettingDto updated = settingService.updateSetting(key, dto.getSettingValue(), dto.getDescription());
        return ResponseEntity.ok(ApiResponse.success("Setting updated successfully", updated));
    }
}

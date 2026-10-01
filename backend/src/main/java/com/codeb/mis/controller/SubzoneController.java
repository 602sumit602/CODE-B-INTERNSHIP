package com.codeb.mis.controller;

import com.codeb.mis.dto.ApiResponse;
import com.codeb.mis.dto.PagedResponse;
import com.codeb.mis.dto.SubzoneDto;
import com.codeb.mis.entity.Subzone;
import com.codeb.mis.service.SubzoneService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subzones")
@RequiredArgsConstructor
@Tag(name = "Subzone Management", description = "Subzone CRUD APIs")
public class SubzoneController {

    private final SubzoneService subzoneService;

    @GetMapping
    @Operation(summary = "Get paginated subzones with search & filter")
    public ResponseEntity<ApiResponse<PagedResponse<SubzoneDto.Response>>> getSubzones(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) Subzone.Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<SubzoneDto.Response> response = subzoneService.getSubzones(search, region, status, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/active")
    @Operation(summary = "Get all active subzones for dropdowns")
    public ResponseEntity<ApiResponse<List<SubzoneDto.Response>>> getActiveSubzones() {
        return ResponseEntity.ok(ApiResponse.success(subzoneService.getActiveSubzones()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get subzone by ID")
    public ResponseEntity<ApiResponse<SubzoneDto.Response>> getSubzoneById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(subzoneService.getSubzoneById(id)));
    }

    @PostMapping
    @Operation(summary = "Create subzone")
    public ResponseEntity<ApiResponse<SubzoneDto.Response>> createSubzone(@Valid @RequestBody SubzoneDto.Request request) {
        SubzoneDto.Response created = subzoneService.createSubzone(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Subzone created successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update subzone")
    public ResponseEntity<ApiResponse<SubzoneDto.Response>> updateSubzone(
            @PathVariable Long id,
            @Valid @RequestBody SubzoneDto.Request request) {
        SubzoneDto.Response updated = subzoneService.updateSubzone(id, request);
        return ResponseEntity.ok(ApiResponse.success("Subzone updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete subzone")
    public ResponseEntity<ApiResponse<Void>> deleteSubzone(@PathVariable Long id) {
        subzoneService.deleteSubzone(id);
        return ResponseEntity.ok(ApiResponse.success("Subzone deleted successfully", null));
    }
}

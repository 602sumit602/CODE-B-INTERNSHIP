package com.codeb.mis.controller;

import com.codeb.mis.dto.ApiResponse;
import com.codeb.mis.dto.BrandDto;
import com.codeb.mis.dto.PagedResponse;
import com.codeb.mis.entity.Brand;
import com.codeb.mis.service.BrandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
@Tag(name = "Brand Management", description = "Brand CRUD APIs")
public class BrandController {

    private final BrandService brandService;

    @GetMapping
    @Operation(summary = "Get paginated brands with search & filter")
    public ResponseEntity<ApiResponse<PagedResponse<BrandDto.Response>>> getBrands(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long chainId,
            @RequestParam(required = false) Brand.Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<BrandDto.Response> response = brandService.getBrands(search, chainId, status, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/active")
    @Operation(summary = "Get all active brands for dropdowns")
    public ResponseEntity<ApiResponse<List<BrandDto.Response>>> getActiveBrands() {
        return ResponseEntity.ok(ApiResponse.success(brandService.getActiveBrands()));
    }

    @GetMapping("/by-chain/{chainId}")
    @Operation(summary = "Get brands by chain ID")
    public ResponseEntity<ApiResponse<List<BrandDto.Response>>> getBrandsByChain(@PathVariable Long chainId) {
        return ResponseEntity.ok(ApiResponse.success(brandService.getBrandsByChain(chainId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get brand by ID")
    public ResponseEntity<ApiResponse<BrandDto.Response>> getBrandById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(brandService.getBrandById(id)));
    }

    @PostMapping
    @Operation(summary = "Create brand")
    public ResponseEntity<ApiResponse<BrandDto.Response>> createBrand(@Valid @RequestBody BrandDto.Request request) {
        BrandDto.Response created = brandService.createBrand(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Brand created successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update brand")
    public ResponseEntity<ApiResponse<BrandDto.Response>> updateBrand(
            @PathVariable Long id,
            @Valid @RequestBody BrandDto.Request request) {
        BrandDto.Response updated = brandService.updateBrand(id, request);
        return ResponseEntity.ok(ApiResponse.success("Brand updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete brand")
    public ResponseEntity<ApiResponse<Void>> deleteBrand(@PathVariable Long id) {
        brandService.deleteBrand(id);
        return ResponseEntity.ok(ApiResponse.success("Brand deleted successfully", null));
    }
}

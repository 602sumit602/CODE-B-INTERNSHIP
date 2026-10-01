package com.codeb.mis.controller;

import com.codeb.mis.dto.ApiResponse;
import com.codeb.mis.dto.ChainDto;
import com.codeb.mis.dto.PagedResponse;
import com.codeb.mis.entity.Chain;
import com.codeb.mis.service.ChainService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chains")
@RequiredArgsConstructor
@Tag(name = "Chain Management", description = "Chain CRUD APIs")
public class ChainController {

    private final ChainService chainService;

    @GetMapping
    @Operation(summary = "Get paginated chains with search & filter")
    public ResponseEntity<ApiResponse<PagedResponse<ChainDto.Response>>> getChains(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long groupId,
            @RequestParam(required = false) Chain.Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<ChainDto.Response> response = chainService.getChains(search, groupId, status, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/active")
    @Operation(summary = "Get all active chains for dropdowns")
    public ResponseEntity<ApiResponse<List<ChainDto.Response>>> getActiveChains() {
        return ResponseEntity.ok(ApiResponse.success(chainService.getActiveChains()));
    }

    @GetMapping("/by-group/{groupId}")
    @Operation(summary = "Get chains by group ID")
    public ResponseEntity<ApiResponse<List<ChainDto.Response>>> getChainsByGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(ApiResponse.success(chainService.getChainsByGroup(groupId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get chain by ID")
    public ResponseEntity<ApiResponse<ChainDto.Response>> getChainById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(chainService.getChainById(id)));
    }

    @PostMapping
    @Operation(summary = "Create chain")
    public ResponseEntity<ApiResponse<ChainDto.Response>> createChain(@Valid @RequestBody ChainDto.Request request) {
        ChainDto.Response created = chainService.createChain(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Chain created successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update chain")
    public ResponseEntity<ApiResponse<ChainDto.Response>> updateChain(
            @PathVariable Long id,
            @Valid @RequestBody ChainDto.Request request) {
        ChainDto.Response updated = chainService.updateChain(id, request);
        return ResponseEntity.ok(ApiResponse.success("Chain updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete chain")
    public ResponseEntity<ApiResponse<Void>> deleteChain(@PathVariable Long id) {
        chainService.deleteChain(id);
        return ResponseEntity.ok(ApiResponse.success("Chain deleted successfully", null));
    }
}

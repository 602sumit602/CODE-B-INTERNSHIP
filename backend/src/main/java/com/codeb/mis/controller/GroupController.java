package com.codeb.mis.controller;

import com.codeb.mis.dto.ApiResponse;
import com.codeb.mis.dto.GroupDto;
import com.codeb.mis.dto.PagedResponse;
import com.codeb.mis.entity.Group;
import com.codeb.mis.service.GroupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
@Tag(name = "Group Management", description = "Group CRUD APIs")
public class GroupController {

    private final GroupService groupService;

    @GetMapping
    @Operation(summary = "Get paginated groups with search & filter")
    public ResponseEntity<ApiResponse<PagedResponse<GroupDto.Response>>> getGroups(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Group.Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<GroupDto.Response> response = groupService.getGroups(search, status, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/active")
    @Operation(summary = "Get all active groups for dropdowns")
    public ResponseEntity<ApiResponse<List<GroupDto.Response>>> getActiveGroups() {
        return ResponseEntity.ok(ApiResponse.success(groupService.getActiveGroups()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get group by ID")
    public ResponseEntity<ApiResponse<GroupDto.Response>> getGroupById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(groupService.getGroupById(id)));
    }

    @PostMapping
    @Operation(summary = "Create group")
    public ResponseEntity<ApiResponse<GroupDto.Response>> createGroup(@Valid @RequestBody GroupDto.Request request) {
        GroupDto.Response created = groupService.createGroup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Group created successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update group")
    public ResponseEntity<ApiResponse<GroupDto.Response>> updateGroup(
            @PathVariable Long id,
            @Valid @RequestBody GroupDto.Request request) {
        GroupDto.Response updated = groupService.updateGroup(id, request);
        return ResponseEntity.ok(ApiResponse.success("Group updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete group")
    public ResponseEntity<ApiResponse<Void>> deleteGroup(@PathVariable Long id) {
        groupService.deleteGroup(id);
        return ResponseEntity.ok(ApiResponse.success("Group deleted successfully", null));
    }
}

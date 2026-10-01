package com.codeb.mis.controller;

import com.codeb.mis.dto.ApiResponse;
import com.codeb.mis.dto.PagedResponse;
import com.codeb.mis.dto.UserDto;
import com.codeb.mis.entity.User;
import com.codeb.mis.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "User Management", description = "Admin-only User Management APIs")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get paginated users with search & filters")
    public ResponseEntity<ApiResponse<PagedResponse<UserDto.Response>>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) User.Role role,
            @RequestParam(required = false) User.Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<UserDto.Response> response = userService.getUsers(search, role, status, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse<UserDto.Response>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @PostMapping
    @Operation(summary = "Create a new user")
    public ResponseEntity<ApiResponse<UserDto.Response>> createUser(@Valid @RequestBody UserDto.CreateRequest request) {
        UserDto.Response created = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("User created successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing user")
    public ResponseEntity<ApiResponse<UserDto.Response>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserDto.UpdateRequest request) {
        UserDto.Response updated = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updated));
    }

    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Toggle user status between ACTIVE and INACTIVE")
    public ResponseEntity<ApiResponse<UserDto.Response>> toggleUserStatus(@PathVariable Long id) {
        UserDto.Response updated = userService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.success("User status changed to " + updated.getStatus(), updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }
}

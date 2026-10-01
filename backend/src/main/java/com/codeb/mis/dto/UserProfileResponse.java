package com.codeb.mis.dto;

import com.codeb.mis.entity.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

public class UserProfileResponse {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long userId;
        private String fullName;
        private String email;
        private User.Role role;
        private User.Status status;
        private String phone;
        private String department;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChangePassword {
        @NotBlank(message = "Current password is required")
        private String currentPassword;

        @NotBlank(message = "New password is required")
        @Size(min = 6, max = 50, message = "Password must be at least 6 characters")
        private String newPassword;

        @NotBlank(message = "Confirm password is required")
        private String confirmPassword;
    }
}

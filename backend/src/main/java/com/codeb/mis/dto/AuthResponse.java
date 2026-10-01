package com.codeb.mis.dto;

import com.codeb.mis.entity.User;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    @Builder.Default
    private String type = "Bearer";
    private Long userId;
    private String fullName;
    private String email;
    private User.Role role;
    private User.Status status;
    private String phone;
    private String department;
}

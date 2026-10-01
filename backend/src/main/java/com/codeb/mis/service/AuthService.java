package com.codeb.mis.service;

import com.codeb.mis.dto.*;
import com.codeb.mis.entity.PasswordResetToken;
import com.codeb.mis.entity.User;
import com.codeb.mis.exception.BadRequestException;
import com.codeb.mis.exception.ResourceNotFoundException;
import com.codeb.mis.repository.PasswordResetTokenRepository;
import com.codeb.mis.repository.UserRepository;
import com.codeb.mis.security.JwtUtils;
import com.codeb.mis.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuditService auditService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : User.Role.SALES_PERSON)
                .status(User.Status.ACTIVE)
                .phone(request.getPhone())
                .department(request.getDepartment() != null ? request.getDepartment() : "Sales")
                .build();

        User savedUser = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase(), request.getPassword())
        );

        String jwt = jwtUtils.generateJwtToken(authentication);

        auditService.log("USER_REGISTER", "AUTH", savedUser.getUserId().toString(), 
                "User registered: " + savedUser.getEmail() + " (" + savedUser.getRole() + ")");

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .userId(savedUser.getUserId())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .status(savedUser.getStatus())
                .phone(savedUser.getPhone())
                .department(savedUser.getDepartment())
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (user.getStatus() != User.Status.ACTIVE) {
            throw new BadRequestException("Your account is deactivated. Please contact an administrator.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        auditService.log("USER_LOGIN", "AUTH", user.getUserId().toString(), 
                "User logged in: " + user.getEmail());

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .phone(user.getPhone())
                .department(user.getDepartment())
                .build();
    }

    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("No user found with email: " + request.getEmail()));

        // Invalidate older tokens
        tokenRepository.deleteByEmail(user.getEmail());

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .email(user.getEmail())
                .token(token)
                .expiryDate(LocalDateTime.now().plusHours(1))
                .used(false)
                .build();

        tokenRepository.save(resetToken);

        auditService.log("FORGOT_PASSWORD_REQUEST", "AUTH", user.getUserId().toString(),
                "Password reset requested for: " + user.getEmail());

        return token;
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid password reset token"));

        if (resetToken.isUsed()) {
            throw new BadRequestException("This reset token has already been used");
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This reset token has expired. Please request a new one.");
        }

        User user = userRepository.findByEmail(resetToken.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found for token"));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        auditService.log("PASSWORD_RESET_SUCCESS", "AUTH", user.getUserId().toString(),
                "Password reset completed for: " + user.getEmail());
    }

    @Transactional(readOnly = true)
    public UserProfileResponse.Response getCurrentUserProfile() {
        User user = auditService.getCurrentUser();
        if (user == null) {
            throw new BadRequestException("Not authenticated");
        }

        return UserProfileResponse.Response.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .phone(user.getPhone())
                .department(user.getDepartment())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Transactional
    public void changePassword(UserProfileResponse.ChangePassword request) {
        User user = auditService.getCurrentUser();
        if (user == null) {
            throw new BadRequestException("Not authenticated");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New passwords do not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditService.log("CHANGE_PASSWORD", "AUTH", user.getUserId().toString(),
                "Password changed successfully by user: " + user.getEmail());
    }
}

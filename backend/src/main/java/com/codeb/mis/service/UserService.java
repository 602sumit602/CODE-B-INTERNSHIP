package com.codeb.mis.service;

import com.codeb.mis.dto.PagedResponse;
import com.codeb.mis.dto.UserDto;
import com.codeb.mis.entity.User;
import com.codeb.mis.exception.BadRequestException;
import com.codeb.mis.exception.ResourceNotFoundException;
import com.codeb.mis.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public PagedResponse<UserDto.Response> getUsers(String search, User.Role role, User.Status status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("userId").descending());
        Page<User> pageResult = userRepository.searchUsers(
                search != null && !search.isBlank() ? search : null,
                role,
                status,
                pageable
        );
        return PagedResponse.from(pageResult.map(UserDto.Response::fromEntity));
    }

    @Transactional(readOnly = true)
    public UserDto.Response getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        return UserDto.Response.fromEntity(user);
    }

    @Transactional
    public UserDto.Response createUser(UserDto.CreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(request.getStatus() != null ? request.getStatus() : User.Status.ACTIVE)
                .phone(request.getPhone())
                .department(request.getDepartment())
                .build();

        User saved = userRepository.save(user);
        auditService.log("CREATE_USER", "USER", saved.getUserId().toString(), 
                "Admin created user: " + saved.getEmail() + " (" + saved.getRole() + ")");

        return UserDto.Response.fromEntity(saved);
    }

    @Transactional
    public UserDto.Response updateUser(Long id, UserDto.UpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        if (!user.getEmail().equalsIgnoreCase(request.getEmail().trim()) &&
                userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("Email is already in use by another user: " + request.getEmail());
        }

        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getStatus() != null) user.setStatus(request.getStatus());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            if (request.getPassword().length() < 6) {
                throw new BadRequestException("Password must be at least 6 characters");
            }
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        User saved = userRepository.save(user);
        auditService.log("UPDATE_USER", "USER", saved.getUserId().toString(), 
                "Admin updated user: " + saved.getEmail());

        return UserDto.Response.fromEntity(saved);
    }

    @Transactional
    public UserDto.Response toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        User.Status newStatus = (user.getStatus() == User.Status.ACTIVE) ? User.Status.INACTIVE : User.Status.ACTIVE;
        user.setStatus(newStatus);
        User saved = userRepository.save(user);

        auditService.log("TOGGLE_USER_STATUS", "USER", saved.getUserId().toString(), 
                "User " + saved.getEmail() + " status changed to: " + newStatus);

        return UserDto.Response.fromEntity(saved);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        auditService.log("DELETE_USER", "USER", user.getUserId().toString(), 
                "Admin deleted user: " + user.getEmail());

        userRepository.delete(user);
    }
}

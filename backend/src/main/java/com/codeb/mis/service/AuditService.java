package com.codeb.mis.service;

import com.codeb.mis.dto.AuditLogDto;
import com.codeb.mis.dto.PagedResponse;
import com.codeb.mis.entity.AuditLog;
import com.codeb.mis.entity.User;
import com.codeb.mis.repository.AuditLogRepository;
import com.codeb.mis.repository.UserRepository;
import com.codeb.mis.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public void log(String action, String module, String recordId, String details) {
        User currentUser = getCurrentUser();
        String username = currentUser != null ? currentUser.getFullName() + " (" + currentUser.getEmail() + ")" : "System";

        AuditLog log = AuditLog.builder()
                .user(currentUser)
                .username(username)
                .action(action)
                .module(module)
                .recordId(recordId)
                .details(details)
                .build();

        auditLogRepository.save(log);
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl principal = (UserDetailsImpl) auth.getPrincipal();
            return userRepository.findById(principal.getId()).orElse(null);
        }
        return null;
    }

    @Transactional(readOnly = true)
    public PagedResponse<AuditLogDto> getAuditLogs(String module, String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<AuditLog> pageResult = auditLogRepository.searchLogs(
                module != null && !module.isBlank() ? module : null,
                search != null && !search.isBlank() ? search : null,
                pageable
        );
        return PagedResponse.from(pageResult.map(AuditLogDto::fromEntity));
    }
}

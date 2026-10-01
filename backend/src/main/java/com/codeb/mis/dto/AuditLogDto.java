package com.codeb.mis.dto;

import com.codeb.mis.entity.AuditLog;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogDto {
    private Long logId;
    private Long userId;
    private String username;
    private String action;
    private String module;
    private String recordId;
    private String details;
    private LocalDateTime timestamp;

    public static AuditLogDto fromEntity(AuditLog log) {
        if (log == null) return null;
        return AuditLogDto.builder()
                .logId(log.getLogId())
                .userId(log.getUser() != null ? log.getUser().getUserId() : null)
                .username(log.getUsername())
                .action(log.getAction())
                .module(log.getModule())
                .recordId(log.getRecordId())
                .details(log.getDetails())
                .timestamp(log.getTimestamp())
                .build();
    }
}

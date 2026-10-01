package com.codeb.mis.dto;

import com.codeb.mis.entity.Group;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

public class GroupDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long groupId;
        private String groupName;
        private String description;
        private Group.Status status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response fromEntity(Group group) {
            if (group == null) return null;
            return Response.builder()
                    .groupId(group.getGroupId())
                    .groupName(group.getGroupName())
                    .description(group.getDescription())
                    .status(group.getStatus())
                    .createdAt(group.getCreatedAt())
                    .updatedAt(group.getUpdatedAt())
                    .build();
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        @NotBlank(message = "Group name is required")
        private String groupName;
        private String description;
        private Group.Status status = Group.Status.ACTIVE;
    }
}

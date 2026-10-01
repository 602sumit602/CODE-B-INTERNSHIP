package com.codeb.mis.dto;

import com.codeb.mis.entity.Subzone;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

public class SubzoneDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long subzoneId;
        private String subzoneName;
        private String region;
        private String description;
        private Subzone.Status status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response fromEntity(Subzone subzone) {
            if (subzone == null) return null;
            return Response.builder()
                    .subzoneId(subzone.getSubzoneId())
                    .subzoneName(subzone.getSubzoneName())
                    .region(subzone.getRegion())
                    .description(subzone.getDescription())
                    .status(subzone.getStatus())
                    .createdAt(subzone.getCreatedAt())
                    .updatedAt(subzone.getUpdatedAt())
                    .build();
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        @NotBlank(message = "Subzone name is required")
        private String subzoneName;

        @NotBlank(message = "Region is required")
        private String region;

        private String description;
        private Subzone.Status status = Subzone.Status.ACTIVE;
    }
}

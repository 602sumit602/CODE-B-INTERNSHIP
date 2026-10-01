package com.codeb.mis.dto;

import com.codeb.mis.entity.Chain;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

public class ChainDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long chainId;
        private String chainName;
        private Long groupId;
        private String groupName;
        private String description;
        private Chain.Status status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response fromEntity(Chain chain) {
            if (chain == null) return null;
            return Response.builder()
                    .chainId(chain.getChainId())
                    .chainName(chain.getChainName())
                    .groupId(chain.getGroup() != null ? chain.getGroup().getGroupId() : null)
                    .groupName(chain.getGroup() != null ? chain.getGroup().getGroupName() : null)
                    .description(chain.getDescription())
                    .status(chain.getStatus())
                    .createdAt(chain.getCreatedAt())
                    .updatedAt(chain.getUpdatedAt())
                    .build();
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        @NotBlank(message = "Chain name is required")
        private String chainName;
        private Long groupId;
        private String description;
        private Chain.Status status = Chain.Status.ACTIVE;
    }
}

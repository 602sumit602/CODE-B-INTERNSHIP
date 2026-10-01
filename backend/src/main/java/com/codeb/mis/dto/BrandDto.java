package com.codeb.mis.dto;

import com.codeb.mis.entity.Brand;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

public class BrandDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long brandId;
        private String brandName;
        private Long chainId;
        private String chainName;
        private Long groupId;
        private String groupName;
        private String description;
        private Brand.Status status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response fromEntity(Brand brand) {
            if (brand == null) return null;
            return Response.builder()
                    .brandId(brand.getBrandId())
                    .brandName(brand.getBrandName())
                    .chainId(brand.getChain() != null ? brand.getChain().getChainId() : null)
                    .chainName(brand.getChain() != null ? brand.getChain().getChainName() : null)
                    .groupId(brand.getChain() != null && brand.getChain().getGroup() != null ? brand.getChain().getGroup().getGroupId() : null)
                    .groupName(brand.getChain() != null && brand.getChain().getGroup() != null ? brand.getChain().getGroup().getGroupName() : null)
                    .description(brand.getDescription())
                    .status(brand.getStatus())
                    .createdAt(brand.getCreatedAt())
                    .updatedAt(brand.getUpdatedAt())
                    .build();
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        @NotBlank(message = "Brand name is required")
        private String brandName;
        private Long chainId;
        private String description;
        private Brand.Status status = Brand.Status.ACTIVE;
    }
}

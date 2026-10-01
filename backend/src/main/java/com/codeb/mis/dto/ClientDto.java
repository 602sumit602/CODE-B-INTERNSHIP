package com.codeb.mis.dto;

import com.codeb.mis.entity.Client;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

public class ClientDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long clientId;
        private String clientName;
        private String contactPerson;
        private String email;
        private String phone;
        private String address;
        private String city;
        private String state;
        private String gstin;

        private Long groupId;
        private String groupName;

        private Long chainId;
        private String chainName;

        private Long brandId;
        private String brandName;

        private Long subzoneId;
        private String subzoneName;
        private String subzoneRegion;

        private Client.Status status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response fromEntity(Client client) {
            if (client == null) return null;
            return Response.builder()
                    .clientId(client.getClientId())
                    .clientName(client.getClientName())
                    .contactPerson(client.getContactPerson())
                    .email(client.getEmail())
                    .phone(client.getPhone())
                    .address(client.getAddress())
                    .city(client.getCity())
                    .state(client.getState())
                    .gstin(client.getGstin())
                    .groupId(client.getGroup() != null ? client.getGroup().getGroupId() : null)
                    .groupName(client.getGroup() != null ? client.getGroup().getGroupName() : null)
                    .chainId(client.getChain() != null ? client.getChain().getChainId() : null)
                    .chainName(client.getChain() != null ? client.getChain().getChainName() : null)
                    .brandId(client.getBrand() != null ? client.getBrand().getBrandId() : null)
                    .brandName(client.getBrand() != null ? client.getBrand().getBrandName() : null)
                    .subzoneId(client.getSubzone() != null ? client.getSubzone().getSubzoneId() : null)
                    .subzoneName(client.getSubzone() != null ? client.getSubzone().getSubzoneName() : null)
                    .subzoneRegion(client.getSubzone() != null ? client.getSubzone().getRegion() : null)
                    .status(client.getStatus())
                    .createdAt(client.getCreatedAt())
                    .updatedAt(client.getUpdatedAt())
                    .build();
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        @NotBlank(message = "Client name is required")
        private String clientName;

        private String contactPerson;
        private String email;
        private String phone;
        private String address;
        private String city;
        private String state;
        private String gstin;

        private Long groupId;
        private Long chainId;
        private Long brandId;
        private Long subzoneId;

        private Client.Status status = Client.Status.ACTIVE;
    }
}

package com.codeb.mis.dto;

import com.codeb.mis.entity.SystemSetting;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettingDto {
    @NotBlank(message = "Setting key is required")
    private String settingKey;

    @NotBlank(message = "Setting value is required")
    private String settingValue;

    private String description;
    private LocalDateTime updatedAt;

    public static SettingDto fromEntity(SystemSetting setting) {
        if (setting == null) return null;
        return SettingDto.builder()
                .settingKey(setting.getSettingKey())
                .settingValue(setting.getSettingValue())
                .description(setting.getDescription())
                .updatedAt(setting.getUpdatedAt())
                .build();
    }
}

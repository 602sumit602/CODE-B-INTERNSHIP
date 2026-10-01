package com.codeb.mis.service;

import com.codeb.mis.dto.SettingDto;
import com.codeb.mis.entity.SystemSetting;
import com.codeb.mis.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettingService {

    private final SystemSettingRepository systemSettingRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<SettingDto> getAllSettings() {
        return systemSettingRepository.findAll().stream()
                .map(SettingDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public String getSettingValue(String key, String defaultValue) {
        return systemSettingRepository.findById(key)
                .map(SystemSetting::getSettingValue)
                .orElse(defaultValue);
    }

    @Transactional(readOnly = true)
    public BigDecimal getGstRate() {
        String val = getSettingValue("default_gst_rate", "18.00");
        try {
            return new BigDecimal(val);
        } catch (Exception e) {
            return new BigDecimal("18.00");
        }
    }

    @Transactional
    public SettingDto updateSetting(String key, String value, String description) {
        SystemSetting setting = systemSettingRepository.findById(key)
                .orElse(SystemSetting.builder().settingKey(key).build());

        setting.setSettingValue(value);
        if (description != null && !description.isBlank()) {
            setting.setDescription(description);
        }

        SystemSetting saved = systemSettingRepository.save(setting);
        auditService.log("UPDATE_SETTING", "SETTINGS", key, "Updated setting " + key + " to " + value);
        return SettingDto.fromEntity(saved);
    }
}

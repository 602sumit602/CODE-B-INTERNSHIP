package com.codeb.mis.service;

import com.codeb.mis.dto.PagedResponse;
import com.codeb.mis.dto.SubzoneDto;
import com.codeb.mis.entity.Subzone;
import com.codeb.mis.exception.BadRequestException;
import com.codeb.mis.exception.ResourceNotFoundException;
import com.codeb.mis.repository.SubzoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubzoneService {

    private final SubzoneRepository subzoneRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public PagedResponse<SubzoneDto.Response> getSubzones(String search, String region, Subzone.Status status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("subzoneName").ascending());
        Page<Subzone> pageResult = subzoneRepository.searchSubzones(
                search != null && !search.isBlank() ? search : null,
                region != null && !region.isBlank() ? region : null,
                status,
                pageable
        );
        return PagedResponse.from(pageResult.map(SubzoneDto.Response::fromEntity));
    }

    @Transactional(readOnly = true)
    public List<SubzoneDto.Response> getActiveSubzones() {
        return subzoneRepository.findByStatus(Subzone.Status.ACTIVE).stream()
                .map(SubzoneDto.Response::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SubzoneDto.Response getSubzoneById(Long id) {
        Subzone subzone = subzoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subzone not found with ID: " + id));
        return SubzoneDto.Response.fromEntity(subzone);
    }

    @Transactional
    public SubzoneDto.Response createSubzone(SubzoneDto.Request request) {
        if (subzoneRepository.existsBySubzoneName(request.getSubzoneName().trim())) {
            throw new BadRequestException("Subzone name already exists: " + request.getSubzoneName());
        }

        Subzone subzone = Subzone.builder()
                .subzoneName(request.getSubzoneName().trim())
                .region(request.getRegion().trim())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : Subzone.Status.ACTIVE)
                .build();

        Subzone saved = subzoneRepository.save(subzone);
        auditService.log("CREATE_SUBZONE", "SUBZONE", saved.getSubzoneId().toString(), 
                "Created subzone: " + saved.getSubzoneName());

        return SubzoneDto.Response.fromEntity(saved);
    }

    @Transactional
    public SubzoneDto.Response updateSubzone(Long id, SubzoneDto.Request request) {
        Subzone subzone = subzoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subzone not found with ID: " + id));

        if (!subzone.getSubzoneName().equalsIgnoreCase(request.getSubzoneName().trim()) &&
                subzoneRepository.existsBySubzoneName(request.getSubzoneName().trim())) {
            throw new BadRequestException("Subzone name already exists: " + request.getSubzoneName());
        }

        subzone.setSubzoneName(request.getSubzoneName().trim());
        subzone.setRegion(request.getRegion().trim());
        subzone.setDescription(request.getDescription());
        if (request.getStatus() != null) subzone.setStatus(request.getStatus());

        Subzone saved = subzoneRepository.save(subzone);
        auditService.log("UPDATE_SUBZONE", "SUBZONE", saved.getSubzoneId().toString(), 
                "Updated subzone: " + saved.getSubzoneName());

        return SubzoneDto.Response.fromEntity(saved);
    }

    @Transactional
    public void deleteSubzone(Long id) {
        Subzone subzone = subzoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subzone not found with ID: " + id));

        auditService.log("DELETE_SUBZONE", "SUBZONE", subzone.getSubzoneId().toString(), 
                "Deleted subzone: " + subzone.getSubzoneName());

        subzoneRepository.delete(subzone);
    }
}

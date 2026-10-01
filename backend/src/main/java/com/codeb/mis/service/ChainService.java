package com.codeb.mis.service;

import com.codeb.mis.dto.ChainDto;
import com.codeb.mis.dto.PagedResponse;
import com.codeb.mis.entity.Chain;
import com.codeb.mis.entity.Group;
import com.codeb.mis.exception.ResourceNotFoundException;
import com.codeb.mis.repository.ChainRepository;
import com.codeb.mis.repository.GroupRepository;
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
public class ChainService {

    private final ChainRepository chainRepository;
    private final GroupRepository groupRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public PagedResponse<ChainDto.Response> getChains(String search, Long groupId, Chain.Status status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("chainName").ascending());
        Page<Chain> pageResult = chainRepository.searchChains(
                search != null && !search.isBlank() ? search : null,
                groupId,
                status,
                pageable
        );
        return PagedResponse.from(pageResult.map(ChainDto.Response::fromEntity));
    }

    @Transactional(readOnly = true)
    public List<ChainDto.Response> getChainsByGroup(Long groupId) {
        return chainRepository.findByGroupGroupId(groupId).stream()
                .map(ChainDto.Response::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChainDto.Response> getActiveChains() {
        return chainRepository.findByStatus(Chain.Status.ACTIVE).stream()
                .map(ChainDto.Response::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ChainDto.Response getChainById(Long id) {
        Chain chain = chainRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chain not found with ID: " + id));
        return ChainDto.Response.fromEntity(chain);
    }

    @Transactional
    public ChainDto.Response createChain(ChainDto.Request request) {
        Group group = null;
        if (request.getGroupId() != null) {
            group = groupRepository.findById(request.getGroupId())
                    .orElseThrow(() -> new ResourceNotFoundException("Group not found with ID: " + request.getGroupId()));
        }

        Chain chain = Chain.builder()
                .chainName(request.getChainName().trim())
                .group(group)
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : Chain.Status.ACTIVE)
                .build();

        Chain saved = chainRepository.save(chain);
        auditService.log("CREATE_CHAIN", "CHAIN", saved.getChainId().toString(), 
                "Created chain: " + saved.getChainName());

        return ChainDto.Response.fromEntity(saved);
    }

    @Transactional
    public ChainDto.Response updateChain(Long id, ChainDto.Request request) {
        Chain chain = chainRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chain not found with ID: " + id));

        if (request.getGroupId() != null) {
            Group group = groupRepository.findById(request.getGroupId())
                    .orElseThrow(() -> new ResourceNotFoundException("Group not found with ID: " + request.getGroupId()));
            chain.setGroup(group);
        } else {
            chain.setGroup(null);
        }

        chain.setChainName(request.getChainName().trim());
        chain.setDescription(request.getDescription());
        if (request.getStatus() != null) chain.setStatus(request.getStatus());

        Chain saved = chainRepository.save(chain);
        auditService.log("UPDATE_CHAIN", "CHAIN", saved.getChainId().toString(), 
                "Updated chain: " + saved.getChainName());

        return ChainDto.Response.fromEntity(saved);
    }

    @Transactional
    public void deleteChain(Long id) {
        Chain chain = chainRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chain not found with ID: " + id));

        auditService.log("DELETE_CHAIN", "CHAIN", chain.getChainId().toString(), 
                "Deleted chain: " + chain.getChainName());

        chainRepository.delete(chain);
    }
}

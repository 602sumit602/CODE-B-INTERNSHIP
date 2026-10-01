package com.codeb.mis.service;

import com.codeb.mis.dto.GroupDto;
import com.codeb.mis.dto.PagedResponse;
import com.codeb.mis.entity.Group;
import com.codeb.mis.exception.BadRequestException;
import com.codeb.mis.exception.ResourceNotFoundException;
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
public class GroupService {

    private final GroupRepository groupRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public PagedResponse<GroupDto.Response> getGroups(String search, Group.Status status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("groupName").ascending());
        Page<Group> pageResult = groupRepository.searchGroups(
                search != null && !search.isBlank() ? search : null,
                status,
                pageable
        );
        return PagedResponse.from(pageResult.map(GroupDto.Response::fromEntity));
    }

    @Transactional(readOnly = true)
    public List<GroupDto.Response> getActiveGroups() {
        return groupRepository.findByStatus(Group.Status.ACTIVE).stream()
                .map(GroupDto.Response::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GroupDto.Response getGroupById(Long id) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with ID: " + id));
        return GroupDto.Response.fromEntity(group);
    }

    @Transactional
    public GroupDto.Response createGroup(GroupDto.Request request) {
        if (groupRepository.existsByGroupName(request.getGroupName().trim())) {
            throw new BadRequestException("Group name already exists: " + request.getGroupName());
        }

        Group group = Group.builder()
                .groupName(request.getGroupName().trim())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : Group.Status.ACTIVE)
                .build();

        Group saved = groupRepository.save(group);
        auditService.log("CREATE_GROUP", "GROUP", saved.getGroupId().toString(), 
                "Created group: " + saved.getGroupName());

        return GroupDto.Response.fromEntity(saved);
    }

    @Transactional
    public GroupDto.Response updateGroup(Long id, GroupDto.Request request) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with ID: " + id));

        if (!group.getGroupName().equalsIgnoreCase(request.getGroupName().trim()) &&
                groupRepository.existsByGroupName(request.getGroupName().trim())) {
            throw new BadRequestException("Group name already exists: " + request.getGroupName());
        }

        group.setGroupName(request.getGroupName().trim());
        group.setDescription(request.getDescription());
        if (request.getStatus() != null) group.setStatus(request.getStatus());

        Group saved = groupRepository.save(group);
        auditService.log("UPDATE_GROUP", "GROUP", saved.getGroupId().toString(), 
                "Updated group: " + saved.getGroupName());

        return GroupDto.Response.fromEntity(saved);
    }

    @Transactional
    public void deleteGroup(Long id) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with ID: " + id));

        auditService.log("DELETE_GROUP", "GROUP", group.getGroupId().toString(), 
                "Deleted group: " + group.getGroupName());

        groupRepository.delete(group);
    }
}

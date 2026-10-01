package com.codeb.mis.service;

import com.codeb.mis.dto.ClientDto;
import com.codeb.mis.dto.EstimateDto;
import com.codeb.mis.dto.InvoiceDto;
import com.codeb.mis.dto.PagedResponse;
import com.codeb.mis.dto.PaymentDto;
import com.codeb.mis.entity.*;
import com.codeb.mis.exception.BadRequestException;
import com.codeb.mis.exception.ResourceNotFoundException;
import com.codeb.mis.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientService {

    private static final Pattern GSTIN_PATTERN = 
            Pattern.compile("^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$");

    private final ClientRepository clientRepository;
    private final GroupRepository groupRepository;
    private final ChainRepository chainRepository;
    private final BrandRepository brandRepository;
    private final SubzoneRepository subzoneRepository;
    private final EstimateRepository estimateRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public PagedResponse<ClientDto.Response> getClients(String search, Long groupId, Long chainId, Long brandId, Long subzoneId, Client.Status status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("clientName").ascending());
        Page<Client> pageResult = clientRepository.searchClients(
                search != null && !search.isBlank() ? search : null,
                groupId,
                chainId,
                brandId,
                subzoneId,
                status,
                pageable
        );
        return PagedResponse.from(pageResult.map(ClientDto.Response::fromEntity));
    }

    @Transactional(readOnly = true)
    public List<ClientDto.Response> getActiveClients() {
        return clientRepository.findByStatus(Client.Status.ACTIVE).stream()
                .map(ClientDto.Response::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClientDto.Response getClientById(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with ID: " + id));
        return ClientDto.Response.fromEntity(client);
    }

    @Transactional
    public ClientDto.Response createClient(ClientDto.Request request) {
        validateGstin(request.getGstin());

        Client client = Client.builder()
                .clientName(request.getClientName().trim())
                .contactPerson(request.getContactPerson())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .gstin(request.getGstin() != null ? request.getGstin().trim().toUpperCase() : null)
                .status(request.getStatus() != null ? request.getStatus() : Client.Status.ACTIVE)
                .build();

        attachRelationships(client, request);

        Client saved = clientRepository.save(client);
        auditService.log("CREATE_CLIENT", "CLIENT", saved.getClientId().toString(), 
                "Created client: " + saved.getClientName());

        return ClientDto.Response.fromEntity(saved);
    }

    @Transactional
    public ClientDto.Response updateClient(Long id, ClientDto.Request request) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with ID: " + id));

        validateGstin(request.getGstin());

        client.setClientName(request.getClientName().trim());
        client.setContactPerson(request.getContactPerson());
        client.setEmail(request.getEmail());
        client.setPhone(request.getPhone());
        client.setAddress(request.getAddress());
        client.setCity(request.getCity());
        client.setState(request.getState());
        client.setGstin(request.getGstin() != null ? request.getGstin().trim().toUpperCase() : null);
        if (request.getStatus() != null) client.setStatus(request.getStatus());

        attachRelationships(client, request);

        Client saved = clientRepository.save(client);
        auditService.log("UPDATE_CLIENT", "CLIENT", saved.getClientId().toString(), 
                "Updated client: " + saved.getClientName());

        return ClientDto.Response.fromEntity(saved);
    }

    @Transactional
    public void deleteClient(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with ID: " + id));

        auditService.log("DELETE_CLIENT", "CLIENT", client.getClientId().toString(), 
                "Deleted client: " + client.getClientName());

        clientRepository.delete(client);
    }

    @Transactional(readOnly = true)
    public List<EstimateDto.Response> getClientEstimates(Long clientId) {
        return estimateRepository.findByClientClientId(clientId).stream()
                .map(EstimateDto.Response::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InvoiceDto.Response> getClientInvoices(Long clientId) {
        return invoiceRepository.findByClientClientId(clientId).stream()
                .map(InvoiceDto.Response::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentDto.Response> getClientPayments(Long clientId) {
        return paymentRepository.findByClientClientId(clientId).stream()
                .map(PaymentDto.Response::fromEntity)
                .collect(Collectors.toList());
    }

    private void attachRelationships(Client client, ClientDto.Request request) {
        if (request.getGroupId() != null) {
            client.setGroup(groupRepository.findById(request.getGroupId())
                    .orElseThrow(() -> new ResourceNotFoundException("Group not found with ID: " + request.getGroupId())));
        } else {
            client.setGroup(null);
        }

        if (request.getChainId() != null) {
            client.setChain(chainRepository.findById(request.getChainId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chain not found with ID: " + request.getChainId())));
        } else {
            client.setChain(null);
        }

        if (request.getBrandId() != null) {
            client.setBrand(brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand not found with ID: " + request.getBrandId())));
        } else {
            client.setBrand(null);
        }

        if (request.getSubzoneId() != null) {
            client.setSubzone(subzoneRepository.findById(request.getSubzoneId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subzone not found with ID: " + request.getSubzoneId())));
        } else {
            client.setSubzone(null);
        }
    }

    private void validateGstin(String gstin) {
        if (gstin != null && !gstin.trim().isEmpty()) {
            String cleanGstin = gstin.trim().toUpperCase();
            if (!GSTIN_PATTERN.matcher(cleanGstin).matches()) {
                throw new BadRequestException("Invalid GSTIN format: " + gstin + ". Valid format example: 27AABCU9603R1ZM");
            }
        }
    }
}

package com.codeb.mis.service;

import com.codeb.mis.dto.BrandDto;
import com.codeb.mis.dto.PagedResponse;
import com.codeb.mis.entity.Brand;
import com.codeb.mis.entity.Chain;
import com.codeb.mis.exception.ResourceNotFoundException;
import com.codeb.mis.repository.BrandRepository;
import com.codeb.mis.repository.ChainRepository;
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
public class BrandService {

    private final BrandRepository brandRepository;
    private final ChainRepository chainRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public PagedResponse<BrandDto.Response> getBrands(String search, Long chainId, Brand.Status status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("brandName").ascending());
        Page<Brand> pageResult = brandRepository.searchBrands(
                search != null && !search.isBlank() ? search : null,
                chainId,
                status,
                pageable
        );
        return PagedResponse.from(pageResult.map(BrandDto.Response::fromEntity));
    }

    @Transactional(readOnly = true)
    public List<BrandDto.Response> getBrandsByChain(Long chainId) {
        return brandRepository.findByChainChainId(chainId).stream()
                .map(BrandDto.Response::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BrandDto.Response> getActiveBrands() {
        return brandRepository.findByStatus(Brand.Status.ACTIVE).stream()
                .map(BrandDto.Response::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BrandDto.Response getBrandById(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with ID: " + id));
        return BrandDto.Response.fromEntity(brand);
    }

    @Transactional
    public BrandDto.Response createBrand(BrandDto.Request request) {
        Chain chain = null;
        if (request.getChainId() != null) {
            chain = chainRepository.findById(request.getChainId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chain not found with ID: " + request.getChainId()));
        }

        Brand brand = Brand.builder()
                .brandName(request.getBrandName().trim())
                .chain(chain)
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : Brand.Status.ACTIVE)
                .build();

        Brand saved = brandRepository.save(brand);
        auditService.log("CREATE_BRAND", "BRAND", saved.getBrandId().toString(), 
                "Created brand: " + saved.getBrandName());

        return BrandDto.Response.fromEntity(saved);
    }

    @Transactional
    public BrandDto.Response updateBrand(Long id, BrandDto.Request request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with ID: " + id));

        if (request.getChainId() != null) {
            Chain chain = chainRepository.findById(request.getChainId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chain not found with ID: " + request.getChainId()));
            brand.setChain(chain);
        } else {
            brand.setChain(null);
        }

        brand.setBrandName(request.getBrandName().trim());
        brand.setDescription(request.getDescription());
        if (request.getStatus() != null) brand.setStatus(request.getStatus());

        Brand saved = brandRepository.save(brand);
        auditService.log("UPDATE_BRAND", "BRAND", saved.getBrandId().toString(), 
                "Updated brand: " + saved.getBrandName());

        return BrandDto.Response.fromEntity(saved);
    }

    @Transactional
    public void deleteBrand(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with ID: " + id));

        auditService.log("DELETE_BRAND", "BRAND", brand.getBrandId().toString(), 
                "Deleted brand: " + brand.getBrandName());

        brandRepository.delete(brand);
    }
}

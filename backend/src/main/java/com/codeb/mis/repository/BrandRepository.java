package com.codeb.mis.repository;

import com.codeb.mis.entity.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    List<Brand> findByChainChainId(Long chainId);
    List<Brand> findByStatus(Brand.Status status);

    @Query("SELECT b FROM Brand b WHERE " +
           "(:search IS NULL OR LOWER(b.brandName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(b.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:chainId IS NULL OR b.chain.chainId = :chainId) " +
           "AND (:status IS NULL OR b.status = :status)")
    Page<Brand> searchBrands(@Param("search") String search,
                             @Param("chainId") Long groupId,
                             @Param("status") Brand.Status status,
                             Pageable pageable);
}

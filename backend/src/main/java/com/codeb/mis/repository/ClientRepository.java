package com.codeb.mis.repository;

import com.codeb.mis.entity.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    Optional<Client> findByGstin(String gstin);
    List<Client> findByStatus(Client.Status status);
    List<Client> findByGroupGroupId(Long groupId);
    List<Client> findByChainChainId(Long chainId);
    List<Client> findByBrandBrandId(Long brandId);
    List<Client> findBySubzoneSubzoneId(Long subzoneId);

    long countByStatus(Client.Status status);

    @Query("SELECT c FROM Client c WHERE " +
           "(:search IS NULL OR LOWER(c.clientName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "   OR LOWER(c.contactPerson) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "   OR LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "   OR LOWER(c.city) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "   OR LOWER(c.gstin) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:groupId IS NULL OR c.group.groupId = :groupId) " +
           "AND (:chainId IS NULL OR c.chain.chainId = :chainId) " +
           "AND (:brandId IS NULL OR c.brand.brandId = :brandId) " +
           "AND (:subzoneId IS NULL OR c.subzone.subzoneId = :subzoneId) " +
           "AND (:status IS NULL OR c.status = :status)")
    Page<Client> searchClients(@Param("search") String search,
                               @Param("groupId") Long groupId,
                               @Param("chainId") Long chainId,
                               @Param("brandId") Long brandId,
                               @Param("subzoneId") Long subzoneId,
                               @Param("status") Client.Status status,
                               Pageable pageable);
}

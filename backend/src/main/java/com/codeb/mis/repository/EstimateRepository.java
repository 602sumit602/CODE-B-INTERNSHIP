package com.codeb.mis.repository;

import com.codeb.mis.entity.Estimate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EstimateRepository extends JpaRepository<Estimate, Long> {
    Optional<Estimate> findByEstimateNumber(String estimateNumber);
    boolean existsByEstimateNumber(String estimateNumber);

    List<Estimate> findByClientClientId(Long clientId);
    List<Estimate> findBySalespersonUserId(Long salespersonId);

    long countByStatus(Estimate.EstimateStatus status);
    long countBySalespersonUserId(Long salespersonId);
    long countBySalespersonUserIdAndStatus(Long salespersonId, Estimate.EstimateStatus status);

    @Query("SELECT e FROM Estimate e WHERE " +
           "(:search IS NULL OR LOWER(e.estimateNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "   OR LOWER(e.client.clientName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "   OR LOWER(e.salesperson.fullName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR e.status = :status) " +
           "AND (:clientId IS NULL OR e.client.clientId = :clientId) " +
           "AND (:salespersonId IS NULL OR e.salesperson.userId = :salespersonId) " +
           "AND (:startDate IS NULL OR e.estimateDate >= :startDate) " +
           "AND (:endDate IS NULL OR e.estimateDate <= :endDate)")
    Page<Estimate> searchEstimates(@Param("search") String search,
                                   @Param("status") Estimate.EstimateStatus status,
                                   @Param("clientId") Long clientId,
                                   @Param("salespersonId") Long salespersonId,
                                   @Param("startDate") LocalDate startDate,
                                   @Param("endDate") LocalDate endDate,
                                   Pageable pageable);

    @Query("SELECT e.status, COUNT(e) FROM Estimate e GROUP BY e.status")
    List<Object[]> countByStatusGrouped();

    @Query("SELECT e.status, COUNT(e) FROM Estimate e WHERE e.salesperson.userId = :userId GROUP BY e.status")
    List<Object[]> countByStatusGroupedForUser(@Param("userId") Long userId);
}

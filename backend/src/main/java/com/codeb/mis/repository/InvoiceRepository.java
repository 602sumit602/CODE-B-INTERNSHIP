package com.codeb.mis.repository;

import com.codeb.mis.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    boolean existsByInvoiceNumber(String invoiceNumber);

    List<Invoice> findByClientClientId(Long clientId);
    List<Invoice> findByEstimateEstimateId(Long estimateId);
    List<Invoice> findBySalespersonUserId(Long salespersonId);

    long countByStatus(Invoice.InvoiceStatus status);
    long countBySalespersonUserId(Long salespersonId);
    long countBySalespersonUserIdAndStatus(Long salespersonId, Invoice.InvoiceStatus status);

    @Query("SELECT i FROM Invoice i WHERE " +
           "(:search IS NULL OR LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "   OR LOWER(i.client.clientName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "   OR LOWER(i.salesperson.fullName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR i.status = :status) " +
           "AND (:clientId IS NULL OR i.client.clientId = :clientId) " +
           "AND (:salespersonId IS NULL OR i.salesperson.userId = :salespersonId) " +
           "AND (:startDate IS NULL OR i.invoiceDate >= :startDate) " +
           "AND (:endDate IS NULL OR i.invoiceDate <= :endDate)")
    Page<Invoice> searchInvoices(@Param("search") String search,
                                 @Param("status") Invoice.InvoiceStatus status,
                                 @Param("clientId") Long clientId,
                                 @Param("salespersonId") Long salespersonId,
                                 @Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate,
                                 Pageable pageable);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.status != 'CANCELLED' AND (:userId IS NULL OR i.salesperson.userId = :userId)")
    BigDecimal sumTotalSales(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(i.amountPaid), 0) FROM Invoice i WHERE i.status != 'CANCELLED' AND (:userId IS NULL OR i.salesperson.userId = :userId)")
    BigDecimal sumTotalCollected(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(i.balanceDue), 0) FROM Invoice i WHERE i.status != 'CANCELLED' AND (:userId IS NULL OR i.salesperson.userId = :userId)")
    BigDecimal sumTotalOutstanding(@Param("userId") Long userId);

    @Query("SELECT i.status, COUNT(i) FROM Invoice i WHERE (:userId IS NULL OR i.salesperson.userId = :userId) GROUP BY i.status")
    List<Object[]> countByStatusGrouped(@Param("userId") Long userId);

    @Query("SELECT FUNCTION('YEAR', i.invoiceDate), FUNCTION('MONTH', i.invoiceDate), COALESCE(SUM(i.totalAmount), 0), COALESCE(SUM(i.amountPaid), 0) " +
           "FROM Invoice i WHERE i.status != 'CANCELLED' AND (:userId IS NULL OR i.salesperson.userId = :userId) " +
           "GROUP BY FUNCTION('YEAR', i.invoiceDate), FUNCTION('MONTH', i.invoiceDate) " +
           "ORDER BY FUNCTION('YEAR', i.invoiceDate) ASC, FUNCTION('MONTH', i.invoiceDate) ASC")
    List<Object[]> findMonthlySalesAggregates(@Param("userId") Long userId);
}

package com.codeb.mis.repository;

import com.codeb.mis.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByInvoiceInvoiceId(Long invoiceId);
    List<Payment> findByClientClientId(Long clientId);

    @Query("SELECT p FROM Payment p WHERE " +
           "(:search IS NULL OR LOWER(p.paymentReference) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "   OR LOWER(p.invoice.invoiceNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "   OR LOWER(p.client.clientName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR p.status = :status) " +
           "AND (:clientId IS NULL OR p.client.clientId = :clientId) " +
           "AND (:invoiceId IS NULL OR p.invoice.invoiceId = :invoiceId) " +
           "AND (:paymentMethod IS NULL OR p.paymentMethod = :paymentMethod) " +
           "AND (:startDate IS NULL OR p.paymentDate >= :startDate) " +
           "AND (:endDate IS NULL OR p.paymentDate <= :endDate) " +
           "AND (:salespersonId IS NULL OR p.invoice.salesperson.userId = :salespersonId)")
    Page<Payment> searchPayments(@Param("search") String search,
                                 @Param("status") Payment.PaymentStatus status,
                                 @Param("clientId") Long clientId,
                                 @Param("invoiceId") Long invoiceId,
                                 @Param("paymentMethod") String paymentMethod,
                                 @Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate,
                                 @Param("salespersonId") Long salespersonId,
                                 Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'SUCCESS' AND (:userId IS NULL OR p.invoice.salesperson.userId = :userId)")
    BigDecimal sumTotalPayments(@Param("userId") Long userId);

    @Query("SELECT p.status, COUNT(p) FROM Payment p WHERE (:userId IS NULL OR p.invoice.salesperson.userId = :userId) GROUP BY p.status")
    List<Object[]> countByStatusGrouped(@Param("userId") Long userId);

    @Query("SELECT p.paymentMethod, COUNT(p), COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'SUCCESS' AND (:userId IS NULL OR p.invoice.salesperson.userId = :userId) GROUP BY p.paymentMethod")
    List<Object[]> sumByPaymentMethodGrouped(@Param("userId") Long userId);
}

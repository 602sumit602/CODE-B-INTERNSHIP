package com.codeb.mis.repository;

import com.codeb.mis.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findTop20ByOrderByTimestampDesc();

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:module IS NULL OR a.module = :module) " +
           "AND (:search IS NULL OR LOWER(a.details) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.username) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY a.timestamp DESC")
    Page<AuditLog> searchLogs(@Param("module") String module,
                              @Param("search") String search,
                              Pageable pageable);
}

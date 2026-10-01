package com.codeb.mis.repository;

import com.codeb.mis.entity.Chain;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChainRepository extends JpaRepository<Chain, Long> {
    List<Chain> findByGroupGroupId(Long groupId);
    List<Chain> findByStatus(Chain.Status status);

    @Query("SELECT c FROM Chain c WHERE " +
           "(:search IS NULL OR LOWER(c.chainName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:groupId IS NULL OR c.group.groupId = :groupId) " +
           "AND (:status IS NULL OR c.status = :status)")
    Page<Chain> searchChains(@Param("search") String search,
                             @Param("groupId") Long groupId,
                             @Param("status") Chain.Status status,
                             Pageable pageable);
}

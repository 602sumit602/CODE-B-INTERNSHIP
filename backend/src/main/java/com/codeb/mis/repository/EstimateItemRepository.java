package com.codeb.mis.repository;

import com.codeb.mis.entity.EstimateItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EstimateItemRepository extends JpaRepository<EstimateItem, Long> {
    List<EstimateItem> findByEstimateEstimateId(Long estimateId);
    void deleteByEstimateEstimateId(Long estimateId);
}

package com.codeb.mis.repository;

import com.codeb.mis.entity.Subzone;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubzoneRepository extends JpaRepository<Subzone, Long> {
    Optional<Subzone> findBySubzoneName(String subzoneName);
    boolean existsBySubzoneName(String subzoneName);
    List<Subzone> findByStatus(Subzone.Status status);

    @Query("SELECT s FROM Subzone s WHERE " +
           "(:search IS NULL OR LOWER(s.subzoneName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.region) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:region IS NULL OR LOWER(s.region) = LOWER(:region)) " +
           "AND (:status IS NULL OR s.status = :status)")
    Page<Subzone> searchSubzones(@Param("search") String search,
                                 @Param("region") String region,
                                 @Param("status") Subzone.Status status,
                                 Pageable pageable);
}

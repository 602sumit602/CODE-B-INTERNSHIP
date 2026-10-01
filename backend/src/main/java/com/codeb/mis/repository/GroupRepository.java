package com.codeb.mis.repository;

import com.codeb.mis.entity.Group;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    Optional<Group> findByGroupName(String groupName);
    boolean existsByGroupName(String groupName);
    List<Group> findByStatus(Group.Status status);

    @Query("SELECT g FROM Group g WHERE " +
           "(:search IS NULL OR LOWER(g.groupName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(g.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR g.status = :status)")
    Page<Group> searchGroups(@Param("search") String search,
                             @Param("status") Group.Status status,
                             Pageable pageable);
}

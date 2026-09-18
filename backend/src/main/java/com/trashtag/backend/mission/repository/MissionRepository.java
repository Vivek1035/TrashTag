package com.trashtag.backend.mission.repository;

import com.trashtag.backend.common.enums.MissionStatus;
import com.trashtag.backend.mission.entity.Mission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MissionRepository extends JpaRepository<Mission, UUID> {

    List<Mission> findByTrashTagId(UUID trashTagId);

    Page<Mission> findByStatus(MissionStatus status, Pageable pageable);

    Optional<Mission> findByTrashTagIdAndStatusIn(UUID trashTagId, List<MissionStatus> statuses);

    @Query("""
        SELECT m FROM Mission m
        WHERE (:status IS NULL OR m.status = :status)
          AND (:trashTagId IS NULL OR m.trashTagId = :trashTagId)
    """)
    Page<Mission> findByFilters(
            @Param("status") MissionStatus status,
            @Param("trashTagId") UUID trashTagId,
            Pageable pageable
    );
}

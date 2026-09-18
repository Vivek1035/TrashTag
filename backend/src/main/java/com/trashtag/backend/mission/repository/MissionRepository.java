package com.trashtag.backend.mission.repository;

import com.trashtag.backend.common.enums.MissionStatus;
import com.trashtag.backend.mission.entity.Mission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MissionRepository extends JpaRepository<Mission, UUID> {
    List<Mission> findByTrashTagId(UUID trashTagId);
    Page<Mission> findByStatus(MissionStatus status, Pageable pageable);
    Optional<Mission> findByTrashTagIdAndStatusIn(UUID trashTagId, List<MissionStatus> statuses);
}


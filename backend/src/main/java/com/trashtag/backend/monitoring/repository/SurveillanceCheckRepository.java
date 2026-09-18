package com.trashtag.backend.monitoring.repository;

import com.trashtag.backend.monitoring.entity.SurveillanceCheck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SurveillanceCheckRepository extends JpaRepository<SurveillanceCheck, UUID> {
    List<SurveillanceCheck> findByTrashTagIdOrderByCheckedAtAsc(UUID trashTagId);
    Optional<SurveillanceCheck> findByTrashTagIdAndDayMarker(UUID trashTagId, Integer dayMarker);
    boolean existsByTrashTagIdAndDayMarker(UUID trashTagId, Integer dayMarker);
}


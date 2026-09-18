package com.trashtag.backend.recovery.repository;

import com.trashtag.backend.recovery.entity.WasteRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WasteRecordRepository extends JpaRepository<WasteRecord, UUID> {
    List<WasteRecord> findByMissionId(UUID missionId);
    List<WasteRecord> findByTrashTagId(UUID trashTagId);

    @Query("SELECT SUM(w.weightKg) FROM WasteRecord w WHERE w.missionId = :missionId")
    Double sumWeightByMissionId(UUID missionId);

    @Query("SELECT SUM(w.weightKg) FROM WasteRecord w WHERE w.trashTagId = :trashTagId")
    Double sumWeightByTrashTagId(UUID trashTagId);

    @Query("SELECT SUM(w.weightKg) FROM WasteRecord w WHERE w.recordedBy = :userId")
    Double sumWeightByRecordedBy(UUID userId);
}


package com.trashtag.backend.monitoring.repository;

import com.trashtag.backend.monitoring.entity.MonitoringCheckpoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MonitoringCheckpointRepository extends JpaRepository<MonitoringCheckpoint, UUID> {
    List<MonitoringCheckpoint> findByTrashTagIdOrderByCheckpointDaysAsc(UUID trashTagId);
}


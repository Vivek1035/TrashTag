package com.trashtag.backend.mission.repository;

import com.trashtag.backend.mission.entity.MissionParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MissionParticipantRepository extends JpaRepository<MissionParticipant, UUID> {
    List<MissionParticipant> findByMissionId(UUID missionId);
    List<MissionParticipant> findByUserId(UUID userId);
    Optional<MissionParticipant> findByMissionIdAndUserId(UUID missionId, UUID userId);
    boolean existsByMissionIdAndUserId(UUID missionId, UUID userId);
    long countByMissionId(UUID missionId);
}


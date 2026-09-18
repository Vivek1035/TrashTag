package com.trashtag.backend.mission.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "mission_participants", indexes = {
        @Index(name = "idx_mp_mission", columnList = "mission_id"),
        @Index(name = "idx_mp_user", columnList = "user_id")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uq_mission_user", columnNames = {"mission_id", "user_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MissionParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private UUID missionId;

    @Column(nullable = false)
    private UUID userId;

    @Builder.Default
    @Column(nullable = false)
    private boolean checkedIn = false;

    private Instant checkedInAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant joinedAt;
}


package com.trashtag.backend.mission.entity;

import com.trashtag.backend.common.enums.MissionStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "missions", indexes = {
        @Index(name = "idx_mission_trash_tag", columnList = "trash_tag_id"),
        @Index(name = "idx_mission_status", columnList = "status"),
        @Index(name = "idx_mission_scheduled_date", columnList = "scheduled_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private UUID trashTagId;

    @Column(nullable = false)
    private UUID createdBy;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private MissionStatus status = MissionStatus.UPCOMING;

    @Column(nullable = false)
    private Instant scheduledDate;

    private Instant startedAt;
    private Instant completedAt;

    @Column(nullable = false)
    @Builder.Default
    private Integer maxParticipants = 20;

    @Column(length = 300)
    private String meetingPoint;

    private Double meetingLatitude;
    private Double meetingLongitude;

    @Column(length = 500)
    private String equipmentNeeded;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;
}


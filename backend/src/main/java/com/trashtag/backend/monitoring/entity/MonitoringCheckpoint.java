package com.trashtag.backend.monitoring.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "monitoring_checkpoints", indexes = {
        @Index(name = "idx_checkpoint_trash_tag", columnList = "trash_tag_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonitoringCheckpoint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private UUID trashTagId;

    @Column(nullable = false)
    private Integer checkpointDays; // 30, 60, 90

    @Column(nullable = false)
    private Instant scheduledDate;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "PENDING"; // PENDING, VERIFIED, REOPENED

    @Column(columnDefinition = "TEXT")
    private String notes;

    private UUID verifiedBy;

    private Instant verifiedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}


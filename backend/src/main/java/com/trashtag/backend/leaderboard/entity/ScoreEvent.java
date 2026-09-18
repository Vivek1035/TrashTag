package com.trashtag.backend.leaderboard.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "score_events", indexes = {
        @Index(name = "idx_se_user", columnList = "user_id"),
        @Index(name = "idx_se_trash_tag", columnList = "trash_tag_id"),
        @Index(name = "idx_se_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScoreEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private UUID trashTagId;

    @Column(nullable = false, length = 50)
    private String eventType;

    @Column(nullable = false)
    private Integer points;

    @Column(length = 200)
    private String description;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}


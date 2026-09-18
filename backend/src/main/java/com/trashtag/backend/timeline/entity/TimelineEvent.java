package com.trashtag.backend.timeline.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "timeline_events", indexes = {
        @Index(name = "idx_te_trash_tag", columnList = "trash_tag_id"),
        @Index(name = "idx_te_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimelineEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private UUID trashTagId;

    @Column(nullable = false)
    private UUID actorId;

    @Column(nullable = false, length = 50)
    private String eventType;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Optional reference to a related entity (missionId, transformationId, etc.) */
    private UUID relatedEntityId;

    @Column(length = 50)
    private String relatedEntityType;

    @Column(length = 500)
    private String imageUrl;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}


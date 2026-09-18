package com.trashtag.backend.transformation.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "transformations", indexes = {
        @Index(name = "idx_transform_trash_tag", columnList = "trash_tag_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transformation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private UUID trashTagId;

    @Column(nullable = false)
    private UUID submittedBy;

    @Column(nullable = false, length = 100)
    private String transformationType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String preventionStrategy;

    @Column(length = 500)
    private String beforeImageUrl;

    @Column(length = 500)
    private String afterImageUrl;

    private Instant transformedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;
}


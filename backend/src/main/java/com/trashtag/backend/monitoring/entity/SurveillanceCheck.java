package com.trashtag.backend.monitoring.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "surveillance_checks", indexes = {
        @Index(name = "idx_sc_trash_tag", columnList = "trash_tag_id"),
        @Index(name = "idx_sc_check_date", columnList = "checked_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurveillanceCheck {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private UUID trashTagId;

    @Column(nullable = false)
    private UUID checkedBy;

    /** Day marker: 30, 60, or 90 */
    @Column(nullable = false)
    private Integer dayMarker;

    @Builder.Default
    @Column(nullable = false)
    private boolean siteClean = true;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(length = 500)
    private String imageUrl;

    @CreationTimestamp
    @Column(nullable = false, updatable = false, name = "checked_at")
    private Instant checkedAt;
}


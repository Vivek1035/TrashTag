package com.trashtag.backend.trashtag.entity;

import com.trashtag.backend.common.enums.RecoveryStatus;
import com.trashtag.backend.common.enums.Severity;
import com.trashtag.backend.common.enums.WasteType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "trash_tags", indexes = {
        @Index(name = "idx_trashtag_status", columnList = "status"),
        @Index(name = "idx_trashtag_location", columnList = "latitude, longitude"),
        @Index(name = "idx_trashtag_reported_at", columnList = "reported_at"),
        @Index(name = "idx_trashtag_reporter", columnList = "reporter_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrashTag {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    /**
     * Human-readable tag ID, e.g. TT-1024. Populated after insert.
     */
    @Column(unique = true, length = 20)
    private String tagCode;

    @Column(nullable = false)
    private UUID reporterId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private RecoveryStatus status = RecoveryStatus.REPORTED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WasteType wasteType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Severity severity;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(length = 300)
    private String address;

    /** Estimated waste in kilograms */
    private Double estimatedWeightKg;

    /** Actual recovered waste in kilograms */
    private Double recoveredWeightKg;

    @Column(length = 500)
    private String primaryImageUrl;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isDemo = false;

    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private Instant reportedAt;

    private Instant verifiedAt;
    private UUID verifiedBy;

    private Instant lastStatusChangedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;
}


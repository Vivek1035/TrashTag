package com.trashtag.backend.recovery.entity;

import com.trashtag.backend.common.enums.WasteType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "waste_records", indexes = {
        @Index(name = "idx_wr_mission", columnList = "mission_id"),
        @Index(name = "idx_wr_recorder", columnList = "recorded_by")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WasteRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private UUID missionId;

    @Column(nullable = false)
    private UUID trashTagId;

    @Column(nullable = false)
    private UUID recordedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WasteType wasteType;

    /** Weight in kilograms */
    @Column(nullable = false)
    private Double weightKg;

    @Column(length = 300)
    private String notes;

    @Column(length = 500)
    private String imageUrl;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant recordedAt;
}


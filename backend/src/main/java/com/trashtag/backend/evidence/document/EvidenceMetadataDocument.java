package com.trashtag.backend.evidence.document;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Flexible evidence metadata for a TrashTag or Mission.
 * Stores Cloudinary image details, GPS EXIF, and arbitrary metadata.
 * References PostgreSQL IDs; does NOT duplicate entity data.
 */
@Document(collection = "evidence_metadata")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvidenceMetadataDocument {

    @Id
    private String id;

    /** Foreign key reference to PostgreSQL trash_tags.id */
    @Indexed
    private UUID trashTagId;

    /** Optional reference to a mission */
    @Indexed
    private UUID missionId;

    /** Who uploaded this evidence */
    private UUID uploadedBy;

    /** REPORTED, BEFORE_CLEANUP, AFTER_CLEANUP, TRANSFORMATION, MONITORING */
    private String evidencePhase;

    private String cloudinaryPublicId;
    private String cloudinaryUrl;
    private String cloudinarySecureUrl;
    private String format;
    private Long fileSizeBytes;
    private Integer widthPx;
    private Integer heightPx;

    /** GPS coordinates extracted from EXIF if available */
    private Double exifLatitude;
    private Double exifLongitude;

    /** AI-detected tags from Cloudinary or AI provider */
    private List<String> detectedTags;

    /** Any extra metadata (EXIF, color analysis, etc.) */
    private Map<String, Object> metadata;

    @CreatedDate
    private Instant uploadedAt;
}


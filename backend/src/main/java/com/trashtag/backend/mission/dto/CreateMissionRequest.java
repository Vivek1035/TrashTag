package com.trashtag.backend.mission.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMissionRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    private String description;

    @NotNull(message = "TrashTag ID is required")
    private UUID trashTagId;

    @NotNull(message = "Scheduled date is required")
    private Instant scheduledDate;

    @Builder.Default
    @Min(value = 1, message = "Max participants must be at least 1")
    private Integer maxParticipants = 20;

    private Double targetWasteKg;

    private String meetingPoint;
    private Double meetingLatitude;
    private Double meetingLongitude;
    private String equipmentNeeded;
}


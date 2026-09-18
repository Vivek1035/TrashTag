package com.trashtag.backend.trashtag.dto;

import com.trashtag.backend.common.enums.Severity;
import com.trashtag.backend.common.enums.WasteType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateTrashTagRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    private String description;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double longitude;

    private String address;

    @NotNull(message = "Waste type is required")
    private WasteType wasteType;

    @NotNull(message = "Severity is required")
    private Severity severity;

    @Min(value = 0, message = "Estimated waste must be non-negative")
    private Double estimatedWasteKg;

    private String beforeImageUrl;
}


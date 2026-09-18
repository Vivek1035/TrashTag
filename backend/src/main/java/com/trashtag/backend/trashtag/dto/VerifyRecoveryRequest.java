package com.trashtag.backend.trashtag.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyRecoveryRequest {

    @Builder.Default
    private boolean approved = true;

    private String notes;

    @Builder.Default
    private Boolean evidenceGpsVerified = true;

    @Builder.Default
    private Boolean evidenceTimestampVerified = true;

    @Builder.Default
    private Boolean evidenceBeforeImageVerified = true;

    @Builder.Default
    private Boolean evidenceAfterImageVerified = true;

    @Builder.Default
    private Boolean evidenceWasteRecordVerified = true;
}


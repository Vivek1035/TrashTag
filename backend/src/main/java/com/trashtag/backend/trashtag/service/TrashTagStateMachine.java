package com.trashtag.backend.trashtag.service;

import com.trashtag.backend.common.enums.RecoveryStatus;
import com.trashtag.backend.common.exception.InvalidStatusTransitionException;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * TrashTagStateMachine — enforces valid status transitions for the TrashTag lifecycle.
 *
 * State Machine Graph:
 *   REPORTED → VERIFIED → MISSION_CREATED → MISSION_ACTIVE → CLEANUP_COMPLETED
 *   → RECOVERY_VERIFIED → TRANSFORMATION_PLANNED → TRANSFORMED → MONITORING
 *   → SUSTAINED
 *   ↳ MONITORING → REOPENED → MISSION_CREATED
 */
@Component
public class TrashTagStateMachine {

    private static final Map<RecoveryStatus, Set<RecoveryStatus>> VALID_TRANSITIONS = new EnumMap<>(RecoveryStatus.class);

    static {
        VALID_TRANSITIONS.put(RecoveryStatus.REPORTED, Set.of(RecoveryStatus.VERIFIED));
        VALID_TRANSITIONS.put(RecoveryStatus.VERIFIED, Set.of(RecoveryStatus.MISSION_CREATED));
        VALID_TRANSITIONS.put(RecoveryStatus.MISSION_CREATED, Set.of(RecoveryStatus.MISSION_ACTIVE));
        VALID_TRANSITIONS.put(RecoveryStatus.MISSION_ACTIVE, Set.of(RecoveryStatus.CLEANUP_COMPLETED));
        VALID_TRANSITIONS.put(RecoveryStatus.CLEANUP_COMPLETED, Set.of(RecoveryStatus.RECOVERY_VERIFIED));
        VALID_TRANSITIONS.put(RecoveryStatus.RECOVERY_VERIFIED, Set.of(RecoveryStatus.TRANSFORMATION_PLANNED));
        VALID_TRANSITIONS.put(RecoveryStatus.TRANSFORMATION_PLANNED, Set.of(RecoveryStatus.TRANSFORMED));
        VALID_TRANSITIONS.put(RecoveryStatus.TRANSFORMED, Set.of(RecoveryStatus.MONITORING));
        VALID_TRANSITIONS.put(RecoveryStatus.MONITORING, Set.of(RecoveryStatus.SUSTAINED, RecoveryStatus.REOPENED));
        VALID_TRANSITIONS.put(RecoveryStatus.REOPENED, Set.of(RecoveryStatus.MISSION_CREATED));
        VALID_TRANSITIONS.put(RecoveryStatus.SUSTAINED, Collections.emptySet());
    }

    /**
     * Checks if transitioning from {@code current} to {@code target} is permitted.
     */
    public boolean isValidTransition(RecoveryStatus current, RecoveryStatus target) {
        if (current == null || target == null) return false;
        Set<RecoveryStatus> allowed = VALID_TRANSITIONS.getOrDefault(current, Collections.emptySet());
        return allowed.contains(target);
    }

    /**
     * Validates a status transition, throwing InvalidStatusTransitionException if invalid.
     */
    public void validateTransition(RecoveryStatus current, RecoveryStatus target) {
        if (!isValidTransition(current, target)) {
            String currentStr = current != null ? current.name() : "NULL";
            String targetStr = target != null ? target.name() : "NULL";
            throw new InvalidStatusTransitionException(currentStr, targetStr);
        }
    }

    /**
     * Returns the set of valid next statuses from the current status.
     */
    public Set<RecoveryStatus> getNextValidStatuses(RecoveryStatus current) {
        if (current == null) return Collections.emptySet();
        return Collections.unmodifiableSet(VALID_TRANSITIONS.getOrDefault(current, Collections.emptySet()));
    }
}


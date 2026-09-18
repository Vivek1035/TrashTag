package com.trashtag.backend.trashtag;

import com.trashtag.backend.trashtag.service.TrashTagStateMachine;

import com.trashtag.backend.common.enums.RecoveryStatus;
import com.trashtag.backend.common.exception.InvalidStatusTransitionException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.Set;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("TrashTag State Machine Unit Tests")
class TrashTagStateMachineTest {

    private TrashTagStateMachine stateMachine;

    @BeforeEach
    void setUp() {
        stateMachine = new TrashTagStateMachine();
    }

    // ── Valid Transitions ─────────────────────────────────────

    @ParameterizedTest(name = "Valid transition: {0} -> {1}")
    @MethodSource("provideValidTransitions")
    void isValidTransition_validTransitions_returnsTrue(RecoveryStatus from, RecoveryStatus to) {
        assertThat(stateMachine.isValidTransition(from, to)).isTrue();
    }

    @ParameterizedTest(name = "Validate transition: {0} -> {1} succeeds")
    @MethodSource("provideValidTransitions")
    void validateTransition_validTransitions_doesNotThrow(RecoveryStatus from, RecoveryStatus to) {
        stateMachine.validateTransition(from, to);
    }

    private static Stream<Arguments> provideValidTransitions() {
        return Stream.of(
                Arguments.of(RecoveryStatus.REPORTED, RecoveryStatus.VERIFIED),
                Arguments.of(RecoveryStatus.VERIFIED, RecoveryStatus.MISSION_CREATED),
                Arguments.of(RecoveryStatus.MISSION_CREATED, RecoveryStatus.MISSION_ACTIVE),
                Arguments.of(RecoveryStatus.MISSION_ACTIVE, RecoveryStatus.CLEANUP_COMPLETED),
                Arguments.of(RecoveryStatus.CLEANUP_COMPLETED, RecoveryStatus.RECOVERY_VERIFIED),
                Arguments.of(RecoveryStatus.RECOVERY_VERIFIED, RecoveryStatus.TRANSFORMATION_PLANNED),
                Arguments.of(RecoveryStatus.TRANSFORMATION_PLANNED, RecoveryStatus.TRANSFORMED),
                Arguments.of(RecoveryStatus.TRANSFORMED, RecoveryStatus.MONITORING),
                Arguments.of(RecoveryStatus.MONITORING, RecoveryStatus.SUSTAINED),
                Arguments.of(RecoveryStatus.MONITORING, RecoveryStatus.REOPENED),
                Arguments.of(RecoveryStatus.REOPENED, RecoveryStatus.MISSION_CREATED)
        );
    }

    // ── Invalid Transitions ───────────────────────────────────

    @ParameterizedTest(name = "Invalid transition: {0} -> {1}")
    @MethodSource("provideInvalidTransitions")
    void isValidTransition_invalidTransitions_returnsFalse(RecoveryStatus from, RecoveryStatus to) {
        assertThat(stateMachine.isValidTransition(from, to)).isFalse();
    }

    @ParameterizedTest(name = "Validate transition: {0} -> {1} throws InvalidStatusTransitionException")
    @MethodSource("provideInvalidTransitions")
    void validateTransition_invalidTransitions_throwsException(RecoveryStatus from, RecoveryStatus to) {
        assertThatThrownBy(() -> stateMachine.validateTransition(from, to))
                .isInstanceOf(InvalidStatusTransitionException.class)
                .hasMessageContaining("Invalid status transition");
    }

    private static Stream<Arguments> provideInvalidTransitions() {
        return Stream.of(
                Arguments.of(RecoveryStatus.REPORTED, RecoveryStatus.TRANSFORMED),
                Arguments.of(RecoveryStatus.REPORTED, RecoveryStatus.CLEANUP_COMPLETED),
                Arguments.of(RecoveryStatus.REPORTED, RecoveryStatus.MISSION_ACTIVE),
                Arguments.of(RecoveryStatus.REPORTED, RecoveryStatus.SUSTAINED),
                Arguments.of(RecoveryStatus.VERIFIED, RecoveryStatus.SUSTAINED),
                Arguments.of(RecoveryStatus.VERIFIED, RecoveryStatus.TRANSFORMED),
                Arguments.of(RecoveryStatus.CLEANUP_COMPLETED, RecoveryStatus.REPORTED),
                Arguments.of(RecoveryStatus.SUSTAINED, RecoveryStatus.VERIFIED),
                Arguments.of(RecoveryStatus.SUSTAINED, RecoveryStatus.TRANSFORMED),
                Arguments.of(RecoveryStatus.TRANSFORMED, RecoveryStatus.REPORTED),
                Arguments.of(RecoveryStatus.REOPENED, RecoveryStatus.TRANSFORMED)
        );
    }

    @Test
    @DisplayName("Null inputs return false")
    void isValidTransition_nullInputs() {
        assertThat(stateMachine.isValidTransition(null, RecoveryStatus.VERIFIED)).isFalse();
        assertThat(stateMachine.isValidTransition(RecoveryStatus.REPORTED, null)).isFalse();
        assertThat(stateMachine.isValidTransition(null, null)).isFalse();
    }

    @Test
    @DisplayName("getNextValidStatuses returns expected set")
    void getNextValidStatuses_returnsCorrectSet() {
        assertThat(stateMachine.getNextValidStatuses(RecoveryStatus.REPORTED))
                .containsExactly(RecoveryStatus.VERIFIED);

        assertThat(stateMachine.getNextValidStatuses(RecoveryStatus.MONITORING))
                .containsExactlyInAnyOrder(RecoveryStatus.SUSTAINED, RecoveryStatus.REOPENED);

        assertThat(stateMachine.getNextValidStatuses(RecoveryStatus.SUSTAINED))
                .isEmpty();
    }
}


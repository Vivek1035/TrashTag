package com.trashtag.backend.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class InvalidStatusTransitionException extends RuntimeException {
    public InvalidStatusTransitionException(String fromStatus, String toStatus) {
        super(String.format("Invalid status transition from '%s' to '%s'", fromStatus, toStatus));
    }
}


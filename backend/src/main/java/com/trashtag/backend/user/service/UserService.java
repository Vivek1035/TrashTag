package com.trashtag.backend.user.service;

import com.trashtag.backend.common.exception.ResourceNotFoundException;
import com.trashtag.backend.security.services.UserDetailsImpl;
import com.trashtag.backend.user.dto.UserProfileDto;
import com.trashtag.backend.user.entity.User;
import com.trashtag.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * Returns the currently authenticated user's entity.
     */
    @Transactional(readOnly = true)
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl principal = (UserDetailsImpl) auth.getPrincipal();
        return findById(principal.getId());
    }

    /**
     * Returns the ID of the currently authenticated user without a DB lookup.
     */
    public UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl principal = (UserDetailsImpl) auth.getPrincipal();
        return principal.getId();
    }

    @Transactional(readOnly = true)
    public User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    @Transactional(readOnly = true)
    public UserProfileDto getProfile(UUID id) {
        return toDto(findById(id));
    }

    @Transactional(readOnly = true)
    public UserProfileDto getCurrentUserProfile() {
        return toDto(getCurrentUser());
    }

    public static UserProfileDto toDto(User user) {
        return UserProfileDto.builder()
                .id(user.getId().toString())
                .username(user.getUsername())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}


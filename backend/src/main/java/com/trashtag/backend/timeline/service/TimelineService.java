package com.trashtag.backend.timeline.service;

import com.trashtag.backend.common.exception.ResourceNotFoundException;
import com.trashtag.backend.timeline.dto.TimelineEventResponse;
import com.trashtag.backend.timeline.entity.TimelineEvent;
import com.trashtag.backend.timeline.repository.TimelineEventRepository;
import com.trashtag.backend.trashtag.entity.TrashTag;
import com.trashtag.backend.trashtag.repository.TrashTagRepository;
import com.trashtag.backend.user.entity.User;
import com.trashtag.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TimelineService {

    private final TimelineEventRepository timelineEventRepository;
    private final TrashTagRepository trashTagRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<TimelineEventResponse> getGlobalTimeline(String eventType, Pageable pageable) {
        Page<TimelineEvent> eventPage;
        if (eventType != null && !eventType.isBlank() && !"ALL".equalsIgnoreCase(eventType)) {
            eventPage = timelineEventRepository.findByEventTypeOrderByCreatedAtDesc(eventType, pageable);
        } else {
            eventPage = timelineEventRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        List<TimelineEventResponse> responses = mapEventsToResponses(eventPage.getContent());
        return new PageImpl<>(responses, pageable, eventPage.getTotalElements());
    }

    @Transactional(readOnly = true)
    public Page<TimelineEventResponse> getTrashTagTimeline(String tagIdOrCode, String eventType, Pageable pageable) {
        TrashTag trashTag = resolveTrashTag(tagIdOrCode);

        Page<TimelineEvent> eventPage;
        if (eventType != null && !eventType.isBlank() && !"ALL".equalsIgnoreCase(eventType)) {
            eventPage = timelineEventRepository.findByTrashTagIdAndEventTypeOrderByCreatedAtDesc(trashTag.getId(), eventType, pageable);
        } else {
            eventPage = timelineEventRepository.findByTrashTagIdOrderByCreatedAtAsc(trashTag.getId(), pageable);
        }

        List<TimelineEventResponse> responses = mapEventsToResponses(eventPage.getContent());
        return new PageImpl<>(responses, pageable, eventPage.getTotalElements());
    }

    private TrashTag resolveTrashTag(String tagIdOrCode) {
        try {
            UUID uuid = UUID.fromString(tagIdOrCode);
            return trashTagRepository.findById(uuid)
                    .orElseGet(() -> trashTagRepository.findByTagCode(tagIdOrCode)
                            .orElseThrow(() -> new ResourceNotFoundException("TrashTag not found for id/code: " + tagIdOrCode)));
        } catch (IllegalArgumentException e) {
            return trashTagRepository.findByTagCode(tagIdOrCode)
                    .orElseThrow(() -> new ResourceNotFoundException("TrashTag not found for code: " + tagIdOrCode));
        }
    }

    private List<TimelineEventResponse> mapEventsToResponses(List<TimelineEvent> events) {
        if (events.isEmpty()) {
            return Collections.emptyList();
        }

        Set<UUID> trashTagIds = events.stream()
                .map(TimelineEvent::getTrashTagId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> actorIds = events.stream()
                .map(TimelineEvent::getActorId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, TrashTag> trashTagMap = trashTagRepository.findAllById(trashTagIds).stream()
                .collect(Collectors.toMap(TrashTag::getId, t -> t));

        Map<UUID, User> userMap = userRepository.findAllById(actorIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        return events.stream().map(event -> {
            TrashTag tag = trashTagMap.get(event.getTrashTagId());
            User actor = userMap.get(event.getActorId());

            String actorName = "System Volunteer";
            if (actor != null) {
                actorName = actor.getDisplayName() != null && !actor.getDisplayName().isBlank()
                        ? actor.getDisplayName()
                        : actor.getUsername();
            }

            return TimelineEventResponse.builder()
                    .id(event.getId().toString())
                    .trashTagId(event.getTrashTagId().toString())
                    .tagCode(tag != null ? tag.getTagCode() : null)
                    .trashTagTitle(tag != null ? tag.getTitle() : null)
                    .actorId(event.getActorId() != null ? event.getActorId().toString() : null)
                    .actorName(actorName)
                    .eventType(event.getEventType())
                    .title(event.getTitle())
                    .description(event.getDescription())
                    .relatedEntityId(event.getRelatedEntityId() != null ? event.getRelatedEntityId().toString() : null)
                    .relatedEntityType(event.getRelatedEntityType())
                    .imageUrl(event.getImageUrl())
                    .createdAt(event.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }
}


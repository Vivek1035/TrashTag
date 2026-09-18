package com.trashtag.backend.timeline.repository;

import com.trashtag.backend.timeline.entity.TimelineEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TimelineEventRepository extends JpaRepository<TimelineEvent, UUID> {
    Page<TimelineEvent> findByTrashTagIdOrderByCreatedAtAsc(UUID trashTagId, Pageable pageable);
    Page<TimelineEvent> findByActorId(UUID actorId, Pageable pageable);
}


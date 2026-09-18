package com.trashtag.backend.trashtag.repository;

import com.trashtag.backend.common.enums.RecoveryStatus;
import com.trashtag.backend.trashtag.entity.TrashTag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TrashTagRepository extends JpaRepository<TrashTag, UUID> {
    Optional<TrashTag> findByTagCode(String tagCode);
    Page<TrashTag> findByStatus(RecoveryStatus status, Pageable pageable);
    Page<TrashTag> findByReporterId(UUID reporterId, Pageable pageable);
    long countByStatus(RecoveryStatus status);
}


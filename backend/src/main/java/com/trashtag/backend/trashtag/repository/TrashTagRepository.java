package com.trashtag.backend.trashtag.repository;

import com.trashtag.backend.common.enums.RecoveryStatus;
import com.trashtag.backend.common.enums.Severity;
import com.trashtag.backend.common.enums.WasteType;
import com.trashtag.backend.trashtag.entity.TrashTag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TrashTagRepository extends JpaRepository<TrashTag, UUID> {

    Optional<TrashTag> findByTagCode(String tagCode);

    Page<TrashTag> findByStatus(RecoveryStatus status, Pageable pageable);

    Page<TrashTag> findByReporterId(UUID reporterId, Pageable pageable);

    long countByStatus(RecoveryStatus status);

    @Query("""
        SELECT t FROM TrashTag t
        WHERE (:status IS NULL OR t.status = :status)
          AND (:wasteType IS NULL OR t.wasteType = :wasteType)
          AND (:severity IS NULL OR t.severity = :severity)
    """)
    Page<TrashTag> findByFilters(
            @Param("status") RecoveryStatus status,
            @Param("wasteType") WasteType wasteType,
            @Param("severity") Severity severity,
            Pageable pageable
    );
}

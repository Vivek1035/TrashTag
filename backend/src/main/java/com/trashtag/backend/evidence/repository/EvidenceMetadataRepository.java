package com.trashtag.backend.evidence.repository;

import com.trashtag.backend.evidence.document.EvidenceMetadataDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EvidenceMetadataRepository extends MongoRepository<EvidenceMetadataDocument, String> {
    List<EvidenceMetadataDocument> findByTrashTagId(UUID trashTagId);
    List<EvidenceMetadataDocument> findByTrashTagIdAndEvidencePhase(UUID trashTagId, String evidencePhase);
    List<EvidenceMetadataDocument> findByMissionId(UUID missionId);
}


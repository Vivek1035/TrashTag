package com.trashtag.backend.ai.repository;

import com.trashtag.backend.ai.document.AIAnalysisDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AIAnalysisRepository extends MongoRepository<AIAnalysisDocument, String> {
    Optional<AIAnalysisDocument> findFirstByTrashTagIdOrderByCreatedAtDesc(UUID trashTagId);
    List<AIAnalysisDocument> findByTrashTagId(UUID trashTagId);
}


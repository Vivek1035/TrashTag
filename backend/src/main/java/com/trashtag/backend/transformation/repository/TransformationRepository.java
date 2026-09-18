package com.trashtag.backend.transformation.repository;

import com.trashtag.backend.transformation.entity.Transformation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransformationRepository extends JpaRepository<Transformation, UUID> {
    Optional<Transformation> findByTrashTagId(UUID trashTagId);
}


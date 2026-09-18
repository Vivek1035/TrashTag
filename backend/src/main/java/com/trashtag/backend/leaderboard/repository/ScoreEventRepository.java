package com.trashtag.backend.leaderboard.repository;

import com.trashtag.backend.leaderboard.entity.ScoreEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ScoreEventRepository extends JpaRepository<ScoreEvent, UUID> {
    List<ScoreEvent> findByUserIdOrderByCreatedAtDesc(UUID userId);

    @Query("SELECT SUM(s.points) FROM ScoreEvent s WHERE s.userId = :userId")
    Integer sumPointsByUserId(UUID userId);

    @Query("""
        SELECT s.userId, SUM(s.points) as total
        FROM ScoreEvent s
        GROUP BY s.userId
        ORDER BY total DESC
        """)
    List<Object[]> findLeaderboard();
}


package com.trashtag.backend.trashtag.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TagCodeGeneratorService {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Generates a unique tag code like TT-1001, TT-1002 in a thread-safe manner.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public synchronized String generateTagCode() {
        try {
            Long nextVal = jdbcTemplate.queryForObject("SELECT nextval('trash_tag_sequence')", Long.class);
            if (nextVal != null) {
                return "TT-" + nextVal;
            }
        } catch (Exception ignored) {
            // Sequence not available (e.g. H2 test env without flyway)
        }

        // Fallback generator
        Long maxVal = jdbcTemplate.queryForObject(
                "SELECT COALESCE(MAX(CAST(SUBSTRING(tag_code, 4) AS BIGINT)), 999) FROM trash_tags WHERE tag_code LIKE 'TT-%'",
                Long.class);
        long next = (maxVal != null ? maxVal : 999L) + 1;
        return "TT-" + next;
    }
}


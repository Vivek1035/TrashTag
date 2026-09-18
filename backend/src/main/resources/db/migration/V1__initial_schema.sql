-- ============================================================
-- V1__initial_schema.sql
-- TrashTag initial database schema
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── ENUM types ───────────────────────────────────────────────
CREATE TYPE user_role      AS ENUM ('USER', 'VERIFIER', 'ADMIN', 'ORGANIZATION');
CREATE TYPE recovery_status AS ENUM (
    'REPORTED', 'VERIFIED', 'MISSION_CREATED', 'MISSION_ACTIVE',
    'CLEANUP_COMPLETED', 'RECOVERY_VERIFIED', 'TRANSFORMATION_PLANNED',
    'TRANSFORMED', 'MONITORING', 'SUSTAINED', 'REOPENED'
);
CREATE TYPE mission_status AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE waste_type     AS ENUM ('PLASTIC', 'ELECTRONIC', 'ORGANIC', 'CONSTRUCTION', 'MIXED', 'OTHER');
CREATE TYPE severity_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- ── users ────────────────────────────────────────────────────
CREATE TABLE users (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username     VARCHAR(50)  NOT NULL UNIQUE,
    email        VARCHAR(100) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    role         VARCHAR(20)  NOT NULL DEFAULT 'USER',
    display_name VARCHAR(100),
    avatar_url   VARCHAR(500),
    bio          VARCHAR(200),
    active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email    ON users (email);
CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_role     ON users (role);

-- ── trash_tags ───────────────────────────────────────────────
CREATE TABLE trash_tags (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_code               VARCHAR(20) UNIQUE,
    reporter_id            UUID         NOT NULL REFERENCES users (id),
    status                 VARCHAR(30)  NOT NULL DEFAULT 'REPORTED',
    waste_type             VARCHAR(20)  NOT NULL,
    severity               VARCHAR(10)  NOT NULL,
    title                  VARCHAR(200) NOT NULL,
    description            TEXT,
    latitude               DOUBLE PRECISION NOT NULL,
    longitude              DOUBLE PRECISION NOT NULL,
    address                VARCHAR(300),
    estimated_weight_kg    DOUBLE PRECISION,
    primary_image_url      VARCHAR(500),
    reported_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    verified_at            TIMESTAMPTZ,
    verified_by            UUID REFERENCES users (id),
    last_status_changed_at TIMESTAMPTZ,
    created_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trashtag_status      ON trash_tags (status);
CREATE INDEX idx_trashtag_location    ON trash_tags (latitude, longitude);
CREATE INDEX idx_trashtag_reported_at ON trash_tags (reported_at);
CREATE INDEX idx_trashtag_reporter    ON trash_tags (reporter_id);

-- tag_code sequence helper: populated by application after insert
CREATE SEQUENCE trash_tag_sequence START 1000 INCREMENT 1;

-- ── missions ─────────────────────────────────────────────────
CREATE TABLE missions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trash_tag_id     UUID         NOT NULL REFERENCES trash_tags (id),
    created_by       UUID         NOT NULL REFERENCES users (id),
    title            VARCHAR(200) NOT NULL,
    description      TEXT,
    status           VARCHAR(20)  NOT NULL DEFAULT 'UPCOMING',
    scheduled_date   TIMESTAMPTZ  NOT NULL,
    started_at       TIMESTAMPTZ,
    completed_at     TIMESTAMPTZ,
    max_participants INTEGER      NOT NULL DEFAULT 20,
    meeting_point    VARCHAR(300),
    meeting_latitude  DOUBLE PRECISION,
    meeting_longitude DOUBLE PRECISION,
    equipment_needed VARCHAR(500),
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mission_trash_tag     ON missions (trash_tag_id);
CREATE INDEX idx_mission_status        ON missions (status);
CREATE INDEX idx_mission_scheduled_date ON missions (scheduled_date);

-- ── mission_participants ─────────────────────────────────────
CREATE TABLE mission_participants (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id    UUID        NOT NULL REFERENCES missions (id) ON DELETE CASCADE,
    user_id       UUID        NOT NULL REFERENCES users (id),
    checked_in    BOOLEAN     NOT NULL DEFAULT FALSE,
    checked_in_at TIMESTAMPTZ,
    joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_mission_user UNIQUE (mission_id, user_id)
);

CREATE INDEX idx_mp_mission ON mission_participants (mission_id);
CREATE INDEX idx_mp_user    ON mission_participants (user_id);

-- ── waste_records ────────────────────────────────────────────
CREATE TABLE waste_records (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id  UUID             NOT NULL REFERENCES missions (id),
    trash_tag_id UUID            NOT NULL REFERENCES trash_tags (id),
    recorded_by UUID             NOT NULL REFERENCES users (id),
    waste_type  VARCHAR(20)      NOT NULL,
    weight_kg   DOUBLE PRECISION NOT NULL,
    notes       VARCHAR(300),
    image_url   VARCHAR(500),
    recorded_at TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wr_mission  ON waste_records (mission_id);
CREATE INDEX idx_wr_recorder ON waste_records (recorded_by);

-- ── transformations ──────────────────────────────────────────
CREATE TABLE transformations (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trash_tag_id         UUID         NOT NULL REFERENCES trash_tags (id),
    submitted_by         UUID         NOT NULL REFERENCES users (id),
    transformation_type  VARCHAR(100) NOT NULL,
    description          TEXT,
    prevention_strategy  TEXT,
    before_image_url     VARCHAR(500),
    after_image_url      VARCHAR(500),
    transformed_at       TIMESTAMPTZ,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transform_trash_tag ON transformations (trash_tag_id);

-- ── surveillance_checks ──────────────────────────────────────
CREATE TABLE surveillance_checks (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trash_tag_id UUID        NOT NULL REFERENCES trash_tags (id),
    checked_by   UUID        NOT NULL REFERENCES users (id),
    day_marker   INTEGER     NOT NULL,
    site_clean   BOOLEAN     NOT NULL DEFAULT TRUE,
    notes        TEXT,
    image_url    VARCHAR(500),
    checked_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_sc_tag_day UNIQUE (trash_tag_id, day_marker)
);

CREATE INDEX idx_sc_trash_tag  ON surveillance_checks (trash_tag_id);
CREATE INDEX idx_sc_check_date ON surveillance_checks (checked_at);

-- ── timeline_events ──────────────────────────────────────────
CREATE TABLE timeline_events (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trash_tag_id        UUID         NOT NULL REFERENCES trash_tags (id),
    actor_id            UUID         NOT NULL REFERENCES users (id),
    event_type          VARCHAR(50)  NOT NULL,
    title               VARCHAR(300) NOT NULL,
    description         TEXT,
    related_entity_id   UUID,
    related_entity_type VARCHAR(50),
    image_url           VARCHAR(500),
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_te_trash_tag  ON timeline_events (trash_tag_id);
CREATE INDEX idx_te_created_at ON timeline_events (created_at);

-- ── score_events ─────────────────────────────────────────────
CREATE TABLE score_events (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL REFERENCES users (id),
    trash_tag_id UUID        NOT NULL REFERENCES trash_tags (id),
    event_type   VARCHAR(50) NOT NULL,
    points       INTEGER     NOT NULL,
    description  VARCHAR(200),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_se_user       ON score_events (user_id);
CREATE INDEX idx_se_trash_tag  ON score_events (trash_tag_id);
CREATE INDEX idx_se_created_at ON score_events (created_at);


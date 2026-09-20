# TrashTag Backend

> Community-powered environmental recovery platform.  
> **"Tag the problem. Track the recovery. Prevent the return."**

---

## Architecture

```
Next.js (frontend)
    │
    │  REST API  (JSON / JWT)
    ▼
Spring Boot (modular monolith)
    │
    ├── PostgreSQL  (transactional data — entities, lifecycle)
    ├── MongoDB     (flexible/AI data — AIAnalysis, EvidenceMetadata)
    ├── Cloudinary  (image storage)
    └── AI Provider (Gemini / OpenAI / mock)
```

### Module Structure

```
com.trashtag.backend
├── auth            — JWT, Spring Security filters
├── user            — User entity, UserRepository, UserService
├── trashtag        — TrashTag entity, lifecycle state machine
├── mission         — Mission, MissionParticipant
├── recovery        — WasteRecord (cleanup evidence)
├── transformation  — Transformation, prevention strategy
├── monitoring      — SurveillanceCheck (30/60/90-day checks)
├── timeline        — TimelineEvent (immutable audit trail)
├── leaderboard     — ScoreEvent (points ledger)
├── ai              — AIAnalysisDocument (MongoDB), AI provider abstraction
├── evidence        — EvidenceMetadataDocument (MongoDB), Cloudinary
└── common          — Enums, exceptions, configs, API response types
```

---

## TrashTag Lifecycle

```
REPORTED → VERIFIED → MISSION_CREATED → MISSION_ACTIVE
→ CLEANUP_COMPLETED → RECOVERY_VERIFIED
→ TRANSFORMATION_PLANNED → TRANSFORMED
→ MONITORING → SUSTAINED
             ↘ REOPENED → MISSION_CREATED (cycle repeats)
```

The backend enforces these transitions — the frontend cannot set arbitrary statuses.

---

## Database Setup

### PostgreSQL

Using Docker Compose (recommended):

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port `5432` — database: `trashtag`, user: `trashtag_user`
- MongoDB on port `27017`

#### Manual setup

```sql
CREATE DATABASE trashtag;
CREATE USER trashtag_user WITH PASSWORD 'trashtag_password';
GRANT ALL PRIVILEGES ON DATABASE trashtag TO trashtag_user;
```

### Flyway Migrations

Schema is managed by Flyway. Migrations live in:
```
src/main/resources/db/migration/V*.sql
```

Flyway runs automatically on startup. Do **not** use `ddl-auto: create` or `update` in production.

---

## MongoDB Setup

MongoDB stores AI analysis output and flexible evidence metadata.  
All MongoDB documents reference PostgreSQL IDs (e.g., `trashTagId`) but do **not** duplicate entity data.

Collections:
- `ai_analyses` — AI-generated analysis per TrashTag
- `evidence_metadata` — Cloudinary image metadata, EXIF data, AI tags

---

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `POSTGRES_URL` | JDBC URL for PostgreSQL |
| `POSTGRES_USERNAME` | PostgreSQL username |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `MONGODB_URI` | MongoDB connection URI |
| `JWT_SECRET` | JWT signing secret (≥256 bits) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `AI_API_KEY` | Gemini/OpenAI API key |
| `AI_API_URL` | AI API endpoint URL |
| `SPRING_PROFILES_ACTIVE` | Active Spring profile (`dev`, `prod`) |

---

## How to Run

### Prerequisites

- Java 21+
- Maven 3.9+
- Docker + Docker Compose (for databases)

### 1. Start Databases

```bash
docker-compose up -d
```

### 2. Run the Backend (dev profile)

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

The API will be available at: `http://localhost:8080`

### Auth Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `GET` | `/api/test/all` | Public endpoint |
| `GET` | `/api/test/user` | Authenticated endpoint |

### Hackathon Demo Endpoints (`@Profile("!prod")`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/demo/create` | Seed a new isolated demo TrashTag (`REPORTED`) |
| `POST` | `/api/demo/{tagId}/step/{stepNumber}` | Advance TrashTag through lifecycle step (1 to 15) |
| `POST` | `/api/demo/{tagId}/auto-run` | Auto-execute all 15 steps sequentially |

**Register example:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"secret123"}'
```

**Login example:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}'
```

### 3. Run Tests

```bash
mvn test
```

Tests use H2 in-memory database and exclude MongoDB — no running databases required.

---

## Production Notes

- Set `SPRING_PROFILES_ACTIVE=prod` and provide all environment variables via your deployment secrets manager.
- Never commit `.env` to version control.
- Use a strong, cryptographically random `JWT_SECRET`.
- Flyway will run migrations on first startup.


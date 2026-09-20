# TrashTag

> **"Tag the problem. Track the recovery. Prevent the return."**

TrashTag is a community-driven environmental recovery and accountability platform designed to break the infinite loop of recurring illegal waste dumping. By combining AI hotspot classification, field verifier proof-of-recovery protocols, community cleanup missions, 30/60/90-day biweekly surveillance audits, physical site transformation, and action-derived gamification, TrashTag ensures that cleaned pollution sites achieve permanent ecological recovery.

---

## Problem

Across urban and rural communities worldwide, traditional environmental cleanup efforts fail due to a fundamental flaw: **they treat symptoms instead of root causes**.

1. **The Broken Cleanup Loop**: Citizens or volunteers organize cleanups, clear tons of waste, and celebrate the result. However, without post-cleanup monitoring, enforcement, or site transformation, unmonitored locations revert back to illegal dumping grounds within 30 to 60 days.
2. **Volunteer Burnout**: Repeatedly cleaning the same location breeds cynicism and exhausts volunteer momentum.
3. **Lack of Verifiable Accountability**: Municipalities and NGOs lack transparent data on whether cleanups led to long-term recovery or temporary aesthetic fixes.
4. **Uncoordinated Response**: Citizens, NSS volunteer units, field verifiers, and municipal waste departments operate in silos without a unified source of truth.

---

## Solution

TrashTag replaces temporary cleanups with an unbroken **90-Day Verified Recovery Protocol**.

- **AI-Powered Hotspot Tagging**: Citizens log pollution hotspots with photos and GPS coordinates; AI models evaluate waste severity, risk level, and generate tailored prevention recommendations.
- **On-Ground Verification**: Certified field verifiers inspect reported hotspots and validate cleanup completion before sites transition between lifecycle phases.
- **Mobilized Community Missions**: Local volunteer groups, NSS units, and municipal workers coordinate equipment, volunteers, and scheduled cleanups.
- **Mandatory 30/60/90-Day Surveillance Audits**: Field verifiers perform mandatory biweekly audits at 30, 60, and 90 days. If waste returns during any audit, the hotspot resets to `REOPENED` with elevated priority.
- **Physical Site Transformation**: Once a site completes 90 days of verified zero-dumping, community partners convert the land into green parks, urban gardens, or public spaces, eliminating the physical space for future dumping.
- **Transparent Gamification**: An action-derived ledger records non-duplicative impact points (`ScoreEvents`) for reports, cleanups, inspections, and transformations.

---

## Key Innovation

The core innovation of TrashTag is its **Closed-Loop 90-Day Surveillance & Physical Transformation Engine**.

Unlike platforms that archive a hotspot immediately after a cleanup photo is uploaded, TrashTag enforces a **non-repeating state machine** that holds community stakeholders accountable for 90 consecutive days post-cleanup. By pairing automated surveillance tracking with physical site transformation (converting vulnerable vacant plots into active community green assets), TrashTag physically and socially prevents waste from returning.

---

## Features

- 📍 **GIS Geospatial Hotspot Map**: Real-time Leaflet map displaying active hotspots, status filters (Reported, In Progress, Monitored, Recovered, Reopened), and severity heat indicators.
- 🤖 **AI Waste Classification & Prevention Advisory**: Multi-class detection analyzing waste categories, estimated mass (kg), severity index (1–10), and actionable prevention steps.
- 🛡️ **Role-Based Access Control (RBAC)**: Distinct permissions for `USER` (Citizens), `VERIFIER` (Field Auditors), `ORGANIZATION` (NSS/NGO Coordinators), and `ADMIN`.
- 🧹 **Mission Mobilization Hub**: Volunteer sign-ups, equipment checklists, target waste mass logging, and team coordination.
- 👁️ **30/60/90-Day Biweekly Surveillance Audit Suite**: Scheduled verification checks with before/after evidence photos, cleanliness scoring, and automated re-opening triggers.
- 🌳 **Site Transformation Pipeline**: Community proposal, funding, landscaping, and inauguration tracking.
- 🏆 **Immutable Action-Based Gamification**: Non-duplicative points ledger (`ScoreEvent`) rewarding verified actions, leveling up volunteer ranks and community badges.
- ⚡ **Hackathon Demo Control Panel**: Development mode simulator enabling judges to test the full 15-step 90-day recovery lifecycle in 3 minutes.

---

## Recovery Lifecycle

The TrashTag recovery workflow consists of 15 sequential states:

```
[01. REPORTED] ──> [02. AI_ANALYZED] ──> [03. VERIFIED] ──> [04. MISSION_SCHEDULED]
                                                                      │
[08. MONITORING_30_PENDING] <── [07. CLEANUP_VERIFIED] <── [06. CLEANED] <── [05. MISSION_IN_PROGRESS]
         │
         ├──> (Pass) ──> [09. MONITORING_60_PENDING] ──> (Pass) ──> [10. MONITORING_90_PENDING]
         │                                                                  │
         │ (Audit Failed)                                           (Pass)  ▼
         └─────────────────────────────────────────────────────────> [11. RECOVERED]
                                                                            │
[15. REOPENED] <── (Waste Returns during Audits)                             ▼
                                                                  [12. TRANSFORMATION_PROPOSED]
                                                                            │
[14. TRANSFORMED] <── [13. TRANSFORMATION_COMPLETED] <── [12. TRANSFORMATION_IN_PROGRESS]
```

### Phase Breakdown

1. **REPORTED**: Citizen tags a waste location with primary photo, title, description, and GPS coordinates.
2. **AI_ANALYZED**: AI analyzes the photo, outputting severity score (1-10), waste categories, estimated weight, and prevention suggestions.
3. **COMMUNITY_VERIFIED / FIELD_VERIFIED**: Certified verifier inspects on-ground conditions and confirms valid hotspot status.
4. **MISSION_SCHEDULED**: Organization coordinates cleanup mission date, volunteer quota, and equipment list.
5. **MISSION_IN_PROGRESS**: Volunteers gather on-site and log attendance.
6. **CLEANED**: Volunteers log cleanup completion, actual waste weight collected (kg), and post-cleanup photos.
7. **CLEANUP_VERIFIED**: Verifier inspects cleaned site to confirm full waste removal.
8. **MONITORING_30_PENDING**: System schedules Day 30 audit check.
9. **MONITORING_30_PASSED**: Verifier inspects site on Day 30; zero waste detected.
10. **MONITORING_60_PENDING & PASSED**: Verifier inspects site on Day 60; zero waste detected.
11. **MONITORING_90_PENDING & PASSED**: Verifier inspects site on Day 90; site officially declared **RECOVERED**.
12. **TRANSFORMATION_PROPOSED**: Community submits green garden or park transformation plan.
13. **TRANSFORMATION_IN_PROGRESS**: Landscaping, fencing, or garden planting underway.
14. **TRANSFORMATION_COMPLETED / TRANSFORMED**: Site converted into active public asset; permanent zero-dumping achieved.
15. **REOPENED**: Triggered if waste is detected during any 30/60/90-day audit. The site resets with elevated priority for immediate re-cleanup.

---

## Architecture

```
+-------------------------------------------------------+
|                    Next.js 14                         |
|      (React App Router, TypeScript, Tailwind CSS)     |
+-------------------------------------------------------+
                           │
                           │ HTTP REST / JSON / JWT
                           ▼
+-------------------------------------------------------+
|                 Spring Boot 3.2+                      |
|         (Java 21, Spring Security, JPA, MongoDB)      |
+-------------------------------------------------------+
          │                │                │
          │ JDBC/SQL       │ Mongo Protocol │ HTTP API
          ▼                ▼                ▼
  +---------------+  +-----------+  +---------------+
  |  PostgreSQL   |  |  MongoDB  |  |  Cloudinary   |
  | (Relational)  |  | (Document)|  | (Image Assets)|
  +---------------+  +-----------+  +---------------+
                                            │
                                            │ AI SDK / REST
                                            ▼
                                    +---------------+
                                    |  AI Provider  |
                                    | (Gemini Vision|
                                    |   Service)    |
                                    +---------------+
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Lucide Icons
- **Mapping**: Leaflet, React-Leaflet
- **State & HTTP**: React Context API, Fetch API

### Backend
- **Framework**: Spring Boot 3.2+
- **Language**: Java 21
- **Security**: Spring Security (Stateless JWT Authentication, BCrypt Password Hashing)
- **Data Access**: Spring Data JPA (Hibernate), Spring Data MongoDB

### Databases & Cloud Services
- **Relational Database**: PostgreSQL 15+
- **Document Store**: MongoDB 6+
- **Media Storage**: Cloudinary Image Storage & Delivery CDN
- **AI Vision Engine**: Google Gemini 1.5 Vision API

---

## Database Design

TrashTag utilizes a **hybrid dual-database architecture** designed to capitalize on the strengths of both relational and document-oriented storage models:

```
                  ┌─────────────────────────────────────────┐
                  │          PostgreSQL Database            │
                  ├─────────────────────────────────────────┤
                  │  • users (Accounts, Passwords, Roles)   │
                  │  • trashtags (Core State & Coordinates) │
                  │  • missions (Cleanup Events & Volunteers│
                  │  • verifications (Audit Logs & Status)  │
                  │  • score_events (Gamification Ledger)   │
                  └─────────────────────────────────────────┘
                                       │
                                       │ Foreign Key ID References
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │            MongoDB Database             │
                  ├─────────────────────────────────────────┤
                  │  • ai_analyses (JSON Waste Classification)
                  │  • inspection_evidence (Multi-Photo Logs)│
                  │  • transformation_plans (Design Schemas)│
                  └─────────────────────────────────────────┘
```

### Why Dual Storage?

1. **PostgreSQL (Transactional Relational Data)**:
   - Manages core entities: Users, TrashTags, Missions, Verifications, and ScoreEvents.
   - Enforces strict foreign key constraints, ACID compliance, transactional integrity, and non-repeating state transitions.
   - Ensures immutable audit trails for points and user role authorizations.

2. **MongoDB (Flexible AI & Evidence Documents)**:
   - Stores unstructured and schema-flexible payloads such as raw AI vision responses, bounding boxes, confidence score distributions, prevention recommendations, and multi-image inspection arrays.
   - Enables rapid iteration on AI output schemas without requiring database migrations on transactional SQL tables.

---

## Authentication

TrashTag implements stateless JWT (JSON Web Token) authentication backed by Spring Security.

- **Token Structure**: Signed with HS256 algorithm containing claims: `sub` (user email), `userId`, `name`, and `role`.
- **Stateless Filter**: `JwtAuthenticationFilter` intercepts incoming HTTP requests, validates token signature and expiration, and hydrates the `SecurityContextHolder`.
- **Role Hierarchy**:
  - `USER`: Can report hotspots, join missions, and view personal impact stats.
  - `VERIFIER`: Can perform field verifications, conduct 30/60/90-day audits, and update recovery statuses.
  - `ORGANIZATION`: Can create and manage community cleanup missions.
  - `ADMIN`: Full administrative control over system parameters, user roles, and data overrides.
- **Password Protection**: User passwords are encrypted using BCrypt key-stretching hashing before persistence.

---

## API

### Major Endpoints

#### Authentication
- `POST /api/auth/register` — Register a new user account.
- `POST /api/auth/login` — Authenticate user and receive JWT bearer token.
- `GET /api/auth/me` — Retrieve current authenticated user profile.

#### TrashTag Hotspots
- `POST /api/trashtags` — Create a new waste hotspot report (Photo URL, GPS lat/lng, title, description).
- `GET /api/trashtags` — Query hotspots with optional status, severity, and location filters.
- `GET /api/trashtags/{id}` — Fetch detailed hotspot profile, timeline, and current stage.
- `POST /api/trashtags/{id}/analyze` — Trigger AI vision analysis for waste classification and prevention advice.

#### Verification
- `POST /api/verifications` — Submit field verification (Requires `VERIFIER` or `ADMIN` role).

#### Missions
- `POST /api/missions` — Schedule a new cleanup mission for a hotspot.
- `POST /api/missions/{id}/join` — Register volunteer participation in a mission.
- `POST /api/missions/{id}/complete` — Log cleanup completion evidence and waste collected (kg).

#### Monitoring & Surveillance
- `POST /api/monitoring/inspections` — Log 30, 60, or 90-day biweekly audit check (Clean score 1–5, status pass/fail).

#### Transformation
- `POST /api/transformations` — Submit green park or community garden transformation plan.
- `PUT /api/transformations/{id}/status` — Update transformation project progress.

#### Leaderboard & Gamification
- `GET /api/leaderboard` — Fetch global volunteer rankings, points ledger, and earned badges.

#### Hackathon Demo Simulator
- `POST /api/demo/step` — Advance hotspot lifecycle by 1 step in demo mode.
- `POST /api/demo/autoplay` — Execute full 15-step recovery lifecycle automatically.
- `POST /api/demo/reset` — Reset demo hotspot to initial `REPORTED` state.

---

## State Machine

TrashTag enforces strict unidirectional state transitions validated by backend services (`StatusTransitionValidator`). Invalid state skips or unauthorized status mutations are rejected with HTTP 400 Bad Request.

```
REPORTED ──> AI_ANALYZED ──> VERIFIED ──> MISSION_SCHEDULED ──> MISSION_IN_PROGRESS ──> CLEANED
                                                                                             │
REOPENED <── (Failed Audit Check) <── [MONITORING 30 / 60 / 90] <── CLEANUP_VERIFIED <───────┘
   │
   (Re-cleaned) ──> CLEANED
   
MONITORING_90_PASSED ──> RECOVERED ──> TRANSFORMATION_PROPOSED ──> TRANSFORMATION_IN_PROGRESS ──> TRANSFORMED
```

---

## AI

TrashTag integrates Google Gemini Vision AI to perform automated visual hotspot inspection.

- **Waste Classification**: Detects dominant waste materials (e.g., Single-Use Plastics, E-Waste, Organic Waste, Construction Debris).
- **Severity Scoring**: Assigns an objective Severity Index from 1 (minor littering) to 10 (critical toxic dump site).
- **Mass & Hazard Estimation**: Estimates approximate waste volume/weight and notes contamination risks (e.g., proximity to water bodies).
- **Prevention Plan Generation**: Recommends targeted preventative measures (e.g., install CCTV cameras, place 240L bins, erect perimeter fencing, schedule municipal pickup).

> **⚠️ Advisory Disclaimer**: All AI analysis outputs are strictly advisory. Final classification, risk validation, and lifecycle phase approvals require human confirmation by certified field verifiers or community administrators.

---

## Monitoring

The **30/60/90-Day Biweekly Surveillance Audit** protocol is TrashTag's defense against recurring pollution.

1. **Biweekly Cadence**: Once a cleanup is verified (`CLEANUP_VERIFIED`), automated audit checks are scheduled for Day 30, Day 60, and Day 90.
2. **Audit Parameters**: Verifiers inspect the site on-ground and submit:
   - Current cleanliness rating (1 to 5 stars).
   - Time-stamped, geofenced evidence photo.
   - Audit outcome (`PASS` or `FAIL`).
3. **Recovery Threshold**: Achieving `PASS` on Day 90 grants the site official **RECOVERED** status.
4. **Reopened Protocol**: If waste dumping is detected during any check, the site fails the audit and immediately transitions to `REOPENED`. This alerts local volunteer coordinators and elevates the site's priority for swift re-intervention.

---

## Gamification

TrashTag drives volunteer engagement through an action-derived, non-duplicative points ledger (`ScoreEvent`).

### Points Ledger Schedule

| Action | Impact Points (XP) | Criteria |
| :--- | :--- | :--- |
| **Hotspot Report** | `+20 XP` | Log valid hotspot with GPS and primary photo |
| **Mission Join** | `+10 XP` | Sign up as volunteer for a scheduled mission |
| **Mission Complete** | `+30 XP` | Participate in and complete cleanup mission |
| **Field Verification** | `+50 XP` | Verifier completes certified on-ground audit |
| **Audit Passed** | `+20 XP` | Site passes 30, 60, or 90-day surveillance check |
| **Transformation Complete**| `+50 XP` | Site successfully transformed into green public space |

To prevent abuse, the backend checks for prior `ScoreEvent` entries tied to specific `(userId, actionType, targetId)` tuples before awarding points.

---

## Security

- **JWT Authentication**: Tokens are signed with strong secret keys and validated statelessly on every non-public request.
- **BCrypt Encryption**: User passwords are stored using BCrypt password hashing with default strength factor of 10.
- **Role-Based Authorization**: Endpoints are secured via `@PreAuthorize("hasRole('ROLE')")` annotations and Spring Security request matcher rules.
- **Input Validation**: Request DTOs are validated using Jakarta Bean Validation (`@NotNull`, `@NotBlank`, `@Size`, `@Email`).
- **Environment Isolation**: Production credentials (database URIs, JWT secrets, Cloudinary keys, AI API keys) are managed externally through environment variables and excluded from source control.

---

## Local Setup

### Prerequisites
- **Java 21+** & **Maven 3.9+**
- **Node.js 18+** & **npm**
- **PostgreSQL 15+** & **MongoDB 6+** (or Docker)

---

### 1. Clone Repository
```bash
git clone https://github.com/Vivek1035/TrashTag.git
cd TrashTag
```

---

### 2. Environment Configuration

Create a `.env` file or set environment variables in `backend/src/main/resources/application-dev.yml`:

```yaml
# Database Credentials
SPRING_DATASOURCE_URL: jdbc:postgresql://localhost:5432/trashtag_db
SPRING_DATASOURCE_USERNAME: postgres
SPRING_DATASOURCE_PASSWORD: your_postgres_password

SPRING_DATA_MONGODB_URI: mongodb://localhost:27017/trashtag_mongo

# JWT Configuration
JWT_SECRET: your_super_secret_jwt_key_that_is_at_least_256_bits_long
JWT_EXPIRATION_MS: 86400000

# Cloudinary Integration
CLOUDINARY_CLOUD_NAME: your_cloud_name
CLOUDINARY_API_KEY: your_api_key
CLOUDINARY_API_SECRET: your_api_secret

# AI Provider Integration
GEMINI_API_KEY: your_gemini_vision_api_key
```

---

### 3. Start Backend API
```bash
cd backend
mvn clean spring-boot:run "-Dspring-boot.run.profiles=dev"
```
*Backend runs on `http://localhost:8080`*

---

### 4. Start Frontend Next.js App
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

## Demo

### 3-Minute Hackathon Demo Script

1. **Minute 1: Tagging & AI Analysis** (`/report`)
   - Log in using Demo Role Switcher as **Anika Rao (Scout User)**.
   - Tag a new waste hotspot with primary photo and GPS location.
   - Click **Trigger AI Analysis** to view AI classification, waste categories, severity score (8/10), and prevention recommendations.

2. **Minute 2: Verification & Mission Cleanup** (`/recovery/TT-D01`)
   - Switch role to **Priya Krishnan (Verifier)** and confirm field verification.
   - Switch role to **Green Bengaluru (Organization)** and create a Cleanup Mission.
   - Complete the mission with volunteer logs and cleanup evidence photo.

3. **Minute 3: 30/60/90 Monitoring, Auto-Play & Transformation** (`/recovery/TT-D01` & `/transformation/TS-D01`)
   - Open the embedded **Hackathon Demo Control Panel** on `/recovery/TT-D01`.
   - Click **Auto-Play All Steps** to watch the state machine transition through Day 30, Day 60, and Day 90 surveillance audits into official **RECOVERED** status.
   - View the final **Site Transformation** page (`/transformation/TS-D01`) converting the site into a green park, and check updated points on `/leaderboard`.

---

## Future Improvements

- 📊 **Organization & Municipal Dashboards**: Dedicated portal for city waste management authorities to view ward-wise recovery metrics and resource allocation.
- 🏢 **Municipal ERP Integration**: Direct API integration with municipal ticket dispatch and smart city waste management systems.
- 🗺️ **Geospatial Hotspot Prediction**: Machine learning predictive models forecasting illegal dumping risks based on historical data, weather patterns, and urban density.
- 🛸 **Computer Vision & Aerial Surveillance**: Edge AI models integrated with drone feeds for automated aerial illegal dump detection.
- 🔔 **Real-Time Notification System**: WebPush, SMS, and WhatsApp alerts for volunteers when cleanups or audit checks are scheduled nearby.
- 🛰️ **IoT Physical Verification**: Solar-powered smart optical sensors stationed at recovered sites to automatically detect illegal dumping attempts.

---

*Designed & Developed by **Vivek Singh***  
[GitHub](https://github.com/Vivek1035) • [LinkedIn](https://www.linkedin.com/in/vivek-singh-087b46243/)

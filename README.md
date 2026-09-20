# TrashTag — Environmental Hotspot Recovery Platform

> **"Tag the problem. Track the recovery. Prevent the return."**

TrashTag is a community-powered environmental recovery platform that turns local pollution hotspots into verified cleanups, AI prevention plans, community missions, and 30/60/90-day monitoring audits.

---

## 🚀 Hackathon Demo Mode

To demonstrate the full 15-step recovery lifecycle quickly without waiting 90 days for actual monitoring checks, TrashTag includes a safe, development-only **Hackathon Demo Mode**.

### 🌟 Key Features of Demo Mode
- **Persistent Demo Indicator**: Top header banner displaying `DEMO MODE` status and quick launch shortcut across all pages.
- **15-Step Lifecycle Simulator**: Control panel embedded on `/recovery/[id]` allowing single-step execution or instant 15-step auto-play.
- **Real Backend Rule Execution**: Demo actions execute the actual backend state-machine services (`TrashTagService`, `VerificationService`, `MissionService`, `TransformationService`, `MonitoringService`), recording immutable `TimelineEvents` and awarding non-duplicate `ScoreEvents`.
- **Dumping Return Simulation**: Checkbox to simulate waste return on Day 90, demonstrating the `REOPENED` lifecycle branch.
- **Production Guard**: Endpoints annotated with `@Profile("!prod")` (automatically disabled when deployed in production).

---

## 💻 How to Run Locally

### Prerequisites
- **Java 21+** & **Maven 3.9+**
- **Node.js 18+** & **npm**
- **Docker & Docker Compose** (Optional for PostgreSQL & MongoDB; H2 fallback available for testing)

---

### 1. Start Backend API
```bash
cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```
*Backend runs on `http://localhost:8080`*

### 2. Start Frontend Next.js App
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

## 🧪 Testing

### Backend Integration Tests (103 Tests)
```bash
cd backend
mvn test
```

### Frontend Production Build Verification
```bash
cd frontend
npm run build
```

---

## 🗺️ Key Routes

- `/` — Landing Page with brand headline & lifecycle overview
- `/dashboard` — Authenticated dashboard & impact overview
- `/explore` — Interactive geospatial hotspot map
- `/recovery/TT-D01` — Lifecycle detail page & **Hackathon Demo Control Panel**
- `/leaderboard` — Community impact leaderboard & points ledger
- `/monitoring` — 30/60/90-day monitoring dashboard


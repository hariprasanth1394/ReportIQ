# Reporter Platform

Centralized Selenium Test Execution Reporting Tool combining a Node.js API, React UI, and Selenium + TestNG sample tests with a streaming listener.

## Architecture
- **reporter-backend (Node.js/Express)**: Auth (JWT), execution ingestion APIs, in-memory store, CORS and security middleware.
- **reporter-frontend (React + Vite + MUI)**: Login, dashboard of executions, detail view with step timeline and screenshots.
- **selenium-tests (Java + TestNG + Selenium 4)**: Sample cross-browser tests plus a TestNG listener that streams events (start/step/error/finish) to the backend while tests run.

## Data Model (API)
- Execution: `id`, `testName`, `browser`, `status` (RUNNING/PASS/FAIL), `startedAt`, `finishedAt`, `steps[]`, `error`.
- Step: `id`, `stepName`, `status` (PASS/FAIL/RUNNING), `timestamp`, optional `screenshot` (Base64), optional `error` string.

## Prerequisites
- Node.js 18+
- Maven 3.9+, JDK 17+
- Browsers and matching drivers (Selenium Manager in 4.6+ downloads automatically for Chrome/Firefox/Edge)

## Backend (reporter-backend)
```bash
cd reporter-backend
cp .env.example .env # adjust if needed
npm install
npm run dev   # or: npm start
```
Default creds: `admin/password`. Health: `GET /health` on port 4000.

## Frontend (reporter-frontend)
```bash
cd reporter-frontend
npm install
npm run dev -- --host --port 5173
```
Create `.env` if you need to override API base: `VITE_API_BASE=http://localhost:4000`.

## Selenium Tests (selenium-tests)
```bash
cd selenium-tests
mvn clean test \
  -Dreporter.api=http://localhost:4000 \
  -Dreporter.token=<JWT_FROM_LOGIN> \
  -Dbrowser=chrome
```
- `reporter.token` should be a JWT obtained from the backend login API.
- `browser` supports `chrome`, `firefox`, or `edge` (defaults to chrome if omitted).

## Flow
1. Backend starts and exposes `/api/auth/login` and `/api/executions/*` endpoints (JWT required except login).
2. Frontend authenticates via common credentials and uses the token for fetching executions.
3. Selenium tests generate a UUID per test, listener calls `/start`, emits `/step` and `/error`, then `/finish`.
4. Dashboard auto-refreshes to display live status and step-by-step details with screenshots.

## Notes
- Storage is in-memory for simplicity; swap `executionStore` for a database as needed.
- CORS origins are configurable via `CORS_ORIGINS` in the backend `.env`.
- Increase payload limits or file storage if screenshots are large.

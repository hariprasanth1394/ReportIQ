# Reporter Platform

Centralized Selenium Test Execution Reporting Tool combining a Node.js API, React UI, and Selenium + TestNG sample tests with a streaming listener.

## Features

### Dashboard Analytics
- Real-time test execution tracking
- Multi-metric dashboard with key statistics
- Pass/fail distribution visualization
- Browser coverage analysis
- Advanced filtering (date range, browser, status, tags)
- Excel export functionality

### Execution Reporting
- Detailed test case metrics and analytics
- Test duration timeline visualization
- Per-test case performance analysis
- Excel and PDF export options
- Status-based filtering

### Admin Dashboard
- User management (create, update roles, reset passwords)
- Role-based access control (SUPER_ADMIN, ADMIN, USER)
- JWT authentication with token refresh
- Auto-logout on token expiry

## Architecture
- **reporter-backend (Node.js/Express)**: Auth (JWT), execution ingestion APIs, Firebase Firestore database, CORS and security middleware.
- **reporter-frontend (React 18 + Vite + Material-UI 6)**: Login, dashboard with analytics, execution detail view with charts, filtering, and export.
- **selenium-tests (Java + TestNG + Selenium 4)**: Sample cross-browser tests plus a TestNG listener that streams events (start/step/error/finish) to the backend while tests run.

## Data Model (API)
- Execution: `id`, `browser`, `status` (RUNNING/PASS/FAIL), `startedAt`, `finishedAt`, `tags`, `totalTests`, `passedTests`, `failedTests`, `testCases[]`.
- TestCase: `id`, `name`, `status` (PASS/FAIL), `startedAt`, `finishedAt`, `steps[]`.
- Step: `id`, `name`, `status` (PASS/FAIL), `timestamp`, optional `error` string.

## Prerequisites
- Node.js 18+
- Maven 3.9+, JDK 17+
- Firebase Firestore project with credentials
- Browsers and matching drivers (Selenium Manager in 4.6+ downloads automatically for Chrome/Firefox/Edge)

## Backend (reporter-backend)
```bash
cd reporter-backend
npm install
npm start
```
Default creds: `admin/password`. Health: `GET /health` on port 4000.
Firebase credentials required in `firebase-credentials.json`.

## Frontend (reporter-frontend)
```bash
cd reporter-frontend
npm install
npm run dev
```
Frontend runs on port 5174 (or next available port).

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

## New Features Guide

For detailed documentation on advanced analytics, filtering, and export features, see [ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md).

Key capabilities:
- **Dashboard Filters**: Date range, browser, execution status, test tags
- **Analytics Charts**: Status distribution, browser breakdown, test results overview
- **Data Export**: Excel (with summary sheet), PDF reports
- **Performance Metrics**: Average duration, max duration, pass rate calculations
- **Real-time Updates**: Auto-refresh every 4 seconds

## Flow
1. Backend starts and exposes `/api/auth/login` and `/api/executions/*` endpoints (JWT required except login).
2. Frontend authenticates via common credentials and uses the token for fetching executions.
3. Dashboard displays real-time analytics with filterable data and export options.
4. Selenium tests generate a UUID per run, listener calls `/start`, emits `/step` and `/error`, then `/finish`.
5. Frontend polls for updates and displays execution progress with detailed metrics and charts.
4. Dashboard auto-refreshes to display live status and step-by-step details with screenshots.

## Notes
- Storage is in-memory for simplicity; swap `executionStore` for a database as needed.
- CORS origins are configurable via `CORS_ORIGINS` in the backend `.env`.
- Increase payload limits or file storage if screenshots are large.

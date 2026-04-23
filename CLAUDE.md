# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**tripdan** is a mobile-first trip planning app. The repo has two independent sub-projects:

- `backend/` — Quarkus 3.34 (Java 21, Maven), REST API on port **8080**
- `frontend/` — React 19 + Vite 8 + Tailwind CSS v4, dev server on port **5173**

## Development commands

### Backend

Maven is not on the system PATH. Use the wrapper:

```bash
# Dev mode (hot reload, H2 in-memory, Swagger UI at /swagger-ui)
cd backend && ./mvnw quarkus:dev

# Run tests
cd backend && ./mvnw test

# Production build (outputs to target/quarkus-app/)
cd backend && ./mvnw package -DskipTests
```

### Frontend

```bash
cd frontend && npm run dev      # dev server with HMR
cd frontend && npm run build    # production build → dist/
cd frontend && npm run lint     # ESLint
```

## Architecture

### Backend

Panache Active Record pattern — entities extend `PanacheEntity` and carry their own finders. No repository layer.

```
model/
  Trip.java           — root aggregate; owns checklist + expenses via OneToMany(CASCADE ALL)
  ChecklistItem.java  — child of Trip; @JsonIgnore on trip field (breaks circular ref)
  Expense.java        — child of Trip; @JsonIgnore on trip field; type=PLANNED|ACTUAL enables budget vs actual tracking
resource/
  TripResource.java          — CRUD /api/trips; GET methods are @Transactional and call .size() on lazy collections to force init before Jackson serializes
  ChecklistResource.java     — /api/trips/{tripId}/checklist; PATCH /{itemId}/toggle flips checked
  ExpenseResource.java       — /api/trips/{tripId}/expenses; GET /summary returns {planned, actual, balance}
```

**Key constraint:** Quarkus RESTEasy Reactive serializes responses *outside* the transaction boundary. Lazy collections on `Trip` must be force-initialized inside `@Transactional` GET methods (`trip.checklistItems.size()`), or they throw `LazyInitializationException`.

**Bean validation gotcha:** `@NotNull` must not be placed on `@ManyToOne trip` fields in child entities — the resource sets the field after deserialization, so validation fires before assignment.

### Database profiles

| Profile | DB | Schema strategy |
|---|---|---|
| `%dev` | H2 in-memory | `drop-and-create` (data lost on restart) |
| `%test` | H2 in-memory | `drop-and-create` |
| `%prod` | PostgreSQL | `validate` (requires `DB_URL`, `DB_USER`, `DB_PASSWORD` env vars) |

### Frontend

Single-page app with React Router v7. All API calls go through `src/services/api.js`, which proxies `/api` → `http://localhost:8080` via Vite's dev server proxy.

```
pages/
  TripList.jsx    — home screen; lists all trips
  TripForm.jsx    — create + edit (shared, driven by presence of :id param)
  TripDetail.jsx  — trip view with two tabs: Checklist and Expenses
components/
  Footer.jsx      — fixed bottom bar showing "tripdan v0.0.1"
  BottomNav.jsx   — bottom navigation (currently single item)
services/
  api.js          — thin fetch wrapper; all endpoints in one object (api.trips, api.checklist, api.expenses)
```

**Tailwind note:** Uses Tailwind v4 (`@import "tailwindcss"` in `index.css`, configured via `@tailwindcss/vite` plugin). No `tailwind.config.js`. `color-scheme` is forced to `light` — dark mode is not implemented.

## Git workflow

This project uses **Git Flow**:

- `main` — production-ready code only
- `develop` — integration branch; all features merge here
- `feature/<name>` — branch off `develop` for new features
- `release/<version>` — branch off `develop` when preparing a release; merges into both `main` and `develop`
- `hotfix/<name>` — branch off `main` for urgent production fixes; merges into both `main` and `develop`

Never commit features directly to `main` or `develop`.

Após o merge de qualquer branch em `develop` ou `main`, apagar a branch imediatamente (local e remote).

## Deploy

- **Backend:** `backend/Dockerfile` (multi-stage, eclipse-temurin:21-alpine). Targets Render or Railway. Set `DB_URL`, `DB_USER`, `DB_PASSWORD` env vars in the platform.
- **Frontend:** `frontend/netlify.toml` (Netlify) or `frontend/vercel.json` (Vercel). Both redirect all routes to `index.html` for SPA routing. Set `VITE_API_URL` if the backend URL differs from the proxy default.

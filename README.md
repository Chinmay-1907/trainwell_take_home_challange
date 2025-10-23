
# Trainwell Funnel

Trainwell Funnel is a compact full-stack app that calculates sequential conversion funnels from page-view events stored in MongoDB. The backend exposes a single typed Express endpoint that aggregates unique users per funnel step, and the frontend lets analysts model funnels visually with a bar chart and summary table.

## Prerequisites
- Node.js 18+
- npm 9+

## Project Setup
```bash
git clone <repo-url>
cd trainwell-funnel
npm install
```
The root install pulls in shared tooling (concurrently) and automatically installs dependencies inside `backend/` and `frontend/` via the `postinstall` script. If you prefer manual installation run `npm install` inside each folder.

### Configuration
The backend reads two environment variables:
- `MONGODB_URI` (optional): defaults to the Trainwell cluster URI provided in the take-home prompt.
- `MONGODB_DB_NAME` (optional): defaults to `trainwell_takehome`.

Create `backend/.env` if you want to override either value:
```bash
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/
MONGODB_DB_NAME=trainwell_takehome
```

## Running the App
```bash
npm run dev
```
The command uses `concurrently` to start:
- Backend: http://localhost:4000 (Express + TypeScript)
- Frontend: http://localhost:5173 (React + Vite)

You can also run each side independently:
```bash
npm --prefix backend run dev
npm --prefix frontend run dev
```

## API Reference
- **Endpoint:** `POST /api/funnel`
- **Purpose:** Return unique users per step and conversion rates for users who completed every prior step within the requested range.

Example request:
```json
{
  "startDate": "2025-09-01",
  "endDate": "2025-09-30",
  "steps": [
    { "label": "Splash Page", "hostname": "join.trainwell.net" },
    { "label": "First Question", "path": "/tags-challenge" },
    { "label": "Plan Page", "path": "/plan" }
  ]
}
```

Example response:
```json
{
  "steps": [
    { "label": "Splash Page", "users": 4445, "conversion": 100 },
    { "label": "First Question", "users": 2243, "conversion": 50.46 },
    { "label": "Plan Page", "users": 781, "conversion": 17.57 }
  ]
}
```

## Available Commands
- `npm --prefix backend run dev` – Hot-reloads the Express API with `ts-node-dev`.
- `npm --prefix backend run build` – Compiles backend TypeScript into `dist/`.
- `npm --prefix backend run lint` – Type-checks the backend project.
- `npm --prefix frontend run dev` – Starts the Vite dev server.
- `npm --prefix frontend run build` – Generates a production build of the React app.
- `npm run build` – Builds both backend and frontend in one step.

## Notes
- The funnel calculation enforces step order per user, tracking the earliest event that matches each step.
- Only `platform = "web"` and `type = "page_view"` events are considered, and events are filtered by the provided date range on the server.
- The frontend keeps the UI intentionally minimal: date range pickers, dynamic step inputs, a bar chart (Recharts), and a results table.

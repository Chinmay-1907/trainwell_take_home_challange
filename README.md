# Trainwell Funnel
Simple app to compute and visualize conversion funnels from MongoDB page‑view events.

## Deliverables
- Repo: https://github.com/Chinmay-1907/trainwell_take_home_challange
- Install and run locally:
  - `npm install`
  - `npm run dev`
  - Frontend: http://localhost:5173 • Backend: http://localhost:4000
  
## Configure (optional)
Create `backend/.env` to override defaults:
```
MONGODB_URI= <YOUR_MONGODB_URI>
MONGODB_DB_NAME= <YOUR_DB_NAME>
PORT=4000
```
## Use
- Pick a date range, add steps (hostname or path), run.
- See users per step, conversion %, and (Added Feature) time‑to‑next‑step (median/p95).

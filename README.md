# Resolve — Support CRM

A clean, readable full-stack customer-support ticketing system built for the Datastraw assessment.

## Features

- Create tickets with customer details, issue title, and description
- Ticket list with generated IDs, dates, and status
- Search across ticket ID, customer name, email, subject, and description
- Filter by Open, In Progress, or Closed
- Ticket detail view with status updates and timestamped notes
- React user interface built with Vite
- Python FastAPI REST API with a persistent SQLite database

## Run locally

Requires Python 3.10+ and Node.js 18+.

```bash
# Terminal 1 — API
cd backend
py -m venv .venv
.venv\Scripts\activate
py -m pip install -r requirements.txt
py -m uvicorn main:app --reload

# Terminal 2 — React app
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The FastAPI docs are available at `http://localhost:8000/docs`.

## API

- `POST /api/tickets` — create a ticket
- `GET /api/tickets?status=Open&search=priya` — list/search/filter tickets
- `GET /api/tickets/:id` — fetch a ticket and its notes
- `PUT /api/tickets/:id` — update `{ status, note }`

The database file is created automatically at `backend/data/support_crm.db` and intentionally ignored by Git.

## Technical choices

The project separates API, database, validation schemas, and React UI responsibilities. FastAPI provides input validation and interactive API documentation; Python's built-in SQLite support keeps the database simple and portable. The React UI is organized into small components for the dashboard, create-ticket form, and ticket details.

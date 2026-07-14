"""FastAPI application for the Support CRM ticket API."""

from contextlib import asynccontextmanager
from datetime import datetime
import sqlite3

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from database import get_connection, initialize_database
from schemas import TicketCreate, TicketDetailResponse, TicketListResponse, TicketStatus, TicketUpdate


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    yield


app = FastAPI(title="Support CRM API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def ticket_from_row(row: sqlite3.Row, include_notes: bool = False) -> dict:
    """Convert a database row to the camel-free API shape."""
    ticket = dict(row)
    if include_notes:
        with get_connection() as connection:
            notes = connection.execute(
                "SELECT id, note_text, created_at FROM notes WHERE ticket_id = ? ORDER BY created_at DESC, id DESC",
                (ticket["id"],),
            ).fetchall()
            activity = connection.execute(
                "SELECT id, event_type AS type, description, created_at FROM ticket_activity WHERE ticket_id = ? ORDER BY created_at ASC, id ASC",
                (ticket["id"],),
            ).fetchall()
        ticket["notes"] = [dict(note) for note in notes]
        ticket["activity"] = [dict(entry) for entry in activity]
    return ticket


def get_ticket_or_404(ticket_id: int, include_notes: bool = False) -> dict:
    with get_connection() as connection:
        row = connection.execute("SELECT * FROM tickets WHERE id = ?", (ticket_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Ticket not found.")
    return ticket_from_row(row, include_notes)


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/tickets", response_model=list[TicketListResponse])
def list_tickets(
    status: TicketStatus | None = None,
    search: str = Query(default="", max_length=150),
) -> list[dict]:
    query = f"%{search.strip()}%"
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT * FROM tickets
            WHERE (? IS NULL OR status = ?)
              AND (? = '' OR ticket_id LIKE ? OR customer_name LIKE ? OR customer_email LIKE ?
                   OR subject LIKE ? OR description LIKE ?)
            ORDER BY datetime(created_at) DESC, id DESC
            """,
            (status.value if status else None, status.value if status else None, search.strip(), query, query, query, query, query),
        ).fetchall()
    return [ticket_from_row(row) for row in rows]


@app.post("/api/tickets", response_model=TicketDetailResponse, status_code=201)
def create_ticket(payload: TicketCreate) -> dict:
    with get_connection() as connection:
        next_id = connection.execute("SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM tickets").fetchone()["next_id"]
        ticket_code = f"TKT-{next_id:04d}"
        cursor = connection.execute(
            """INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description, priority)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (
                ticket_code,
                payload.customer_name.strip(),
                str(payload.customer_email),
                payload.subject.strip(),
                payload.description.strip(),
                payload.priority.strip(),
            ),
        )
        ticket_id = cursor.lastrowid
        connection.execute(
            "INSERT INTO ticket_activity (ticket_id, event_type, description) VALUES (?, ?, ?)",
            (ticket_id, "created", "Ticket created"),
        )
    return get_ticket_or_404(ticket_id, include_notes=True)


@app.get("/api/tickets/{ticket_id}", response_model=TicketDetailResponse)
def get_ticket(ticket_id: int) -> dict:
    return get_ticket_or_404(ticket_id, include_notes=True)


@app.put("/api/tickets/{ticket_id}", response_model=TicketDetailResponse)
def update_ticket(ticket_id: int, payload: TicketUpdate) -> dict:
    get_ticket_or_404(ticket_id)
    with get_connection() as connection:
        current_ticket = connection.execute("SELECT status FROM tickets WHERE id = ?", (ticket_id,)).fetchone()
        connection.execute(
            "UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (payload.status.value, ticket_id),
        )
        if current_ticket is not None and current_ticket["status"] != payload.status.value:
            connection.execute(
                "INSERT INTO ticket_activity (ticket_id, event_type, description) VALUES (?, ?, ?)",
                (ticket_id, "status_updated", f"Status updated to {payload.status.value}"),
            )
        if payload.note and payload.note.strip():
            connection.execute(
                "INSERT INTO notes (ticket_id, note_text) VALUES (?, ?)",
                (ticket_id, payload.note.strip()),
            )
            connection.execute(
                "INSERT INTO ticket_activity (ticket_id, event_type, description) VALUES (?, ?, ?)",
                (ticket_id, "note_added", f"Note added: {payload.note.strip()}"),
            )
    return get_ticket_or_404(ticket_id, include_notes=True)

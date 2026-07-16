"""SQLite connection and schema setup for the Support CRM."""

import sqlite3
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"
DATABASE_PATH = DATA_DIR / "support_crm.db"


def get_connection() -> sqlite3.Connection:
    """Return a SQLite connection that exposes row columns by name."""
    DATA_DIR.mkdir(exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def initialize_database() -> None:
    """Create the ticket, note, activity, admin users, and customers schema when the application starts."""
    with get_connection() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS admin_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                hashed_password TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                phone TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS tickets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticket_id TEXT NOT NULL UNIQUE,
                customer_id INTEGER,
                customer_name TEXT NOT NULL,
                customer_email TEXT NOT NULL,
                subject TEXT NOT NULL,
                description TEXT NOT NULL,
                priority TEXT NOT NULL DEFAULT 'Medium',
                status TEXT NOT NULL DEFAULT 'Open'
                    CHECK(status IN ('Open', 'In Progress', 'Closed')),
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticket_id INTEGER NOT NULL,
                note_text TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS ticket_activity (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticket_id INTEGER NOT NULL,
                event_type TEXT NOT NULL,
                description TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
            );
            """
        )

        columns = [row[1] for row in connection.execute("PRAGMA table_info(tickets)")]
        if "priority" not in columns:
            connection.execute("ALTER TABLE tickets ADD COLUMN priority TEXT NOT NULL DEFAULT 'Medium'")
        
        if "customer_id" not in columns:
            connection.execute("ALTER TABLE tickets ADD COLUMN customer_id INTEGER")
        
        admin_exists = connection.execute("SELECT COUNT(*) FROM admin_users").fetchone()[0]
        if admin_exists == 0:
            from .auth import get_password_hash
            hashed_pwd = get_password_hash("admin123")
            connection.execute(
                "INSERT INTO admin_users (email, hashed_password) VALUES (?, ?)",
                ("admin@example.com", hashed_pwd)
            )


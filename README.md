# Resolve — Support CRM

A full-stack admin dashboard and customer-support ticketing system with authentication, customer management, and comprehensive ticket tracking.

## Features

### Authentication & Admin
- Secure JWT-based login with email and password
- Admin dashboard with protected routes
- Default admin credentials (changeable in production)

### Ticket Management
- Create tickets with customer details, issue title, priority, and description
- Ticket list with generated IDs, dates, and status
- Search across ticket ID, customer name, email, subject, and description
- Filter by Open, In Progress, or Closed status
- Filter by Low, Medium, or High priority
- Ticket detail view with status updates and timestamped notes
- Activity timeline showing Created, Status Updated, and Notes Added events
- Status transitions: Open → In Progress → Closed

### Customer Management
- View all customers with ticket counts
- Search and filter customers
- Customer detail pages showing all their tickets
- Track customer join dates and contact info

### Dashboard Statistics
- Total tickets count
- Open tickets count
- In Progress tickets count
- Closed tickets count
- High priority tickets count
- Statistics update in real-time

### User Interface
- React frontend built with Vite
- Fully responsive design (Desktop, Tablet, Mobile)
- Clean, modern UI with Manrope typography
- Toast notifications for actions

### API & Database
- Python FastAPI REST API with JWT authentication
- SQLite database for persistent data storage
- Comprehensive error handling and validation

## Run Locally

Requires Python 3.10+ and Node.js 18+.

### Backend Setup

```bash
# Terminal 1 — API
cd backend
py -m venv .venv
.venv\Scripts\activate
py -m pip install -r requirements.txt
py -m uvicorn main:app --reload
```

### Frontend Setup

```bash
# Terminal 2 — React app
cd frontend
npm install
npm run dev
```

### Access the App

- **Frontend**: Open `http://localhost:5173`
- **API Docs**: Open `http://localhost:8000/docs`

### Default Admin Credentials

- **Email**: admin@example.com
- **Password**: admin123

⚠️ **Security Note**: Change these credentials in production!

## API Endpoints

### Authentication
- `POST /api/auth/login` — Login with email and password, receive JWT token

### Tickets (Public)
- `POST /api/tickets` — Create a new ticket
- `GET /api/tickets` — List tickets (with optional search and status filter)
- `GET /api/tickets/{id}` — Fetch a ticket and its notes/activity

### Tickets (Admin - requires auth)
- `PUT /api/tickets/{id}` — Update ticket status and add notes

### Customers (Admin - requires auth)
- `GET /api/customers` — List all customers with ticket counts
- `GET /api/customers/{id}` — Get customer details and their tickets

### Health
- `GET /api/health` — Check API status

## Database Schema

### Tables
- `admin_users` — Admin login credentials (email, hashed_password)
- `customers` — Customer information (name, email, phone)
- `tickets` — Support tickets linked to customers
- `notes` — Notes on tickets with timestamps
- `ticket_activity` — Activity log (created, status_updated, note_added)

The database file is created automatically at `backend/data/support_crm.db` and is ignored by Git.

## Technical Stack

**Frontend:**
- React 19.x with Hooks
- Vite for fast development and optimized builds
- Responsive CSS Grid layout
- Fetch API for HTTP requests

**Backend:**
- FastAPI 0.115+
- Uvicorn ASGI server
- SQLite3 with context managers
- JWT authentication (python-jose)
- Password hashing (passlib + bcrypt)
- Pydantic for validation

**Architecture:**
- Modular component-based frontend
- RESTful API design
- Separation of concerns (auth, database, schemas)
- Responsive design with mobile-first approach

## Responsive Design

The app is fully responsive across all devices:
- **Desktop (1025px+)** — Full sidebar navigation and multi-column layouts
- **Tablet (641px-1024px)** — Adjusted spacing and 2-column grids
- **Mobile (481px-640px)** — Horizontal top navigation, single-column layouts
- **Extra Small (≤480px)** — Optimized touch interface with stacked elements

## Project Structure

```
support-crm/
├── backend/
│   ├── main.py              # FastAPI app with all routes
│   ├── database.py          # SQLite connection and schema
│   ├── schemas.py           # Pydantic models
│   ├── auth.py              # JWT and password utilities
│   ├── requirements.txt      # Python dependencies
│   ├── data/                # Database storage (created at runtime)
│   └── tests/               # Automated tests
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.jsx          # Main app with routing
│   │   ├── api.js           # API client
│   │   ├── styles.css       # Responsive styles
│   │   ├── utils.js         # Helper functions
│   │   ├── main.jsx         # React entry point
│   │   └── index.html       # HTML template
│   ├── vite.config.js       # Vite configuration
│   ├── package.json         # Dependencies
│   └── dist/                # Production build (generated)
├── README.md
└── package.json
```

## Future Enhancements

- Email notifications on ticket updates
- Advanced analytics and reporting
- Ticket templates and macros
- Customer portal for ticket tracking
- Real-time updates with WebSockets
- Multi-user support with roles
- Automated ticket routing
- SLA tracking and alerts

## Technical Decisions

The project prioritizes **simplicity, maintainability, and clarity** while remaining production-ready:

- **FastAPI** provides automatic validation and interactive API docs
- **SQLite** keeps the database simple, portable, and dependency-free
- **React** with functional components and hooks for clean, scalable UI
- **JWT authentication** is stateless and scales well
- **Responsive CSS** without frameworks ensures full control and optimal performance
- **Modular architecture** separates concerns and makes testing straightforward

## License

This project is provided as-is for educational and commercial use.


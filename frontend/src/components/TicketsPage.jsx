import { useMemo } from 'react'
import StatusBadge from './StatusBadge'
import { formatDate, statusOptions } from '../utils'

export default function TicketsPage({
  tickets,
  search,
  status,
  loading,
  onSearchChange,
  onStatusChange,
  onOpenTicket,
  onRefresh,
}) {
  return (
    <>
      <TicketStats tickets={tickets} />

      <div className="toolbar">
        <label className="search">
          <span aria-hidden="true">Search</span>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by ID, customer, email, or issue..."
          />
        </label>

        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          aria-label="Filter tickets by status"
        >
          <option value="">All statuses</option>
          {statusOptions.map((option) => <option key={option}>{option}</option>)}
        </select>
      </div>

      <section className="table-card">
        <div className="table-heading">
          <div>
            <h2>All tickets</h2>
            <p>{loading ? 'Loading tickets...' : `${tickets.length} ticket${tickets.length === 1 ? '' : 's'} found`}</p>
          </div>
          <button className="text-btn" onClick={onRefresh}>Refresh</button>
        </div>

        {tickets.length ? (
          <TicketTable tickets={tickets} onOpenTicket={onOpenTicket} />
        ) : (
          <EmptyState loading={loading} />
        )}
      </section>
    </>
  )
}

function TicketStats({ tickets }) {
  const counts = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === 'Open').length,
    inProgress: tickets.filter((ticket) => ticket.status === 'In Progress').length,
    closed: tickets.filter((ticket) => ticket.status === 'Closed').length,
  }), [tickets])

  return (
    <div className="stats">
      <Stat label="All tickets" count={counts.total} color="#263836" />
      <Stat label="Open" count={counts.open} color="#0f766e" />
      <Stat label="In progress" count={counts.inProgress} color="#c77a16" />
      <Stat label="Closed" count={counts.closed} color="#7a8582" />
    </div>
  )
}

function Stat({ label, count, color }) {
  return (
    <div className="stat">
      <p><span className="stat-dot" style={{ background: color }} />{label}</p>
      <strong>{count}</strong>
    </div>
  )
}

function TicketTable({ tickets, onOpenTicket }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Ticket</th><th>Customer</th><th>Subject</th><th>Status</th><th>Created</th><th /></tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id} onClick={() => onOpenTicket(ticket.id)}>
              <td><span className="ticket-id">{ticket.ticket_id}</span></td>
              <td><span className="customer">{ticket.customer_name}</span><span className="email">{ticket.customer_email}</span></td>
              <td><div className="subject">{ticket.subject}</div></td>
              <td><StatusBadge status={ticket.status} /></td>
              <td className="date">{formatDate(ticket.created_at)}</td>
              <td className="arrow">&gt;</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EmptyState({ loading }) {
  return (
    <div className="empty-state">
      <div>Search</div>
      <h3>{loading ? 'Loading your tickets' : 'No matching tickets'}</h3>
      <p>{loading ? 'Just a moment...' : 'Try another search or create a new support ticket.'}</p>
    </div>
  )
}

import { useState } from 'react'
import { ticketsApi } from '../api'
import StatusBadge from './StatusBadge'
import { formatDate, statusOptions } from '../utils'

export default function TicketDetail({ ticket, onBack, onUpdated }) {
  const [status, setStatus] = useState(ticket.status)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const updatedTicket = await ticketsApi.update(ticket.id, { status, note })
      setNote('')
      onUpdated(updatedTicket)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="detail-wrap">
      <button className="text-btn back" onClick={onBack}>&lt;- Back to tickets</button>

      <article className="detail-card">
        <div className="detail-header">
          <div>
            <span className="ticket-id">{ticket.ticket_id}</span>
            <h2 className="detail-title">{ticket.subject}</h2>
            <p className="detail-meta">Created {formatDate(ticket.created_at)} | Updated {formatDate(ticket.updated_at)}</p>
          </div>
          <StatusBadge status={ticket.status} />
        </div>

        <section className="detail-section">
          <div className="detail-grid">
            <Info label="Ticket ID" value={ticket.ticket_id} />
            <Info label="Customer Name" value={ticket.customer_name} />
            <Info label="Email" value={ticket.customer_email} />
            <Info label="Subject" value={ticket.subject} />
            <Info label="Priority" value={ticket.priority || 'Medium'} />
            <Info label="Status" value={ticket.status} />
          </div>
        </section>

        <section className="detail-section">
          <h3>Description</h3>
          <div className="description">{ticket.description}</div>
        </section>

        <section className="detail-section">
          <h3>Activity</h3>
          <div className="activity-list">
            {(ticket.activity || []).length ? (
              ticket.activity.map((activityItem) => (
                <div className="activity-item" key={activityItem.id}>
                  <div className="activity-badge">{activityItem.type.replace(/_/g, ' ')}</div>
                  <div>
                    <p>{activityItem.description}</p>
                    <small>{formatDate(activityItem.created_at)}</small>
                  </div>
                </div>
              ))
            ) : (
              <p className="muted">No activity yet.</p>
            )}
          </div>
        </section>

        <section className="detail-section">
          <h3>Update ticket</h3>
          <form onSubmit={handleSubmit}>
            <div className="update-grid">
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                {statusOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
              <textarea rows="2" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a note or update (optional)" />
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="form-actions">
              <button className="primary-btn" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
            </div>
          </form>
        </section>
      </article>
    </div>
  )
}

function Info({ label, value }) {
  return <div><div className="info-label">{label}</div><div className="info-value">{value}</div></div>
}

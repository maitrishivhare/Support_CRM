import { useEffect, useState } from 'react'
import { formatDate } from '../utils'

export default function CustomerDetail({ customerId, onBack, onOpenTicket }) {
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCustomer() {
      setLoading(true)
      setError('')

      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`http://localhost:8000/api/customers/${customerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to load customer')
        }

        const data = await response.json()
        setCustomer(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadCustomer()
  }, [customerId])

  if (loading) {
    return <div className="empty-state"><h3>Loading...</h3></div>
  }

  if (error) {
    return (
      <div className="detail-wrap">
        <button className="text-btn back" onClick={onBack}>← Back to customers</button>
        <p className="form-error">{error}</p>
      </div>
    )
  }

  if (!customer) {
    return <div className="empty-state"><h3>Customer not found</h3></div>
  }

  return (
    <div className="detail-wrap">
      <button className="text-btn back" onClick={onBack}>← Back to customers</button>

      <article className="detail-card">
        <div className="detail-header">
          <div>
            <h2>{customer.name}</h2>
            <p className="detail-meta">Joined {formatDate(customer.created_at)}</p>
          </div>
        </div>

        <section className="detail-section">
          <div className="detail-grid">
            <Info label="Email" value={customer.email} />
            <Info label="Phone" value={customer.phone || 'Not provided'} />
          </div>
        </section>

        <section className="detail-section">
          <h3>Tickets ({customer.tickets?.length || 0})</h3>
          {customer.tickets && customer.tickets.length ? (
            <div className="ticket-list">
              {customer.tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="ticket-row"
                  onClick={() => onOpenTicket(ticket.id)}
                >
                  <div>
                    <span className="ticket-id">{ticket.ticket_id}</span>
                    <p className="ticket-subject">{ticket.subject}</p>
                  </div>
                  <div className="ticket-meta">
                    <span className={`status status-${ticket.status.toLowerCase().replace(' ', '-')}`}>
                      {ticket.status}
                    </span>
                    <span className="priority">{ticket.priority}</span>
                    <span className="date">{formatDate(ticket.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No tickets for this customer.</p>
          )}
        </section>
      </article>
    </div>
  )
}

function Info({ label, value }) {
  return <div><div className="info-label">{label}</div><div className="info-value">{value}</div></div>
}

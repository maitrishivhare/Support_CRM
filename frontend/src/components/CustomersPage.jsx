import { useEffect, useState } from 'react'
import { formatDate } from '../utils'

export default function CustomersPage({ onOpenCustomer }) {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadCustomers() {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8000/api/customers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to load customers')
      }

      const data = await response.json()
      setCustomers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  return (
    <>
      <section className="table-card">
        <div className="table-heading">
          <div>
            <h2>Customers</h2>
            <p>{loading ? 'Loading...' : `${customers.length} customer${customers.length === 1 ? '' : 's'}`}</p>
          </div>
          <button className="text-btn" onClick={loadCustomers}>
            Refresh
          </button>
        </div>

        {error && <p className="form-error" style={{ padding: '16px 24px 0' }}>{error}</p>}

        {customers.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Tickets</th>
                  <th>Joined</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} onClick={() => onOpenCustomer(customer.id)}>
                    <td><strong>{customer.name}</strong></td>
                    <td>{customer.email}</td>
                    <td>{customer.phone || '-'}</td>
                    <td>
                      <span className="ticket-count">{customer.ticket_count}</span>
                    </td>
                    <td className="date">{formatDate(customer.created_at)}</td>
                    <td className="arrow">&gt;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div>👥</div>
            <h3>{loading ? 'Loading customers' : 'No customers'}</h3>
            <p>{loading ? 'Just a moment...' : 'No customers have been added yet.'}</p>
          </div>
        )}
      </section>
    </>
  )
}

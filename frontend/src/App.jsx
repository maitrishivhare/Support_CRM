import { useEffect, useState } from 'react'
import { ticketsApi } from './api'
import Login from './components/Login'
import CreateTicketForm from './components/CreateTicketForm'
import TicketDetail from './components/TicketDetail'
import TicketsPage from './components/TicketsPage'
import CustomersPage from './components/CustomersPage'
import CustomerDetail from './components/CustomerDetail'

const pageTitles = {
  tickets: 'Tickets',
  create: 'Create ticket',
  detail: 'Ticket details',
  customers: 'Customers',
  customer_detail: 'Customer details',
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [page, setPage] = useState('tickets')
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadTickets() {
    setLoading(true)

    try {
      const ticketList = await ticketsApi.list({ search, status })
      setTickets(ticketList)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(loadTickets, 250)
    return () => clearTimeout(debounceTimer)
  }, [search, status])

  async function openTicket(ticketId) {
    try {
      const ticket = await ticketsApi.get(ticketId)
      setSelectedTicket(ticket)
      setPage('detail')
    } catch (error) {
      setMessage(error.message)
    }
  }

  function openCustomer(customerId) {
    setSelectedCustomerId(customerId)
    setPage('customer_detail')
  }

  function showTickets() {
    setPage('tickets')
    loadTickets()
  }

  function showCustomers() {
    setPage('customers')
  }

  async function handleTicketCreated(ticket) {
    setMessage(`${ticket.ticket_id} created successfully`)
    await openTicket(ticket.id)
  }

  function handleTicketUpdated(ticket) {
    setSelectedTicket(ticket)
    setMessage('Ticket updated successfully')
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('admin_email')
    setIsLoggedIn(false)
    setIsAdminMode(false)
    setPage('tickets')
  }

  function handleAdminCancel() {
    setIsAdminMode(false)
    setPage('tickets')
  }

  function handleReturnPublic() {
    setIsAdminMode(false)
    setPage('tickets')
  }

  if (!isAdminMode) {
    return (
      <div className="app-shell public-shell">
        <main>
          <header className="public-header">
            <div>
              <p className="eyebrow">PUBLIC SUPPORT</p>
              <h1>Submit a support request</h1>
              <p className="public-intro">
                Create a new ticket or search existing requests. Admins can log in to manage customers and update ticket status.
              </p>
            </div>
            <div className="public-actions">
              <button className="primary-btn" onClick={() => setPage('create')}>
                Create ticket <span>-&gt;</span>
              </button>
              <button className="secondary-btn" onClick={() => setIsAdminMode(true)}>
                Admin login
              </button>
            </div>
          </header>

          {page === 'tickets' && (
            <TicketsPage
              tickets={tickets}
              search={search}
              status={status}
              loading={loading}
              onSearchChange={setSearch}
              onStatusChange={setStatus}
              onOpenTicket={openTicket}
              onRefresh={loadTickets}
            />
          )}

          {page === 'create' && (
            <CreateTicketForm onCancel={showTickets} onCreated={handleTicketCreated} />
          )}

          {page === 'detail' && selectedTicket && (
            <TicketDetail
              ticket={selectedTicket}
              onBack={showTickets}
              onUpdated={handleTicketUpdated}
            />
          )}

          <div className="public-footer">
            <p className="public-footer-text">Need help? Create a support ticket and our team will respond as soon as possible.</p>
          </div>

          {message && (
            <div className="toast" role="status">
              {message}
              <button aria-label="Dismiss message" onClick={() => setMessage('')}>x</button>
            </div>
          )}
        </main>
      </div>
    )
  }

  if (isAdminMode && !isLoggedIn) {
    return <Login onLoginSuccess={() => { setIsLoggedIn(true); setIsAdminMode(true); }} onCancel={handleAdminCancel} />
  }

  return (
    <div className="app-shell">
      <Sidebar
        currentPage={page}
        onShowTickets={showTickets}
        onShowCustomers={showCustomers}
        onShowCreate={() => setPage('create')}
        onLogout={handleLogout}
      />

      <main>
        <header>
          <div>
            <p className="eyebrow">ADMIN DASHBOARD</p>
            <h1>{pageTitles[page]}</h1>
          </div>

          <div className="admin-actions">
            {page === 'tickets' && (
              <button className="primary-btn" onClick={() => setPage('create')}>
                Create ticket <span>-&gt;</span>
              </button>
            )}
            <button className="secondary-btn" onClick={handleReturnPublic}>
              Back to public support
            </button>
          </div>
        </header>

        {page === 'tickets' && (
          <TicketsPage
            tickets={tickets}
            search={search}
            status={status}
            loading={loading}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onOpenTicket={openTicket}
            onRefresh={loadTickets}
          />
        )}

        {page === 'create' && (
          <CreateTicketForm onCancel={showTickets} onCreated={handleTicketCreated} />
        )}

        {page === 'detail' && selectedTicket && (
          <TicketDetail
            ticket={selectedTicket}
            onBack={showTickets}
            onUpdated={handleTicketUpdated}
          />
        )}

        {page === 'customers' && (
          <CustomersPage onOpenCustomer={openCustomer} />
        )}

        {page === 'customer_detail' && selectedCustomerId && (
          <CustomerDetail
            customerId={selectedCustomerId}
            onBack={showCustomers}
            onOpenTicket={openTicket}
          />
        )}
      </main>

      {message && (
        <div className="toast" role="status">
          {message}
          <button aria-label="Dismiss message" onClick={() => setMessage('')}>x</button>
        </div>
      )}
    </div>
  )
}

function Sidebar({ currentPage, onShowTickets, onShowCustomers, onShowCreate, onLogout }) {
  return (
    <aside className="sidebar">
      <button className="brand" onClick={onShowTickets}>
        <span className="brand-mark">R</span>
        <span>resolve</span>
      </button>

      <nav aria-label="Primary navigation">
        <button
          className={`nav-link ${currentPage === 'tickets' ? 'active' : ''}`}
          onClick={onShowTickets}
        >
          <span aria-hidden="true">🎫</span>
          <span>Tickets</span>
        </button>
        <button
          className={`nav-link ${currentPage === 'customers' ? 'active' : ''}`}
          onClick={onShowCustomers}
        >
          <span aria-hidden="true">👥</span>
          <span>Customers</span>
        </button>
        <button
          className={`nav-link ${currentPage === 'create' ? 'active' : ''}`}
          onClick={onShowCreate}
        >
          <span aria-hidden="true">+</span>
          <span>New ticket</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <span className="avatar">{localStorage.getItem('admin_email')?.charAt(0).toUpperCase()}</span>
        <div>
          <strong>Admin</strong>
          <small>{localStorage.getItem('admin_email')}</small>
        </div>
        <button
          className="logout-btn"
          title="Logout"
          onClick={onLogout}
        >
          ↪️
        </button>
      </div>
    </aside>
  )
}

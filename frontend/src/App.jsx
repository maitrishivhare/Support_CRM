import { useEffect, useState } from 'react'
import { ticketsApi } from './api'
import CreateTicketForm from './components/CreateTicketForm'
import TicketDetail from './components/TicketDetail'
import TicketsPage from './components/TicketsPage'

const pageTitles = {
  tickets: 'Tickets',
  create: 'Create ticket',
  detail: 'Ticket details',
}

export default function App() {
  const [page, setPage] = useState('tickets')
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
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

  function showTickets() {
    setPage('tickets')
    loadTickets()
  }

  async function handleTicketCreated(ticket) {
    setMessage(`${ticket.ticket_id} created successfully`)
    await openTicket(ticket.id)
  }

  function handleTicketUpdated(ticket) {
    setSelectedTicket(ticket)
    setMessage('Ticket updated successfully')
  }

  return (
    <div className="app-shell">
      <Sidebar currentPage={page} onShowTickets={showTickets} onShowCreate={() => setPage('create')} />

      <main>
        <header>
          <div>
            <p className="eyebrow">SUPPORT DESK</p>
            <h1>{pageTitles[page]}</h1>
          </div>

          {page === 'tickets' && (
            <button className="primary-btn" onClick={() => setPage('create')}>
              Create ticket <span>-&gt;</span>
            </button>
          )}
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

function Sidebar({ currentPage, onShowTickets, onShowCreate }) {
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
          <span aria-hidden="true">Home</span>
          <span>All tickets</span>
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
        <span className="avatar">MA</span>
        <div>
          <strong>Support team</strong>
          <small>Workspace admin</small>
        </div>
      </div>
    </aside>
  )
}

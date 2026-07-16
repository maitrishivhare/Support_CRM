const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json()

  if (!response.ok) {
    const message = Array.isArray(data.detail) ? data.detail[0]?.msg : data.detail
    throw new Error(message || 'Something went wrong. Please try again.')
  }
  return data
}

export const ticketsApi = {
  list: ({ search = '', status = '' } = {}) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    return request(`/api/tickets?${params}`)
  },
  get: (id) => request(`/api/tickets/${id}`),
  create: (ticket) => request('/api/tickets', { method: 'POST', body: JSON.stringify(ticket) }),
  update: (id, update) => request(`/api/tickets/${id}`, { method: 'PUT', body: JSON.stringify(update) }),
}

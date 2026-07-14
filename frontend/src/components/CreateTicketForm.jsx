import { useState } from 'react'
import { ticketsApi } from '../api'

const emptyForm = {
  customer_name: '',
  customer_email: '',
  subject: '',
  description: '',
  priority: 'Medium',
}

export default function CreateTicketForm({ onCancel, onCreated }) {
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updateField(event) {
    setForm((currentForm) => ({ ...currentForm, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const ticket = await ticketsApi.create(form)
      await onCreated(ticket)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="form-card">
      <div>
        <p className="eyebrow">NEW REQUEST</p>
        <h2>Create a support ticket</h2>
        <p className="muted">Give the team enough context to help the customer quickly.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <Field label="Customer name" name="customer_name" value={form.customer_name} onChange={updateField} placeholder="e.g. Priya Sharma" />
          <Field label="Customer email" name="customer_email" type="email" value={form.customer_email} onChange={updateField} placeholder="priya@example.com" />
        </div>
        <Field label="Issue title" name="subject" value={form.subject} onChange={updateField} placeholder="Briefly describe the issue" />
        <label>
          Priority
          <select name="priority" value={form.priority} onChange={updateField}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </label>
        <Field label="Describe the issue" name="description" value={form.description} onChange={updateField} textarea placeholder="What happened? Include relevant details or steps to reproduce." />

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="secondary-btn" onClick={onCancel}>Cancel</button>
          <button className="primary-btn" disabled={saving}>{saving ? 'Creating...' : 'Create ticket'}</button>
        </div>
      </form>
    </section>
  )
}

function Field({ label, textarea, ...inputProps }) {
  return (
    <label>
      {label}
      {textarea ? <textarea required rows="6" {...inputProps} /> : <input required {...inputProps} />}
    </label>
  )
}

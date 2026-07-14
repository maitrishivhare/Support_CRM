export const statusOptions = ['Open', 'In Progress', 'Closed']

export function formatDate(value) {
  const utcValue = `${value.replace(' ', 'T')}Z`

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(utcValue))
}

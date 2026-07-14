export default function StatusBadge({ status }) {
  const className = status.toLowerCase().replaceAll(' ', '-')

  return <span className={`status status-${className}`}>{status}</span>
}

export function GradCapIcon({ className = 'size-8' }) {
  return (
    <img
      src="/icons/logo1.png"
      alt="IrvinBot"
      className={className}
      style={{ objectFit: 'contain' }}
    />
  )
}

export function Wordmark({ className = '' }) {
  return (
    <span className={`font-bold tracking-tight ${className}`}>
      <span style={{ color: '#6366F1' }}>Irvin</span>
      <span style={{ color: '#EC4899' }}>Bot</span>
    </span>
  )
}

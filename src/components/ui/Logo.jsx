export function GradCapIcon({ className = 'size-8' }) {
  return (
    <img
      src="/icons/polarisimp.PNG"
      alt="Polaris"
      className={className}
      style={{ objectFit: 'contain' }}
    />
  )
}

export function Wordmark({ className = '' }) {
  return (
    <span className={`font-bold tracking-tight ${className}`} style={{ color: '#002D4D' }}>
      Polaris
    </span>
  )
}

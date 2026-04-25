export function GradCapIcon({ className = 'size-8' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <polygon points="16,4 1,11.5 16,19 31,11.5" fill="#1E40AF" />
      <path d="M7 15.5v6.5C7 25.6 11.1 28.5 16 28.5s9-2.9 9-6.5V15.5L16 20l-9-4.5z" fill="#7C3AED" opacity="0.9" />
      <line x1="31" y1="11.5" x2="31" y2="20" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="31" cy="21" r="2" fill="#7C3AED" />
    </svg>
  )
}

export function Wordmark({ className = '' }) {
  return (
    <span className={`font-bold tracking-tight ${className}`}>
      <span style={{ color: '#1E40AF' }}>Irvin</span>
      <span style={{ color: '#7C3AED' }}>Bot</span>
    </span>
  )
}

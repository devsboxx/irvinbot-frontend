import Spinner from './Spinner'

export default function Button({ children, loading = false, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand/90 active:bg-brand/80',
    ghost: 'text-slate-400 hover:bg-white/5 hover:text-white',
    danger: 'text-red-400 hover:bg-red-950/50',
  }
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}

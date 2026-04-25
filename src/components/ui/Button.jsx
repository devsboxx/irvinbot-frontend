import Spinner from './Spinner'

export default function Button({
  children,
  loading = false,
  variant = 'primary',
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800',
    ghost: 'text-slate-300 hover:bg-slate-800 hover:text-white',
    danger: 'text-red-400 hover:bg-red-950 hover:text-red-300',
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

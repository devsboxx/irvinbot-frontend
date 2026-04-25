export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}
      <input
        className={`rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all
          border-slate-200 bg-white text-slate-900 placeholder:text-slate-400
          focus:border-brand focus:ring-2 focus:ring-brand/10
          disabled:bg-slate-50 disabled:text-slate-500
          ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

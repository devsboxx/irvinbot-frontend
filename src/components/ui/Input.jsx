export default function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-600">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
            <Icon className="size-4 text-slate-400" strokeWidth={1.8} />
          </div>
        )}
        <input
          className={`w-full rounded-xl border py-2.5 text-sm outline-none transition-all
            border-slate-200 bg-white text-slate-900 placeholder:text-slate-400
            focus:border-violet-400 focus:ring-2 focus:ring-violet-100
            disabled:bg-slate-50 disabled:text-slate-500
            ${Icon ? 'pl-10 pr-3.5' : 'px-3.5'}
            ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}
            ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

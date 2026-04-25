export default function SessionList({ sessions, activeId, onSelect, onCreate, onDelete, loading }) {
  return (
    <div className="flex flex-col">
      <div className="px-3 mb-2">
        <button
          onClick={onCreate}
          disabled={loading}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all duration-200
            border border-white/8 text-slate-400
            hover:bg-white/5 hover:text-slate-200 hover:border-white/15
            disabled:opacity-40"
        >
          <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
          Nueva conversación
        </button>
      </div>

      <div className="flex flex-col gap-0.5 overflow-y-auto px-2">
        {sessions.map(s => (
          <div
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`group relative flex items-center gap-2 rounded-xl px-2.5 py-2 cursor-pointer transition-all duration-200
              ${activeId === s.id
                ? 'text-white bg-gradient-to-r from-brand/25 to-accent/10 border-l-2 border-brand pl-[9px]'
                : 'text-slate-500 hover:bg-white/5 hover:text-slate-300 border-l-2 border-transparent'
              }`}
          >
            <svg className="size-3.5 shrink-0 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            <span className="flex-1 truncate text-xs">{s.title}</span>
            <button
              onClick={e => { e.stopPropagation(); onDelete(s.id) }}
              className="hidden group-hover:flex size-5 items-center justify-center rounded-md text-slate-600
                hover:text-red-400 hover:bg-red-400/10 transition-colors"
              aria-label="Eliminar"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {sessions.length === 0 && !loading && (
          <p className="px-3 py-3 text-xs text-slate-600 text-center">
            Sin conversaciones aún.
          </p>
        )}
      </div>
    </div>
  )
}

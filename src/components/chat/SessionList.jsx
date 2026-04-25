import Button from '../ui/Button'

export default function SessionList({ sessions, activeId, onSelect, onCreate, onDelete, loading }) {
  return (
    <div className="flex flex-col gap-1">
      <Button onClick={onCreate} loading={loading} className="mx-2 mb-2 justify-start gap-2">
        <span className="text-base leading-none">+</span>
        Nueva conversación
      </Button>

      <div className="flex flex-col gap-0.5 overflow-y-auto">
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`group flex items-center gap-2 rounded-lg mx-2 px-3 py-2 cursor-pointer transition-colors
              ${activeId === s.id ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
            onClick={() => onSelect(s.id)}
          >
            <svg className="size-4 shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.97-4.03 9-9 9a8.96 8.96 0 01-4.5-1.2L3 21l1.2-4.5A8.96 8.96 0 013 12c0-4.97 4.03-9 9-9s9 4.03 9 9z" />
            </svg>
            <span className="flex-1 truncate text-sm">{s.title}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(s.id) }}
              className="hidden group-hover:flex size-5 items-center justify-center rounded opacity-60 hover:opacity-100 hover:text-red-400 transition-opacity"
              aria-label="Eliminar sesión"
            >
              ×
            </button>
          </div>
        ))}

        {sessions.length === 0 && !loading && (
          <p className="px-4 py-3 text-xs text-slate-500">No hay conversaciones aún.</p>
        )}
      </div>
    </div>
  )
}

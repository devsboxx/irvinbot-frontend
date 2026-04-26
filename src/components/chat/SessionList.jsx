import { Plus, MessageSquare, Trash2 } from 'lucide-react'

export default function SessionList({ sessions, activeId, onSelect, onCreate, onDelete, loading }) {
  return (
    <div className="flex flex-col gap-1">

      {/* New conversation button */}
      <div className="px-3">
        <button
          onClick={onCreate}
          disabled={loading}
          className="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all duration-200
            bg-white/5 border border-white/8 text-slate-400
            hover:bg-gradient-to-r hover:from-brand/20 hover:to-accent/10
            hover:text-slate-200 hover:border-white/15
            disabled:opacity-40"
        >
          <div className="flex size-5 items-center justify-center rounded-md bg-white/10 group-hover:bg-white/15 transition-colors">
            <Plus className="size-3.5" strokeWidth={2.5} />
          </div>
          <span className="text-xs">Nueva conversación</span>
        </button>
      </div>

      {/* Session items */}
      <div className="flex flex-col gap-0.5 overflow-y-auto px-2 mt-1">
        {sessions.map(s => (
          <div
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`group relative flex items-center gap-2 rounded-xl px-2.5 py-2 cursor-pointer transition-all duration-150
              ${activeId === s.id
                ? 'text-white bg-gradient-to-r from-brand/30 to-accent/10 border-l-2 border-brand/70 pl-[9px]'
                : 'text-slate-500 hover:bg-white/5 hover:text-slate-300 border-l-2 border-transparent'
              }`}
          >
            <MessageSquare className="size-3.5 shrink-0 opacity-50" strokeWidth={1.5} />
            <span className="flex-1 truncate text-xs">{s.title}</span>
            <button
              onClick={e => { e.stopPropagation(); onDelete(s.id) }}
              className="hidden group-hover:flex size-5 items-center justify-center rounded-md
                text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              aria-label="Eliminar"
            >
              <Trash2 className="size-3.5" strokeWidth={2} />
            </button>
          </div>
        ))}

        {sessions.length === 0 && !loading && (
          <p className="px-3 py-4 text-xs text-slate-600 text-center leading-relaxed">
            Sin conversaciones aún.<br />
            <span className="text-slate-700">¡Empieza una nueva!</span>
          </p>
        )}
      </div>
    </div>
  )
}

import { FileText, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { deleteDocument } from '../../api/docs'
import Spinner from '../ui/Spinner'

const STATUS_CONFIG = {
  ready:      { color: 'text-emerald-400', icon: CheckCircle2 },
  processing: { color: 'text-amber-400',   icon: Clock },
  error:      { color: 'text-red-400',     icon: AlertCircle },
}

export default function DocumentList({ documents, onDeleted, loading }) {
  async function handleDelete(id) {
    try {
      await deleteDocument(id)
      onDeleted?.(id)
    } catch {}
  }

  if (loading) return <div className="flex justify-center py-2"><Spinner size="sm" /></div>
  if (!documents.length) return (
    <p className="px-4 py-2 text-xs text-slate-500 text-center">Sin documentos aún.</p>
  )

  return (
    <div className="flex flex-col gap-0.5">
      {documents.map((doc) => {
        const cfg = STATUS_CONFIG[doc.status] ?? STATUS_CONFIG.error
        const StatusIcon = cfg.icon
        return (
          <div
            key={doc.id}
            className="group flex items-center gap-2 rounded-lg mx-2 px-3 py-1.5 hover:bg-white/5 transition-colors"
          >
            <FileText className="size-4 shrink-0 text-slate-500" strokeWidth={1.5} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-slate-300">{doc.original_name}</p>
              <div className={`flex items-center gap-1 ${cfg.color}`}>
                <StatusIcon className="size-2.5" strokeWidth={2} />
                <p className="text-[10px]">
                  {doc.status === 'ready' ? `${doc.chunk_count} fragmentos` : doc.status}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(doc.id)}
              className="hidden group-hover:flex size-5 items-center justify-center rounded-md
                text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              aria-label="Eliminar documento"
            >
              <Trash2 className="size-3" strokeWidth={2} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

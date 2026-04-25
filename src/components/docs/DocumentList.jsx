import { deleteDocument } from '../../api/docs'
import Spinner from '../ui/Spinner'

const STATUS_STYLES = {
  ready: 'text-emerald-400',
  processing: 'text-amber-400',
  error: 'text-red-400',
}

export default function DocumentList({ documents, onDeleted, loading }) {
  async function handleDelete(id) {
    try {
      await deleteDocument(id)
      onDeleted?.(id)
    } catch {}
  }

  if (loading) return <div className="flex justify-center py-2"><Spinner size="sm" /></div>
  if (!documents.length) return <p className="px-4 text-xs text-slate-500">Sin documentos aún.</p>

  return (
    <div className="flex flex-col gap-0.5">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="group flex items-center gap-2 rounded-lg mx-2 px-3 py-1.5 hover:bg-slate-800 transition-colors"
        >
          <svg className="size-4 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-slate-300">{doc.original_name}</p>
            <p className={`text-[10px] ${STATUS_STYLES[doc.status] ?? 'text-slate-500'}`}>
              {doc.status === 'ready' ? `${doc.chunk_count} fragmentos` : doc.status}
            </p>
          </div>
          <button
            onClick={() => handleDelete(doc.id)}
            className="hidden group-hover:flex size-5 items-center justify-center text-slate-500 hover:text-red-400 transition-colors"
            aria-label="Eliminar documento"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

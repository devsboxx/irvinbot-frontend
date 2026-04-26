import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { uploadDocument } from '../../api/docs'
import Spinner from '../ui/Spinner'

export default function UploadButton({ onUploaded }) {
  const inputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setLoading(true)
    try {
      const res = await uploadDocument(file)
      onUploaded?.(res.document)
    } catch (err) {
      setError(err.message ?? 'Error al subir')
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="mx-2 mt-1">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleChange}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-400
          hover:bg-white/5 hover:text-slate-200 transition-colors disabled:opacity-50"
      >
        {loading
          ? <Spinner size="sm" />
          : <Upload className="size-3.5" strokeWidth={2} />
        }
        {loading ? 'Procesando…' : 'Subir PDF'}
      </button>
      {error && <p className="mt-1 px-3 text-xs text-red-400">{error}</p>}
    </div>
  )
}

import { useState, useRef } from 'react'

const ACCEPT = 'image/*,.pdf,.txt,.md,.csv,.doc,.docx,.xls,.xlsx'
const MAX_FILES = 5
const MAX_IMAGE_BYTES = 4 * 1024 * 1024 // 4 MB

async function processFile(file) {
  const base = { name: file.name, type: file.type, size: file.size }
  if (file.type.startsWith('image/') && file.size <= MAX_IMAGE_BYTES) {
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = e => resolve({ ...base, dataUrl: e.target.result })
      reader.readAsDataURL(file)
    })
  }
  return base
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileTypeBox({ name, type }) {
  const ext = name.split('.').pop().toUpperCase().slice(0, 4)
  const colors = {
    pdf: 'bg-red-100 text-red-600',
    doc: 'bg-blue-100 text-blue-600', docx: 'bg-blue-100 text-blue-600',
    xls: 'bg-green-100 text-green-600', xlsx: 'bg-green-100 text-green-600',
    csv: 'bg-emerald-100 text-emerald-600',
    txt: 'bg-slate-100 text-slate-500', md: 'bg-slate-100 text-slate-500',
  }
  const key = name.split('.').pop().toLowerCase()
  return (
    <span className={`flex size-5 items-center justify-center rounded text-[9px] font-bold ${colors[key] ?? 'bg-slate-100 text-slate-500'}`}>
      {ext}
    </span>
  )
}

function FilePill({ file, onRemove }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-slate-100 pl-1.5 pr-1 py-1 text-xs text-slate-700 max-w-[160px]">
      {file.dataUrl
        ? <img src={file.dataUrl} alt={file.name} className="size-5 shrink-0 rounded-full object-cover" />
        : <FileTypeBox name={file.name} type={file.type} />
      }
      <span className="truncate">{file.name}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
        aria-label="Quitar archivo"
      >
        <svg className="size-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" d="M1 1l10 10M11 1L1 11" />
        </svg>
      </button>
    </div>
  )
}

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState('')
  const [files, setFiles] = useState([])
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  async function handleFileChange(e) {
    const selected = Array.from(e.target.files ?? [])
    const processed = await Promise.all(selected.map(processFile))
    setFiles(prev => [...prev, ...processed].slice(0, MAX_FILES))
    e.target.value = ''
  }

  function removeFile(i) {
    setFiles(prev => prev.filter((_, idx) => idx !== i))
  }

  function submit() {
    const trimmed = text.trim()
    if (!trimmed && files.length === 0) return
    if (disabled) return
    onSend(trimmed, files)
    setText('')
    setFiles([])
    textareaRef.current?.focus()
  }

  const canSend = (text.trim().length > 0 || files.length > 0) && !disabled

  return (
    <div className="px-4 pb-5 pt-2">
      <div className="mx-auto max-w-3xl">
        <div className={`rounded-2xl border bg-white transition-all duration-200
          shadow-md shadow-slate-200/60 hover:shadow-lg
          ${disabled ? 'border-slate-200' : 'border-slate-200 hover:border-slate-300 focus-within:border-brand/40 focus-within:ring-2 focus-within:ring-brand/10 focus-within:shadow-lg'}`}>

          {/* File previews */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-4 pt-3 pb-1 border-b border-slate-100 animate-fade-in">
              {files.map((f, i) => (
                <FilePill key={i} file={f} onRemove={() => removeFile(i)} />
              ))}
            </div>
          )}

          <div className="flex items-end gap-2 px-4 py-3">
            {/* Attach button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || files.length >= MAX_FILES}
              title="Adjuntar archivo"
              className="mb-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl text-slate-400
                transition-all duration-200 hover:bg-slate-100 hover:text-brand
                disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Adjuntar archivo"
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
              </svg>
            </button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={files.length > 0 ? 'Agrega una pregunta sobre el archivo… (opcional)' : 'Escribe tu pregunta… (Enter para enviar)'}
              disabled={disabled}
              className="flex-1 resize-none bg-transparent text-sm text-slate-800 placeholder:text-slate-400
                outline-none disabled:opacity-50 max-h-40 overflow-y-auto"
              style={{ height: 'auto' }}
              onInput={e => {
                e.target.style.height = 'auto'
                e.target.style.height = e.target.scrollHeight + 'px'
              }}
            />

            {/* Send button */}
            <button
              type="button"
              onClick={submit}
              disabled={!canSend}
              className="mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl text-white
                bg-gradient-to-br from-brand to-accent
                transition-all duration-200 shadow-md shadow-brand/25
                hover:opacity-90 hover:shadow-lg hover:scale-105
                active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
              aria-label="Enviar"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>

        <p className="mt-2 text-center text-[11px] text-slate-400">
          Imágenes, PDF, Word, Excel, CSV · Máx. {MAX_FILES} archivos
        </p>
      </div>
    </div>
  )
}

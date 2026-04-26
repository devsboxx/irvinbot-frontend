import { GradCapIcon } from '../ui/Logo'
import { FileText, FileSpreadsheet, FileCode } from 'lucide-react'

export default function MessageBubble({ role, content, attachments = [], streaming = false }) {
  const isUser = role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end animate-slide-in-right">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm text-sm leading-relaxed text-white
          bg-gradient-to-br from-brand to-accent shadow-lg shadow-brand/20 overflow-hidden">
          {attachments.length > 0 && (
            <div className="flex flex-col gap-2 p-3 pb-2">
              {attachments.map((att, i) =>
                att.dataUrl
                  ? <img key={i} src={att.dataUrl} alt={att.name} className="rounded-xl max-h-56 w-full object-cover" />
                  : <FileCard key={i} file={att} />
              )}
            </div>
          )}
          {content && <p className="whitespace-pre-wrap px-4 py-3">{content}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 animate-slide-in-left">
      {/* Avatar — logo image */}
      <div className="mt-1 size-9 shrink-0 rounded-full overflow-hidden ring-2 ring-violet-100 shadow-sm">
        <GradCapIcon className="size-9" />
      </div>

      {/* Bubble */}
      <div className="flex-1 min-w-0 rounded-2xl rounded-tl-sm overflow-hidden
        bg-white border-l-2 border-violet-200/70
        shadow-sm ring-1 ring-slate-100/80 px-4 py-3.5">
        {streaming
          ? (
            <span className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {content}
              <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-accent opacity-80 align-middle rounded-full" />
            </span>
          )
          : <div className="text-slate-700 space-y-1">{renderMarkdown(content)}</div>
        }
      </div>
    </div>
  )
}

// ── Markdown renderer ────────────────────────────────────────────────────────

function renderMarkdown(text) {
  if (!text) return null
  const lines = text.split('\n')
  const result = []
  let listBuffer = []
  let orderedBuffer = []
  let orderedStart = 1
  let k = 0

  const flushUnordered = () => {
    if (!listBuffer.length) return
    result.push(
      <ul key={k++} className="my-1.5 space-y-1 pl-1">
        {listBuffer.map((item, j) => (
          <li key={j} className="flex items-start gap-2 text-sm leading-relaxed">
            <span className="mt-[7px] size-1.5 rounded-full bg-violet-400 shrink-0" />
            <span>{renderInline(item)}</span>
          </li>
        ))}
      </ul>
    )
    listBuffer = []
  }

  const flushOrdered = () => {
    if (!orderedBuffer.length) return
    const start = orderedStart
    result.push(
      <ol key={k++} className="my-1.5 space-y-1 pl-1">
        {orderedBuffer.map((item, j) => (
          <li key={j} className="flex items-start gap-2 text-sm leading-relaxed">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full
              bg-violet-100 text-[10px] font-bold text-violet-700">
              {start + j}
            </span>
            <span>{renderInline(item)}</span>
          </li>
        ))}
      </ol>
    )
    orderedBuffer = []
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('### ')) {
      flushUnordered(); flushOrdered()
      result.push(<p key={k++} className="text-sm font-semibold text-slate-800 mt-3 mb-0.5">{renderInline(line.slice(4))}</p>)
    } else if (line.startsWith('## ')) {
      flushUnordered(); flushOrdered()
      result.push(<p key={k++} className="text-sm font-bold text-slate-900 mt-4 mb-1">{renderInline(line.slice(3))}</p>)
    } else if (line.startsWith('# ')) {
      flushUnordered(); flushOrdered()
      result.push(<p key={k++} className="text-base font-bold text-slate-900 mt-4 mb-1">{renderInline(line.slice(2))}</p>)
    } else if (/^[-*•]\s/.test(line)) {
      flushOrdered()
      listBuffer.push(line.slice(2))
    } else if (/^\d+\.\s/.test(line)) {
      flushUnordered()
      const m = line.match(/^(\d+)\.\s(.*)/)
      if (m) {
        if (!orderedBuffer.length) orderedStart = parseInt(m[1], 10)
        orderedBuffer.push(m[2])
      }
    } else if (/^---+$/.test(line.trim())) {
      flushUnordered(); flushOrdered()
      result.push(<hr key={k++} className="border-slate-100 my-2" />)
    } else if (line.trim() === '') {
      flushUnordered(); flushOrdered()
      if (result.length > 0) result.push(<div key={k++} className="h-1.5" />)
    } else {
      flushUnordered(); flushOrdered()
      result.push(<p key={k++} className="text-sm leading-relaxed">{renderInline(line)}</p>)
    }
  }
  flushUnordered(); flushOrdered()
  return result
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold text-slate-800">{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i} className="italic">{part.slice(1, -1)}</em>
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="rounded-md bg-violet-50 px-1.5 py-0.5 text-xs font-mono text-violet-700 border border-violet-100">{part.slice(1, -1)}</code>
    return part
  })
}

// ── File attachment card ─────────────────────────────────────────────────────

const FILE_TYPES = {
  pdf:  { Icon: FileText,        bg: 'bg-red-500/25',     text: 'text-red-200' },
  doc:  { Icon: FileText,        bg: 'bg-blue-500/25',    text: 'text-blue-200' },
  docx: { Icon: FileText,        bg: 'bg-blue-500/25',    text: 'text-blue-200' },
  xls:  { Icon: FileSpreadsheet, bg: 'bg-green-500/25',   text: 'text-green-200' },
  xlsx: { Icon: FileSpreadsheet, bg: 'bg-green-500/25',   text: 'text-green-200' },
  csv:  { Icon: FileSpreadsheet, bg: 'bg-emerald-500/25', text: 'text-emerald-200' },
  txt:  { Icon: FileCode,        bg: 'bg-white/15',       text: 'text-white/70' },
  md:   { Icon: FileCode,        bg: 'bg-white/15',       text: 'text-white/70' },
}

function FileCard({ file }) {
  const ext = file.name.split('.').pop().toLowerCase()
  const cfg = FILE_TYPES[ext] ?? { Icon: FileText, bg: 'bg-white/15', text: 'text-white/70' }
  const { Icon } = cfg
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-white/15 px-3 py-2.5">
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${cfg.bg} ${cfg.text}`}>
        <Icon className="size-5" strokeWidth={1.5} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-white/90">{file.name}</p>
        {file.size && <p className="text-[10px] text-white/50">{formatSize(file.size)}</p>}
      </div>
    </div>
  )
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

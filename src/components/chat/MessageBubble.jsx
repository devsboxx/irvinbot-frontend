export default function MessageBubble({ role, content, attachments = [], streaming = false }) {
  const isUser = role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end animate-slide-in-right">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm text-sm leading-relaxed text-white
          bg-gradient-to-br from-brand to-accent shadow-lg shadow-brand/20 overflow-hidden">

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="flex flex-col gap-2 p-3 pb-2">
              {attachments.map((att, i) =>
                att.dataUrl
                  ? <img key={i} src={att.dataUrl} alt={att.name}
                      className="rounded-xl max-h-56 w-full object-cover" />
                  : <FileCard key={i} file={att} />
              )}
            </div>
          )}

          {/* Text */}
          {content && (
            <p className="whitespace-pre-wrap px-4 py-3">{content}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 animate-slide-in-left">
      <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white
        bg-gradient-to-br from-brand to-accent shadow-sm shadow-brand/30">
        IB
      </div>
      <div className="flex-1 min-w-0 rounded-2xl rounded-tl-sm bg-white px-4 py-3.5 text-sm leading-relaxed text-slate-700
        shadow-sm ring-1 ring-slate-100/80">
        {streaming
          ? (
            <span className="whitespace-pre-wrap">
              {content}
              <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-accent opacity-80 align-middle rounded-full" />
            </span>
          )
          : renderContent(content)
        }
      </div>
    </div>
  )
}

function FileCard({ file }) {
  const ext = file.name.split('.').pop().toLowerCase()
  const colors = {
    pdf:  { bg: 'bg-red-500/20',     text: 'text-red-200',   label: 'PDF' },
    doc:  { bg: 'bg-blue-500/20',    text: 'text-blue-200',  label: 'DOC' },
    docx: { bg: 'bg-blue-500/20',    text: 'text-blue-200',  label: 'DOCX' },
    xls:  { bg: 'bg-green-500/20',   text: 'text-green-200', label: 'XLS' },
    xlsx: { bg: 'bg-green-500/20',   text: 'text-green-200', label: 'XLSX' },
    csv:  { bg: 'bg-emerald-500/20', text: 'text-emerald-200', label: 'CSV' },
    txt:  { bg: 'bg-white/15',       text: 'text-white/70',  label: 'TXT' },
    md:   { bg: 'bg-white/15',       text: 'text-white/70',  label: 'MD' },
  }
  const c = colors[ext] ?? { bg: 'bg-white/15', text: 'text-white/70', label: ext.toUpperCase().slice(0, 4) }

  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-white/15 px-3 py-2.5">
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${c.bg} ${c.text}`}>
        {c.label}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-white/90">{file.name}</p>
        <p className="text-[10px] text-white/50">{formatSize(file.size)}</p>
      </div>
    </div>
  )
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function renderContent(text) {
  const parts = text.split(/(\*\*[^*\n]+\*\*)/g)
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i} className="font-semibold text-slate-800">{part.slice(2, -2)}</strong>
          : part
      )}
    </span>
  )
}

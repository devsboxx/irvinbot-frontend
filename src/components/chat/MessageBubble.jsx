export default function MessageBubble({ role, content, streaming = false }) {
  const isUser = role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end animate-slide-in-right">
        <div className="max-w-[78%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed text-white
          bg-gradient-to-br from-brand to-accent shadow-lg shadow-brand/20">
          <p className="whitespace-pre-wrap">{content}</p>
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

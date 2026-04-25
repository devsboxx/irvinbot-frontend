export default function MessageBubble({ role, content, streaming = false }) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="mr-2 flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm">
          🤖
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isUser
            ? 'rounded-tr-sm bg-indigo-600 text-white'
            : 'rounded-tl-sm bg-white text-slate-800 shadow-sm ring-1 ring-slate-100'
          }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {streaming && (
          <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-current opacity-70" />
        )}
      </div>
      {isUser && (
        <div className="ml-2 flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm">
          👤
        </div>
      )}
    </div>
  )
}

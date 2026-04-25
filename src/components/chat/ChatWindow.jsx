import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import Spinner from '../ui/Spinner'
import { GradCapIcon } from '../ui/Logo'

const SUGGESTIONS = [
  '¿Cómo planteo mi hipótesis?',
  'Estructura del marco teórico',
  '¿Qué es la triangulación?',
  'Cuantitativo vs. cualitativo',
  'Cómo citar en APA 7',
  '¿Cómo defino mis objetivos?',
]

export default function ChatWindow({ messages, streamingContent, isStreaming, loading, onSuggestion }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-10">

        <div className="text-center animate-slide-up">
          <div className="relative inline-flex">
            <GradCapIcon className="size-16 drop-shadow-md" />
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand/20 to-accent/20 blur-xl -z-10 scale-150" />
          </div>

          <h2 className="mt-5 text-2xl font-bold gradient-text leading-tight">
            ¿En qué puedo ayudarte?
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Pregúntame sobre hipótesis, metodología, citas, marco teórico y más.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 max-w-lg">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={s}
              onClick={() => onSuggestion?.(s)}
              className="animate-fade-in rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600
                shadow-sm transition-all duration-200
                hover:border-brand/30 hover:text-brand hover:shadow-md hover:scale-105 hover:-translate-y-0.5
                active:scale-100 active:translate-y-0"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 flex flex-col gap-6">
        {messages.map(m => (
          <MessageBubble key={m.id} role={m.role} content={m.content} attachments={m.attachments} />
        ))}
        {isStreaming && streamingContent !== null && (
          <MessageBubble role="assistant" content={streamingContent} streaming />
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

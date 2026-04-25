import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import Spinner from '../ui/Spinner'

export default function ChatWindow({ messages, streamingContent, isStreaming, loading }) {
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
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="text-5xl">🤖</div>
        <div>
          <h2 className="text-lg font-semibold text-slate-700">¿En qué te ayudo hoy?</h2>
          <p className="mt-1 text-sm text-slate-400">
            Puedo ayudarte con tu tesis: metodología, estructura, citas, análisis de datos y más.
          </p>
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((s) => (
            <span
              key={s}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
      {messages.map((m) => (
        <MessageBubble key={m.id} role={m.role} content={m.content} />
      ))}
      {isStreaming && streamingContent !== null && (
        <MessageBubble role="assistant" content={streamingContent} streaming />
      )}
      <div ref={bottomRef} />
    </div>
  )
}

const SUGGESTIONS = [
  '¿Cómo planteo mi hipótesis?',
  'Estructura de un marco teórico',
  '¿Qué es la triangulación?',
  'Diferencia entre cualitativo y cuantitativo',
  'Cómo citar en APA 7',
]

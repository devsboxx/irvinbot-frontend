import { useEffect, useRef } from 'react'
import { Target, ClipboardList, MapPin, Search, Scale, HelpCircle } from 'lucide-react'
import MessageBubble from './MessageBubble'
import Spinner from '../ui/Spinner'
import { GradCapIcon } from '../ui/Logo'

const SUGGESTIONS = [
  { Icon: Target,         text: 'Quiero construir mi objeto de estudio' },
  { Icon: ClipboardList,  text: '¿En qué consiste el Modelo de los 10 Pasos?' },
  { Icon: MapPin,         text: 'Ayúdame con las coordenadas espacio-temporales' },
  { Icon: Search,         text: '¿Cómo identifico los hechos de mi investigación?' },
  { Icon: Scale,          text: '¿Cuál es la diferencia entre síntomas y causas?' },
  { Icon: HelpCircle,     text: 'Quiero formular mis preguntas de investigación' },
]

function ThinkingBubble() {
  return (
    <div className="flex gap-3 animate-slide-in-left">
      <div className="mt-1 size-9 shrink-0 rounded-full overflow-hidden ring-2 ring-violet-100 shadow-sm">
        <GradCapIcon className="size-9" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-white px-4 py-3.5
        shadow-sm ring-1 ring-slate-100/80 border-l-2 border-violet-200/70">
        <span className="size-2 rounded-full bg-violet-300 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="size-2 rounded-full bg-pink-300 animate-bounce"   style={{ animationDelay: '160ms' }} />
        <span className="size-2 rounded-full bg-violet-300 animate-bounce" style={{ animationDelay: '320ms' }} />
      </div>
    </div>
  )
}

export default function ChatWindow({ messages, streamingContent, isStreaming, loading, onSuggestion }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent, isStreaming])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-7 px-6 py-10">

        <div className="text-center animate-slide-up">
          <div className="relative inline-flex mb-5">
            <div className="absolute inset-0 scale-[2.2] blur-2xl bg-violet-300/20 rounded-full pointer-events-none" />
            <div className="size-20 rounded-2xl overflow-hidden shadow-xl shadow-violet-200/40 ring-2 ring-violet-100 relative">
              <GradCapIcon className="size-20" />
            </div>
          </div>
          <h2 className="text-2xl font-bold gradient-text">Hola, soy IrvinBot</h2>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Te guiaré paso a paso por el{' '}
            <strong className="text-slate-700">Modelo de los 10 Pasos</strong>{' '}
            para construir el objeto de estudio de tu tesis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl">
          {SUGGESTIONS.map(({ Icon, text }, i) => (
            <button
              key={text}
              onClick={() => onSuggestion?.(text)}
              className="animate-fade-in flex items-center gap-3 rounded-2xl border border-slate-200 bg-white
                px-4 py-3 text-left shadow-sm transition-all duration-200
                hover:border-violet-200 hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5
                active:scale-100 active:translate-y-0 group"
              style={{ animationDelay: `${i * 55}ms` }}
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl
                bg-violet-50 text-violet-500 group-hover:bg-violet-100 transition-colors">
                <Icon className="size-4" strokeWidth={1.8} />
              </div>
              <span className="text-xs leading-snug text-slate-600">{text}</span>
            </button>
          ))}
        </div>

        <p className="text-[11px] text-slate-400 animate-fade-in" style={{ animationDelay: '380ms' }}>
          Escribe cualquier pregunta o elige una sugerencia para comenzar
        </p>
      </div>
    )
  }

  const isThinking = isStreaming && streamingContent === ''

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 flex flex-col gap-5">
        {messages.map(m => (
          <MessageBubble key={m.id} role={m.role} content={m.content} />
        ))}
        {isThinking && <ThinkingBubble />}
        {isStreaming && streamingContent !== '' && (
          <MessageBubble role="assistant" content={streamingContent} streaming />
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

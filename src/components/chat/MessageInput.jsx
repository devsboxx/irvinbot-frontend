import { useState, useRef } from 'react'
import { SendHorizonal } from 'lucide-react'

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    // Defer focus until after React finishes re-rendering from onSend state updates
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  const canSend = text.trim().length > 0 && !disabled

  return (
    <div className="px-3 sm:px-4 pb-4 sm:pb-5 pt-2">
      <div className="mx-auto max-w-3xl">
        <div className={`rounded-2xl border bg-white transition-all duration-200
          shadow-md shadow-slate-200/60
          ${disabled
            ? 'border-slate-200 opacity-80'
            : 'border-slate-200 hover:border-violet-200 focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100/60 focus-within:shadow-lg focus-within:shadow-violet-100/40'
          }`}>

          <div className="flex items-end gap-2 px-4 py-3">
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu respuesta… (Enter para enviar)"
              disabled={disabled}
              className="flex-1 resize-none bg-transparent text-sm text-slate-800 placeholder:text-slate-400
                outline-none disabled:opacity-50 max-h-40 overflow-y-auto"
              style={{ height: 'auto' }}
              onInput={e => {
                e.target.style.height = 'auto'
                e.target.style.height = e.target.scrollHeight + 'px'
              }}
            />

            <button
              type="button"
              onClick={submit}
              disabled={!canSend}
              className="mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl text-white
                btn-shimmer transition-all duration-200 shadow-md shadow-violet-200/40
                hover:shadow-lg hover:scale-105 active:scale-95
                disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100
                disabled:bg-slate-300 disabled:[background:theme(colors.slate.300)]"
              aria-label="Enviar"
            >
              <SendHorizonal className="size-4" strokeWidth={2.2} />
            </button>
          </div>
        </div>

        <p className="mt-2 text-center text-[11px] text-slate-400">
          Shift + Enter para nueva línea
        </p>
      </div>
    </div>
  )
}

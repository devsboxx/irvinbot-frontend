import { useState, useRef } from 'react'

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
    textareaRef.current?.focus()
  }

  return (
    <div className="px-4 pb-5 pt-2">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-3 rounded-2xl border bg-white px-4 py-3
          shadow-md shadow-slate-200/60 transition-all duration-200
          border-slate-200 hover:border-slate-300 hover:shadow-lg
          focus-within:border-brand/40 focus-within:ring-2 focus-within:ring-brand/10 focus-within:shadow-lg">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta… (Enter para enviar)"
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
            onClick={submit}
            disabled={!text.trim() || disabled}
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
        <p className="mt-2 text-center text-[11px] text-slate-400">
          IrvinBot puede cometer errores. Verifica la información importante.
        </p>
      </div>
    </div>
  )
}

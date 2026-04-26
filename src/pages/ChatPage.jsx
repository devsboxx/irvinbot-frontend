import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { listSessions, createSession, getMessages, deleteSession, streamMessage } from '../api/chat'
import { LogOut } from 'lucide-react'
import SessionList from '../components/chat/SessionList'
import ChatWindow from '../components/chat/ChatWindow'
import MessageInput from '../components/chat/MessageInput'
import { GradCapIcon, Wordmark } from '../components/ui/Logo'

export default function ChatPage() {
  const { user, logout } = useAuth()

  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')

  useEffect(() => {
    listSessions()
      .then(setSessions)
      .catch(() => {})
      .finally(() => setLoadingSessions(false))
  }, [])

  useEffect(() => {
    if (!activeSessionId) return
    setLoadingMessages(true)
    setMessages([])
    getMessages(activeSessionId)
      .then(setMessages)
      .catch(() => {})
      .finally(() => setLoadingMessages(false))
  }, [activeSessionId])

  const handleSelectSession = useCallback((id) => {
    setActiveSessionId(id)
    setMessages([])
  }, [])

  const handleNewSession = useCallback(async () => {
    try {
      const session = await createSession()
      setSessions(prev => [session, ...prev])
      setActiveSessionId(session.id)
      setMessages([])
    } catch {}
  }, [])

  const handleDeleteSession = useCallback(async (id) => {
    try {
      await deleteSession(id)
    } catch {}
    setSessions(prev => prev.filter(s => s.id !== id))
    if (activeSessionId === id) {
      setActiveSessionId(null)
      setMessages([])
    }
  }, [activeSessionId])

  const handleSend = useCallback(async (text) => {
    if (isStreaming || !text.trim()) return

    let sessionId = activeSessionId
    if (!sessionId) {
      try {
        const session = await createSession()
        setSessions(prev => [session, ...prev])
        setActiveSessionId(session.id)
        sessionId = session.id
        setMessages([])
      } catch (err) {
        return
      }
    }

    const userMsg = { id: `u_${Date.now()}`, role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setIsStreaming(true)
    setStreamingContent('')

    try {
      let collected = ''
      await streamMessage(sessionId, text, chunk => {
        collected += chunk
        setStreamingContent(collected)
      })

      const aiMsg = { id: `a_${Date.now()}`, role: 'assistant', content: collected }
      setMessages(prev => [...prev, aiMsg])

      setSessions(prev => prev.map(s =>
        s.id === sessionId && s.title === 'Nueva conversación'
          ? { ...s, title: text.slice(0, 55) + (text.length > 55 ? '…' : '') }
          : s
      ))
    } catch (err) {
      const errMsg = {
        id: `e_${Date.now()}`,
        role: 'assistant',
        content: `No se pudo obtener respuesta. ${err.message ?? ''}`.trim(),
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setIsStreaming(false)
      setStreamingContent('')
    }
  }, [activeSessionId, isStreaming])

  const handleSuggestion = useCallback((text) => {
    handleSend(text)
  }, [handleSend])

  return (
    <div className="flex h-screen font-sans">
      {/* ── Sidebar ── */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-white/5 relative overflow-hidden
        bg-gradient-to-b from-[#0E1029] to-[#090B1A]">

        {/* Ambient glows */}
        <div className="absolute -top-10 -left-10 w-52 h-52 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-36 h-36 rounded-full bg-pink-500/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-20 -left-8 w-40 h-40 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5 px-4 pt-5 pb-4 border-b border-white/5">
          <GradCapIcon className="size-8 drop-shadow-sm rounded-lg overflow-hidden" />
          <Wordmark className="text-lg" />
        </div>

        {/* Sessions */}
        <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden pt-3">
          <p className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Conversaciones
          </p>
          <div className="flex-1 overflow-y-auto">
            <SessionList
              sessions={sessions}
              activeId={activeSessionId}
              onSelect={handleSelectSession}
              onCreate={handleNewSession}
              onDelete={handleDeleteSession}
              loading={loadingSessions}
            />
          </div>
        </div>

        {/* User profile */}
        <div className="relative border-t border-white/5 px-3 py-3">
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-white/5 transition-colors group">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white
              bg-gradient-to-br from-brand to-accent shadow-md shadow-brand/30">
              {(user?.full_name ?? '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-medium text-slate-300 leading-tight">{user?.full_name}</p>
              <p className="truncate text-[10px] text-slate-600 mt-0.5">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="text-slate-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            >
              <LogOut className="size-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main chat area ── */}
      <main className="flex flex-1 flex-col overflow-hidden bg-gradient-to-b from-slate-50/60 to-white">
        <ChatWindow
          messages={messages}
          streamingContent={streamingContent}
          isStreaming={isStreaming}
          loading={loadingMessages}
          onSuggestion={handleSuggestion}
        />
        <MessageInput onSend={handleSend} disabled={isStreaming} />
      </main>
    </div>
  )
}

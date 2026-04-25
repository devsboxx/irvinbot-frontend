import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  mockListSessions, mockCreateSession, mockGetMessages,
  mockDeleteSession, mockUpdateSessionTitle, mockStreamMessage,
} from '../lib/mock'
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
    setSessions(mockListSessions())
    setLoadingSessions(false)
  }, [])

  useEffect(() => {
    if (!activeSessionId) return
    setLoadingMessages(true)
    setMessages(mockGetMessages(activeSessionId))
    setLoadingMessages(false)
  }, [activeSessionId])

  const handleNewSession = useCallback(() => {
    const session = mockCreateSession()
    setSessions(prev => [session, ...prev])
    setActiveSessionId(session.id)
    setMessages([])
  }, [])

  const handleDeleteSession = useCallback((id) => {
    mockDeleteSession(id)
    setSessions(prev => prev.filter(s => s.id !== id))
    if (activeSessionId === id) {
      setActiveSessionId(null)
      setMessages([])
    }
  }, [activeSessionId])

  const handleSend = useCallback(async (text, files = []) => {
    if (isStreaming) return

    let sessionId = activeSessionId
    if (!sessionId) {
      const session = mockCreateSession()
      setSessions(prev => [session, ...prev])
      setActiveSessionId(session.id)
      sessionId = session.id
      setMessages([])
    }

    const isFirstMessage = mockGetMessages(sessionId).length === 0

    // Keep dataUrls in React state for image previews; they won't be persisted to localStorage
    const userMsg = { id: `u_${Date.now()}`, role: 'user', content: text, attachments: files }
    setMessages(prev => [...prev, userMsg])
    setIsStreaming(true)
    setStreamingContent('')

    try {
      let collected = ''
      await mockStreamMessage(sessionId, text, files, chunk => {
        collected = chunk
        setStreamingContent(chunk)
      })

      const aiMsg = { id: `a_${Date.now()}`, role: 'assistant', content: collected }
      setMessages(prev => [...prev, aiMsg])

      if (isFirstMessage) {
        const newTitle = text.slice(0, 55)
        mockUpdateSessionTitle(sessionId, newTitle)
        setSessions(prev => prev.map(s =>
          s.id === sessionId ? { ...s, title: newTitle } : s
        ))
      }
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
      <aside className="flex w-60 shrink-0 flex-col border-r border-white/5 relative overflow-hidden
        bg-gradient-to-b from-[#0E1029] to-[#090B1A]">

        {/* Ambient glow behind logo */}
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-brand/15 blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-32 h-32 rounded-full bg-accent/10 blur-2xl pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5 px-4 pt-5 pb-4">
          <GradCapIcon className="size-7 drop-shadow-sm" />
          <Wordmark className="text-lg" />
        </div>

        {/* Session list */}
        <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden pt-1">
          <p className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Conversaciones
          </p>
          <div className="flex-1 overflow-y-auto">
            <SessionList
              sessions={sessions}
              activeId={activeSessionId}
              onSelect={id => setActiveSessionId(id)}
              onCreate={handleNewSession}
              onDelete={handleDeleteSession}
              loading={loadingSessions}
            />
          </div>
        </div>

        {/* User profile */}
        <div className="relative border-t border-white/5 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white
              bg-gradient-to-br from-brand to-accent shadow-md shadow-brand/20">
              {user?.fullName?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-medium text-slate-300">{user?.fullName}</p>
              <p className="truncate text-[10px] text-slate-600">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="text-slate-600 hover:text-slate-400 transition-colors"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
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

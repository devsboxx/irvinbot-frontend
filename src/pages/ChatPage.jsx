import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { createSession, listSessions, getMessages, deleteSession, streamMessage } from '../api/chat'
import { listDocuments } from '../api/docs'
import SessionList from '../components/chat/SessionList'
import ChatWindow from '../components/chat/ChatWindow'
import MessageInput from '../components/chat/MessageInput'
import UploadButton from '../components/docs/UploadButton'
import DocumentList from '../components/docs/DocumentList'

export default function ChatPage() {
  const { user, logout } = useAuth()

  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [documents, setDocuments] = useState([])

  const [loadingSessions, setLoadingSessions] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [loadingDocs, setLoadingDocs] = useState(true)

  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')

  useEffect(() => {
    listSessions()
      .then(setSessions)
      .finally(() => setLoadingSessions(false))
    listDocuments()
      .then((res) => setDocuments(res.documents))
      .finally(() => setLoadingDocs(false))
  }, [])

  useEffect(() => {
    if (!activeSessionId) return
    setLoadingMessages(true)
    getMessages(activeSessionId)
      .then(setMessages)
      .finally(() => setLoadingMessages(false))
  }, [activeSessionId])

  const handleNewSession = useCallback(async () => {
    setLoadingSessions(true)
    const session = await createSession()
    setSessions((prev) => [session, ...prev])
    setActiveSessionId(session.id)
    setMessages([])
    setLoadingSessions(false)
  }, [])

  const handleDeleteSession = useCallback(async (id) => {
    await deleteSession(id)
    setSessions((prev) => prev.filter((s) => s.id !== id))
    if (activeSessionId === id) {
      setActiveSessionId(null)
      setMessages([])
    }
  }, [activeSessionId])

  const handleSend = useCallback(async (text) => {
    if (!activeSessionId || isStreaming) return

    const userMsg = { id: Date.now(), role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setIsStreaming(true)
    setStreamingContent('')

    try {
      let collected = ''
      await streamMessage(activeSessionId, text, (chunk) => {
        collected += chunk
        setStreamingContent(collected)
      })
      const assistantMsg = { id: Date.now() + 1, role: 'assistant', content: collected }
      setMessages((prev) => [...prev, assistantMsg])

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId && s.title === 'Nueva conversación'
            ? { ...s, title: text.slice(0, 60) }
            : s
        )
      )
    } finally {
      setIsStreaming(false)
      setStreamingContent('')
    }
  }, [activeSessionId, isStreaming])

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="flex w-72 shrink-0 flex-col bg-slate-900">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-base">🤖</div>
          <span className="font-semibold text-white">Irvinbot</span>
        </div>

        {/* Sessions */}
        <div className="flex-1 overflow-y-auto pb-2">
          <p className="mb-1 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Conversaciones
          </p>
          <SessionList
            sessions={sessions}
            activeId={activeSessionId}
            onSelect={setActiveSessionId}
            onCreate={handleNewSession}
            onDelete={handleDeleteSession}
            loading={loadingSessions}
          />
        </div>

        {/* Documents */}
        <div className="border-t border-slate-800 py-3">
          <p className="mb-1 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Mis documentos
          </p>
          <UploadButton onUploaded={(doc) => setDocuments((prev) => [doc, ...prev])} />
          <div className="mt-1">
            <DocumentList
              documents={documents}
              onDeleted={(id) => setDocuments((prev) => prev.filter((d) => d.id !== id))}
              loading={loadingDocs}
            />
          </div>
        </div>

        {/* User */}
        <div className="flex items-center gap-2 border-t border-slate-800 px-4 py-3">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-700 text-xs text-white">
            {user?.full_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <span className="flex-1 truncate text-xs text-slate-400">{user?.full_name}</span>
          <button
            onClick={logout}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            title="Cerrar sesión"
          >
            ↩
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {!activeSessionId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center px-8">
            <div className="text-5xl">💬</div>
            <div>
              <h2 className="text-xl font-semibold text-slate-700">Selecciona o crea una conversación</h2>
              <p className="mt-1 text-sm text-slate-400">Haz clic en "+ Nueva conversación" en la barra lateral</p>
            </div>
            <button
              onClick={handleNewSession}
              className="mt-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              + Nueva conversación
            </button>
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-3 shadow-sm">
              <h1 className="text-sm font-medium text-slate-700 truncate">
                {sessions.find((s) => s.id === activeSessionId)?.title ?? 'Conversación'}
              </h1>
            </header>

            <ChatWindow
              messages={messages}
              streamingContent={streamingContent}
              isStreaming={isStreaming}
              loading={loadingMessages}
            />

            <MessageInput onSend={handleSend} disabled={isStreaming} />
          </>
        )}
      </main>
    </div>
  )
}

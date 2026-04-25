import client, { streamRequest } from './client'

export const createSession = (title = 'Nueva conversación') =>
  client.post('/chat/sessions', { title })

export const listSessions = () => client.get('/chat/sessions')

export const getMessages = (sessionId) =>
  client.get(`/chat/sessions/${sessionId}/messages`)

export const deleteSession = (sessionId) =>
  client.delete(`/chat/sessions/${sessionId}`)

export const sendMessage = (sessionId, message) =>
  client.post(`/chat/sessions/${sessionId}/message`, { message })

export const streamMessage = (sessionId, message, onChunk) =>
  streamRequest(`/chat/sessions/${sessionId}/stream`, { message }, onChunk)

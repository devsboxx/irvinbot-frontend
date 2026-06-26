import client, { streamRequest } from './client'

// Puente chat -> tesis: extrae el Objeto de Estudio (10 pasos) de la conversación.
export const extractObjeto = (sessionId) =>
  client.post(`/chat/sessions/${sessionId}/objeto-de-estudio`, {})

// Lista de secciones generables (orden definido por el backend).
export const listThesisSections = () => client.get('/thesis/sections')

// Genera una sección con streaming (SSE). body = { objeto_de_estudio, datos, opciones }.
export const streamThesisSection = (key, body, onChunk) =>
  streamRequest(`/thesis/sections/${key}/stream`, body, onChunk)

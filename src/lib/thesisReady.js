// Marcador interno que el bot emite al completar los 9 pasos (ver prompt del chat).
// Sirve para habilitar el botón "Generar tesis" y se oculta en la UI.
export const THESIS_READY_MARKER = '[[TESIS_LISTA]]'

export const hasReadyMarker = (text = '') => text.includes(THESIS_READY_MARKER)

export const stripReadyMarker = (text = '') =>
  text.split(THESIS_READY_MARKER).join('').replace(/\n{3,}/g, '\n\n').trimEnd()

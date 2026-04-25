/**
 * Normalizes FastAPI errors: string detail, Pydantic 422 list, or { code, message }.
 * Attachments: error.status, error.code
 */
export function parseApiError(body, status, statusText) {
  const d = body?.detail
  let message = statusText
  let code = null

  if (typeof d === 'string') {
    message = d
  } else if (Array.isArray(d)) {
    message = d.map((e) => e.msg).join(', ')
    code = 'validation_error'
  } else if (d && typeof d === 'object') {
    message = d.message ?? d.msg ?? message
    code = d.code ?? null
  }

  return Object.assign(new Error(message), { status, code })
}

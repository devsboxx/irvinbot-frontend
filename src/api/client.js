import { parseApiError } from '../lib/apiErrors'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

// AuthContext registers its logout function here so the client can call it on session expiry
let _onLogout = null
export function setLogoutHandler(fn) {
  _onLogout = fn
}

function getTokens() {
  return {
    access: localStorage.getItem('access_token'),
    refresh: localStorage.getItem('refresh_token'),
  }
}

function storeTokens(access, refresh) {
  localStorage.setItem('access_token', access)
  if (refresh) localStorage.setItem('refresh_token', refresh)
}

// Inline refresh — avoids circular import with auth.js
async function tryRefresh() {
  const { refresh } = getTokens()
  if (!refresh) return false
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    })
    if (!res.ok) return false
    const data = await res.json()
    storeTokens(data.access_token, data.refresh_token)
    return true
  } catch {
    return false
  }
}

async function request(path, options = {}, _retry = true) {
  const { access } = getTokens()
  const headers = {
    'Content-Type': 'application/json',
    ...(access ? { Authorization: `Bearer ${access}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  // 401 refresh interceptor — skip for auth endpoints (login/register return 401 as real errors)
  const isAuthEndpoint = path === '/auth/login' || path === '/auth/register'
  if (res.status === 401 && _retry && !isAuthEndpoint) {
    const refreshed = await tryRefresh()
    if (refreshed) return request(path, options, false)
    _onLogout?.()
    throw Object.assign(new Error('Tu sesión expiró. Por favor inicia sesión de nuevo.'), { status: 401 })
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw parseApiError(body, res.status, res.statusText)
  }

  if (res.status === 204) return null
  return res.json()
}

export async function streamRequest(path, body, onChunk) {
  const { access } = getTokens()
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw parseApiError(body, res.status, res.statusText)
  }

  if (!res.body) throw new Error('El navegador no soportó el streaming de la respuesta.')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  // Buffer entre lecturas: un evento SSE puede llegar partido en varios chunks
  // de red. Procesamos solo líneas completas (terminadas en \n).
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let nl
    while ((nl = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, nl).trim()
      buffer = buffer.slice(nl + 1)
      if (!line.startsWith('data:')) continue

      const payload = line.slice(5).trim()
      if (payload === '' || payload === '[DONE]') continue

      let data
      try {
        data = JSON.parse(payload)
      } catch {
        continue // línea no-JSON o incompleta, se ignora
      }
      if (data.chunk) onChunk(data.chunk)
      else if (data.error) throw new Error('El servidor no pudo completar la respuesta.')
    }
  }
}

export default {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
  postForm: (path, formData) =>
    request(path, { method: 'POST', body: formData, headers: {} }),
}

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as loginApi, register as registerApi, refresh as refreshApi, getMe } from '../api/auth'
import { setLogoutHandler } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }, [])

  // Give the HTTP client a reference to logout so it can expire sessions on 401
  useEffect(() => {
    setLogoutHandler(logout)
  }, [logout])

  // Rehydrate session on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { setLoading(false); return }
    getMe()
      .then(me => setUser(me))
      .catch(() => logout())
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function register(email, fullName, password) {
    return await registerApi(email, password, fullName)
  }

  async function login(email, password) {
    const tokens = await loginApi(email, password)
    localStorage.setItem('access_token', tokens.access_token)
    if (tokens.refresh_token) localStorage.setItem('refresh_token', tokens.refresh_token)
    const me = await getMe()
    setUser(me)
    return me
  }

  async function refreshSession() {
    const refresh_token = localStorage.getItem('refresh_token')
    if (!refresh_token) throw new Error('No refresh token')
    const tokens = await refreshApi(refresh_token)
    localStorage.setItem('access_token', tokens.access_token)
    if (tokens.refresh_token) localStorage.setItem('refresh_token', tokens.refresh_token)
    const me = await getMe()
    setUser(me)
    return me
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

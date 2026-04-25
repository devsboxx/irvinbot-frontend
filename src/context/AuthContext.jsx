import { createContext, useContext, useState, useEffect } from 'react'
import { login as loginApi, register as registerApi, getMe } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Rehydrate session on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { setLoading(false); return }
    getMe()
      .then(me => setUser(me))
      .catch(() => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      })
      .finally(() => setLoading(false))
  }, [])

  async function register(email, fullName, password) {
    // Register → auto-login to obtain tokens
    await registerApi(email, password, fullName)
    const tokens = await loginApi(email, password)
    localStorage.setItem('access_token', tokens.access_token)
    if (tokens.refresh_token) localStorage.setItem('refresh_token', tokens.refresh_token)
    const me = await getMe()
    setUser(me)
    return me
  }

  async function login(email, password) {
    const tokens = await loginApi(email, password)
    localStorage.setItem('access_token', tokens.access_token)
    if (tokens.refresh_token) localStorage.setItem('refresh_token', tokens.refresh_token)
    const me = await getMe()
    setUser(me)
    return me
  }

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

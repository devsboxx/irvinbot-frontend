import { createContext, useContext, useState } from 'react'
import { mockGetCurrentUser, mockLogin, mockLogout, mockRegister } from '../lib/mock'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => mockGetCurrentUser())

  function register(email, fullName, password) {
    const me = mockRegister(email, fullName, password)
    setUser(me)
    return me
  }

  function login(email, password) {
    const me = mockLogin(email, password)
    setUser(me)
    return me
  }

  function logout() {
    mockLogout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading: false, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

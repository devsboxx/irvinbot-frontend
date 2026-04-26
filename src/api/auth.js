import client from './client'

export const register = (email, password, full_name) =>
  client.post('/auth/register', { email, password, full_name })

export const login = (email, password) =>
  client.post('/auth/login', { email, password })

export const refresh = (refresh_token) =>
  client.post('/auth/refresh', { refresh_token })

export const verify = (token) =>
  client.post('/auth/verify', { token })

export const getMe = () => client.get('/auth/me')

export const verifyEmail = (email, code) =>
  client.post('/auth/verify-email', { email, code })

export const forgotPassword = (email) =>
  client.post('/auth/forgot-password', { email })

export const resetPassword = (email, code, new_password) =>
  client.post('/auth/reset-password', { email, code, new_password })

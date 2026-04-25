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

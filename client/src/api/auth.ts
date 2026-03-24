/**
 * api/auth.ts — Auth API calls
 *
 * These functions wrap the raw axios calls for the auth endpoints.
 * Keeping API logic here (not in components) makes the code easier to maintain.
 */

import api from './axios'

/** Register a new student account */
export const register = async (name: string, email: string, password: string) => {
  const { data } = await api.post('/auth/register', { name, email, password })
  return data // { accessToken }
}

/** Log in with email and password */
export const login = async (email: string, password: string) => {
  const { data } = await api.post('/auth/login', { email, password })
  return data // { accessToken }
}

/** Log out — clears the httpOnly refresh cookie on the server */
export const logout = async () => {
  await api.post('/auth/logout')
}

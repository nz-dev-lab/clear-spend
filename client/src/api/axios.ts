/**
 * api/axios.ts — Configured Axios instance
 *
 * This is the single HTTP client used for all API calls in the app.
 * It handles two important things automatically:
 *
 *   1. REQUEST interceptor: attaches the access token to every request header
 *      so we don't have to add "Authorization: Bearer ..." manually everywhere
 *
 *   2. RESPONSE interceptor: when the server returns 401 (token expired),
 *      it silently calls /auth/refresh to get a new token, then retries
 *      the original request — the user never sees the token expire
 */

import axios from 'axios'
import { toast } from 'sonner'

// All API requests go through the Vite proxy at /api → NestJS at :3000
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send httpOnly cookies (refresh token) with every request
})

// ─── Request interceptor ──────────────────────────────────────────────────────
// Runs before every request is sent
api.interceptors.request.use((config) => {
  // Read the access token from localStorage and attach it to the Authorization header
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Response interceptor ────────────────────────────────────────────────────
// Runs when a response comes back — including errors
let isRefreshing = false

api.interceptors.response.use(
  // Success: just return the response as-is
  (response) => response,

  // Error: check if it's a 401 (Unauthorized — token expired)
  async (error) => {
    const originalRequest = error.config

    // If 401 and we haven't already tried to refresh (prevents infinite loops)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If a refresh is already in progress, don't trigger another one
      if (isRefreshing) {
        // Redirect to login — the refresh already failed
        window.location.href = '/login'
        return Promise.reject(error)
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Ask the server for a new access token using the httpOnly refresh cookie
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true })

        // Save the new access token
        localStorage.setItem('accessToken', data.accessToken)

        // Update the header on the original failed request and retry it
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        isRefreshing = false
        return api(originalRequest)

      } catch {
        // Refresh failed — token is expired or invalid, force login
        isRefreshing = false
        localStorage.removeItem('accessToken')
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)

export default api

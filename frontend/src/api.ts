import { auth } from './firebase.ts'

// TODO: CONNECT TO RENDER BACKEND INSTEAD OF LOCALHOST
// https://inf124-project.onrender.com/
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://inf124-project.onrender.com'


const getApiUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export const getGoalWebSocketUrl = (token: string, date: string) => {
  const url = new URL(getApiUrl('/users/me/goal/live'), window.location.href)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.searchParams.set('token', token)
  url.searchParams.set('date', date)
  return url.toString()
}

const getHeaders = (headers?: HeadersInit) => new Headers(headers)

export async function apiFetch(path: string, options: RequestInit = {}) {
  return fetch(getApiUrl(path), options)
}

export async function authFetch(path: string, options: RequestInit = {}) {
  const user = auth.currentUser

  if (!user) {
    throw new Error('You must be signed in to use this endpoint.')
  }

  const token = await user.getIdToken()
  const headers = getHeaders(options.headers)

  headers.set('Authorization', `Bearer ${token}`)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return apiFetch(path, {
    ...options,
    headers,
  })
}

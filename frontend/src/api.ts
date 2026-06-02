import { auth } from './firebase.ts'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:3000'

const getApiUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
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

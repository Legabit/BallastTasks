import axios, { type InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to attach JWT access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('access_token')
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

interface QueuedPromise {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

let isRefreshing = false
let failedQueue: QueuedPromise[] = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Response interceptor to automatically handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error)
    }

    // Do not attempt refresh on auth endpoints to prevent loops
    const requestUrl = originalRequest.url || ''
    if (
      requestUrl.includes('/api/auth/login/') ||
      requestUrl.includes('/api/auth/token/refresh/') ||
      requestUrl.includes('/api/auth/register/')
    ) {
      return Promise.reject(error)
    }

    if (originalRequest._retry) {
      return Promise.reject(error)
    }

    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.dispatchEvent(new Event('auth:unauthorized'))
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return apiClient(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const response = await axios.post<{ access: string; refresh?: string }>(
        `${API_BASE_URL}/api/auth/token/refresh/`,
        { refresh: refreshToken }
      )

      const { access, refresh } = response.data
      localStorage.setItem('access_token', access)
      if (refresh) {
        localStorage.setItem('refresh_token', refresh)
      }

      apiClient.defaults.headers.common.Authorization = `Bearer ${access}`
      processQueue(null, access)

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${access}`
      }
      return apiClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.dispatchEvent(new Event('auth:unauthorized'))
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

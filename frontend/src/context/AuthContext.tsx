import { useEffect, useState, useCallback, type ReactNode } from 'react'
import { apiClient } from '../api/client'
import { AuthContext } from './auth-context-base'
import type { User, LoginResponse, RegisterResponse } from '../types/auth'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await apiClient.get<User>('/api/auth/me/')
      setUser(response.data)
    } catch {
      setUser(null)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      fetchCurrentUser()
    } else {
      setIsLoading(false)
    }

    const handleUnauthorized = () => {
      setUser(null)
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [fetchCurrentUser])

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post<LoginResponse>('/api/auth/login/', {
        username,
        password,
      })
      const { access, refresh } = response.data
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)

      // Fetch user profile
      const userRes = await apiClient.get<User>('/api/auth/me/')
      setUser(userRes.data)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      await apiClient.post<RegisterResponse>('/api/auth/register/', {
        username,
        email,
        password,
      })
      // Immediately log in following successful registration
      await login(username, password)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    try {
      if (refreshToken) {
        await apiClient.post('/api/auth/logout/', { refresh: refreshToken })
      }
    } catch {
      // Ignore logout backend errors and clean up local state
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

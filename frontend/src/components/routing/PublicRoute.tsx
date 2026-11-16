import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context'
import { RefreshCw } from 'lucide-react'

export const PublicRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

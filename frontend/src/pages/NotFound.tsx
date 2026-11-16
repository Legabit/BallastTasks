import React from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 text-center font-sans">
      <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-4 shadow-2xs">
        <AlertCircle className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">404</h1>
      <p className="mt-2 text-base font-semibold text-slate-700">Page Not Found</p>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">
        The requested URL was not found on this server.
      </p>

      <div className="mt-6">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  )
}

import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          TaskFlow Management System &bull; Phase 6 Foundation
        </div>
      </footer>
    </div>
  )
}

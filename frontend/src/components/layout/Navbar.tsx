import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Layers, LogOut, Activity, CheckSquare, Menu, X, User as UserIcon } from 'lucide-react'
import { useAuth } from '../../context'
import { NotificationBell } from './NotificationBell'

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { label: 'Tasks', path: '/', icon: CheckSquare },
    { label: 'System Health', path: '/health', icon: Activity },
  ]

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Desktop Nav Links */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-sm group-hover:bg-indigo-700 transition-colors">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex items-center">
                <span className="text-lg font-bold tracking-tight text-slate-900">TaskFlow</span>
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Pro
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map(({ label, path, icon: Icon }) => {
                const isActive = location.pathname === path
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-3">
            <NotificationBell />

            {user && (
              <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/80">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                    {user.username.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 max-w-[120px] truncate">
                    {user.username}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-hidden"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map(({ label, path, icon: Icon }) => {
            const isActive = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            )
          })}

          {user && (
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserIcon className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-700">{user.username}</span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  logout()
                }}
                className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center space-x-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

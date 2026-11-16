import React, { useState, useEffect, useRef } from 'react'
import { Bell, CheckCheck, Clock, CheckCircle } from 'lucide-react'
import { apiClient } from '../../api/client'
import type { Notification, PaginatedResponse } from '../../types/notification'

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get<PaginatedResponse<Notification>>('/api/notifications/?unread=true')
      setNotifications(res.data.results || [])
    } catch {
      // Ignore background notification fetch errors
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAllAsRead = async () => {
    try {
      await apiClient.post('/api/notifications/mark-all-read/')
      setNotifications([])
    } catch {
      // Ignore
    }
  }

  const markAsRead = async (id: number) => {
    try {
      await apiClient.post(`/api/notifications/${id}/mark-read/`)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch {
      // Ignore
    }
  }

  const unreadCount = notifications.length

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors focus:outline-hidden"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-xl ring-1 ring-black/5 z-50 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
          <div className="p-3 flex items-center justify-between bg-slate-50 rounded-t-xl">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs px-2 py-0.5 font-medium bg-indigo-100 text-indigo-700 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center flex flex-col items-center justify-center space-y-2 text-slate-400">
                <CheckCircle className="w-8 h-8 text-slate-300" />
                <p className="text-xs">All caught up! No unread notifications.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className="p-3 hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between space-x-2">
                    <p className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600">
                      {n.title}
                    </p>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                      {n.notification_type === 'ASSIGNMENT' ? 'Assign' : 'Reminder'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                  <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-2">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

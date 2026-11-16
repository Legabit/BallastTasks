import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckSquare, Clock, AlertTriangle, CheckCircle, ArrowRight, Activity } from 'lucide-react'
import { useAuth } from '../context'
import { apiClient } from '../api/client'
import type { Task } from '../types/task'
import type { PaginatedResponse } from '../types/notification'

export const DashboardPlaceholder: React.FC = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await apiClient.get<PaginatedResponse<Task>>('/api/tasks/')
        setTasks(res.data.results || [])
      } catch {
        // Handled silently
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  const todoCount = tasks.filter((t) => t.status === 'TODO' || t.status === 'BACKLOG').length
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW').length
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length
  const urgentCount = tasks.filter((t) => t.priority === 'URGENT' || t.priority === 'HIGH').length

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Session Authenticated</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.username}!
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-2xl">
              Frontend foundation, token rotation, and routing are operational.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Link
              to="/health"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <Activity className="w-4 h-4" />
              <span>System Health</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">To Do / Backlog</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? '...' : todoCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? '...' : inProgressCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-red-50 text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">High / Urgent</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? '...' : urgentCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? '...' : completedCount}</p>
          </div>
        </div>
      </div>

      {/* Roadmap Phase 7 Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              Next Phase: Phase 7
            </span>
            <h2 className="text-xl sm:text-2xl font-bold">Interactive Task Management UI</h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Full Task Kanban & List views, status toggles, priority badges, creation & editing modals,
              assignee selectors, and real-time filtering will be activated in Phase 7.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-white/10 text-white border border-white/20">
              <span>Ready for Phase 7</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Live Tasks Preview List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Your Active Tasks Preview</h3>
            <p className="text-xs text-slate-500">Live data loaded from backend `/api/tasks/`</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">{tasks.length} tasks registered</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading tasks from API...</div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center space-y-3">
            <CheckSquare className="w-10 h-10 text-slate-300" />
            <p className="text-sm font-medium">No tasks found in your scope.</p>
            <p className="text-xs text-slate-500">Create tasks in Phase 7 UI or via API.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <div key={task.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-slate-900">{task.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      task.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      task.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {task.status}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      task.priority === 'URGENT' ? 'bg-red-50 text-red-700 border border-red-200' :
                      task.priority === 'HIGH' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-xs text-slate-500 line-clamp-1">{task.description}</p>
                  )}
                </div>

                <div className="text-right text-xs text-slate-400 shrink-0 ml-4">
                  <span>Assignee: </span>
                  <span className="font-semibold text-slate-700">
                    {task.assignee ? task.assignee.username : 'Unassigned'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

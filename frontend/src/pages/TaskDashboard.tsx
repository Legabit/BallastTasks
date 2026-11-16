import React, { useEffect, useState, useCallback } from 'react'
import { TaskFilterBar } from '../components/tasks/TaskFilterBar'
import { TaskKanban } from '../components/tasks/TaskKanban'
import { TaskList } from '../components/tasks/TaskList'
import { TaskModal } from '../components/tasks/TaskModal'
import { DeleteTaskModal } from '../components/tasks/DeleteTaskModal'
import { fetchTasks, updateTask, deleteTask, fetchUsers, type TaskFilterParams } from '../api/tasks'
import type { Task, TaskStatus } from '../types/task'
import type { User } from '../types/auth'
import { RefreshCw, AlertCircle } from 'lucide-react'

export const TaskDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')
  const [filters, setFilters] = useState<TaskFilterParams>({})

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [tasksRes, usersRes] = await Promise.all([
        fetchTasks(filters),
        fetchUsers().catch(() => []),
      ])
      setTasks(tasksRes.results || [])
      setUsers(usersRes)
    } catch {
      setError('Failed to fetch tasks from server.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadData()
  }, [loadData])

  // One-click completion toggle (optimistic)
  const handleToggleComplete = async (task: Task) => {
    const isCompleted = task.status === 'COMPLETED'
    const nextStatus: TaskStatus = isCompleted ? 'TODO' : 'COMPLETED'

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    )

    try {
      await updateTask(task.id, { status: nextStatus })
    } catch {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      )
      setError(`Failed to update status for "${task.title}".`)
    }
  }

  // Quick status transition
  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    if (task.status === newStatus) return

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    )

    try {
      await updateTask(task.id, { status: newStatus })
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      )
      setError(`Failed to change status for "${task.title}".`)
    }
  }

  // Modal trigger handlers
  const handleNewTask = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleDeletePrompt = (task: Task) => {
    setDeletingTask(task)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingTask) return
    setDeleteLoading(true)
    try {
      await deleteTask(deletingTask.id)
      setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id))
      setDeleteModalOpen(false)
      setDeletingTask(null)
    } catch {
      setError(`Failed to delete "${deletingTask.title}".`)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleSaveTask = (savedTask: Task) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === savedTask.id)
      if (exists) {
        return prev.map((t) => (t.id === savedTask.id ? savedTask : t))
      }
      return [savedTask, ...prev]
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner / Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start space-x-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Control Bar */}
      <TaskFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={() => setFilters({})}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNewTask={handleNewTask}
      />

      {/* Content Area */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs font-semibold">Loading tasks...</p>
        </div>
      ) : viewMode === 'kanban' ? (
        <TaskKanban
          tasks={tasks}
          onToggleComplete={handleToggleComplete}
          onEdit={handleEditTask}
          onDelete={handleDeletePrompt}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <TaskList
          tasks={tasks}
          onToggleComplete={handleToggleComplete}
          onEdit={handleEditTask}
          onDelete={handleDeletePrompt}
        />
      )}

      {/* Modals */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
        onSave={handleSaveTask}
        users={users}
      />

      <DeleteTaskModal
        isOpen={deleteModalOpen}
        taskTitle={deletingTask?.title || ''}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeletingTask(null)
        }}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  )
}

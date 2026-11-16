import React from 'react'
import { TaskCard } from './TaskCard'
import type { Task, TaskStatus } from '../../types/task'

interface TaskKanbanProps {
  tasks: Task[]
  onToggleComplete: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onStatusChange: (task: Task, newStatus: TaskStatus) => void
}

interface ColumnConfig {
  status: TaskStatus
  label: string
  colorBadge: string
  dotColor: string
}

const COLUMNS: ColumnConfig[] = [
  { status: 'BACKLOG', label: 'Backlog', colorBadge: 'bg-slate-100 text-slate-700', dotColor: 'bg-slate-400' },
  { status: 'TODO', label: 'To Do', colorBadge: 'bg-blue-50 text-blue-700', dotColor: 'bg-blue-500' },
  { status: 'IN_PROGRESS', label: 'In Progress', colorBadge: 'bg-amber-50 text-amber-700', dotColor: 'bg-amber-500' },
  { status: 'IN_REVIEW', label: 'In Review', colorBadge: 'bg-purple-50 text-purple-700', dotColor: 'bg-purple-500' },
  { status: 'COMPLETED', label: 'Completed', colorBadge: 'bg-emerald-50 text-emerald-700', dotColor: 'bg-emerald-500' },
]

export const TaskKanban: React.FC<TaskKanbanProps> = ({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status)

        return (
          <div
            key={col.status}
            className="bg-slate-100/70 rounded-2xl border border-slate-200/80 p-3 flex flex-col min-h-[450px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-200/60 mb-3">
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                <h3 className="font-bold text-xs text-slate-800 tracking-tight">{col.label}</h3>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.colorBadge}`}>
                {columnTasks.length}
              </span>
            </div>

            {/* Task Cards Column Body */}
            <div className="space-y-3 flex-1">
              {columnTasks.length === 0 ? (
                <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                  No tasks
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

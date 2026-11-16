import React, { useMemo } from 'react'
import { Calendar, Trash2, Edit3, ArrowRightCircle } from 'lucide-react'
import type { Task, TaskStatus } from '../../types/task'
import { useAuth } from '../../context'

interface TaskCardProps {
  task: Task
  onToggleComplete: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onStatusChange: (task: Task, newStatus: TaskStatus) => void
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const { user } = useAuth()
  const currentTime = useMemo(() => Date.now(), [])
  const isCompleted = task.status === 'COMPLETED'
  const isCreator = user && task.creator && user.id === task.creator.id

  const isOverdue =
    task.due_date &&
    !isCompleted &&
    new Date(task.due_date).getTime() < currentTime

  const priorityStyles = {
    LOW: 'bg-slate-100 text-slate-700 border-slate-200',
    MEDIUM: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    HIGH: 'bg-amber-50 text-amber-700 border-amber-200',
    URGENT: 'bg-red-50 text-red-700 border-red-200 animate-pulse',
  }[task.priority]

  const statusChoices: TaskStatus[] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED']

  return (
    <div className={`group bg-white rounded-xl border p-4 shadow-2xs hover:shadow-xs transition-all space-y-3 ${
      isCompleted ? 'border-emerald-200/80 bg-emerald-50/20' : 'border-slate-200'
    }`}>
      {/* Top Header: Checkbox, Title, Priority */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start space-x-2.5 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={() => onToggleComplete(task)}
            className="mt-0.5 h-4 w-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            aria-label={`Mark task ${task.title} as ${isCompleted ? 'incomplete' : 'completed'}`}
          />
          <h4
            className={`text-xs font-bold leading-snug break-words ${
              isCompleted ? 'line-through text-slate-400' : 'text-slate-900 group-hover:text-indigo-600'
            }`}
          >
            {task.title}
          </h4>
        </div>

        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border shrink-0 ${priorityStyles}`}>
          {task.priority}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Due Date & Assignee */}
      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 text-slate-500">
        {task.due_date ? (
          <div className={`flex items-center space-x-1 font-medium ${
            isOverdue ? 'text-red-600 font-bold' : ''
          }`}>
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(task.due_date).toLocaleDateString()}</span>
          </div>
        ) : (
          <span className="text-slate-400">No deadline</span>
        )}

        <div className="flex items-center space-x-1.5 font-medium text-slate-700">
          {task.assignee ? (
            <div className="flex items-center space-x-1">
              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] flex items-center justify-center font-bold">
                {task.assignee.username.charAt(0).toUpperCase()}
              </span>
              <span className="max-w-[80px] truncate">{task.assignee.username}</span>
            </div>
          ) : (
            <span className="text-slate-400 italic">Unassigned</span>
          )}
        </div>
      </div>

      {/* Quick Move Status & Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center space-x-1 text-slate-400">
          <ArrowRightCircle className="w-3.5 h-3.5" />
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task, e.target.value as TaskStatus)}
            className="text-[11px] font-medium bg-transparent border-none text-slate-600 hover:text-slate-900 focus:outline-hidden cursor-pointer"
          >
            {statusChoices.map((st) => (
              <option key={st} value={st}>
                {st.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
            title="Edit Task"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {isCreator && (
            <button
              onClick={() => onDelete(task)}
              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

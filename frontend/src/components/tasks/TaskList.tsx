import React, { useMemo } from 'react'
import { Calendar, Trash2, Edit3, User as UserIcon } from 'lucide-react'
import type { Task } from '../../types/task'
import { useAuth } from '../../context'

interface TaskListProps {
  tasks: Task[]
  onToggleComplete: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth()
  const currentTime = useMemo(() => Date.now(), [])

  const priorityBadge = (priority: Task['priority']) => {
    const styles = {
      LOW: 'bg-slate-100 text-slate-700 border-slate-200',
      MEDIUM: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      HIGH: 'bg-amber-50 text-amber-700 border-amber-200',
      URGENT: 'bg-red-50 text-red-700 border-red-200 animate-pulse',
    }[priority]
    return (
      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${styles}`}>
        {priority}
      </span>
    )
  }

  const statusBadge = (status: Task['status']) => {
    const styles = {
      BACKLOG: 'bg-slate-100 text-slate-700 border-slate-200',
      TODO: 'bg-blue-50 text-blue-700 border-blue-200',
      IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
      IN_REVIEW: 'bg-purple-50 text-purple-700 border-purple-200',
      COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    }[status]
    return (
      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${styles}`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
        <p className="text-sm font-medium">No tasks found matching current filters.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th scope="col" className="w-12 px-4 py-3 text-center">Done</th>
              <th scope="col" className="px-4 py-3">Task</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3">Priority</th>
              <th scope="col" className="px-4 py-3">Due Date</th>
              <th scope="col" className="px-4 py-3">Assignee</th>
              <th scope="col" className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {tasks.map((task) => {
              const isCompleted = task.status === 'COMPLETED'
              const isCreator = user && task.creator && user.id === task.creator.id
              const isOverdue =
                task.due_date &&
                !isCompleted &&
                new Date(task.due_date).getTime() < currentTime

              return (
                <tr
                  key={task.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isCompleted ? 'bg-emerald-50/10' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => onToggleComplete(task)}
                      className="h-4 w-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      aria-label={`Mark task ${task.title} as ${isCompleted ? 'incomplete' : 'completed'}`}
                    />
                  </td>

                  <td className="px-4 py-3">
                    <div className="max-w-md">
                      <p
                        className={`font-semibold text-slate-900 ${
                          isCompleted ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {statusBadge(task.status)}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {priorityBadge(task.priority)}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {task.due_date ? (
                      <div className={`flex items-center space-x-1 ${
                        isOverdue ? 'text-red-600 font-bold' : 'text-slate-500'
                      }`}>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(task.due_date).toLocaleDateString()}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">None</span>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {task.assignee ? (
                      <div className="flex items-center space-x-1.5 font-medium text-slate-800">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                          {task.assignee.username.charAt(0).toUpperCase()}
                        </span>
                        <span>{task.assignee.username}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-slate-400">
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>Unassigned</span>
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="inline-flex items-center space-x-1">
                      <button
                        onClick={() => onEdit(task)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Task"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {isCreator && (
                        <button
                          onClick={() => onDelete(task)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

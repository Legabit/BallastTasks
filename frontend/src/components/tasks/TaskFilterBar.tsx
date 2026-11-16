import React from 'react'
import { Search, RotateCcw, Plus, Kanban, Table, User, UserCheck } from 'lucide-react'
import type { TaskFilterParams } from '../../api/tasks'

interface TaskFilterBarProps {
  filters: TaskFilterParams
  onFilterChange: (newFilters: TaskFilterParams) => void
  onResetFilters: () => void
  viewMode: 'kanban' | 'table'
  onViewModeChange: (mode: 'kanban' | 'table') => void
  onNewTask: () => void
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  viewMode,
  onViewModeChange,
  onNewTask,
}) => {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value })
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, status: e.target.value === 'ALL' ? undefined : e.target.value })
  }

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, priority: e.target.value === 'ALL' ? undefined : e.target.value })
  }

  const toggleAssignedToMe = () => {
    onFilterChange({
      ...filters,
      assigned_to_me: filters.assigned_to_me ? undefined : true,
    })
  }

  const toggleCreatedByMe = () => {
    onFilterChange({
      ...filters,
      created_by_me: filters.created_by_me ? undefined : true,
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
      {/* Top Row: Search, View Mode, New Task Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={filters.search || ''}
            onChange={handleTextChange}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-slate-50/50"
          />
        </div>

        {/* View Switcher & Action */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onViewModeChange('kanban')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Kanban Board View"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Data Table View"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <button
            onClick={onNewTask}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Status, Priority, Quick Filters, Reset */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
        {/* Status Dropdown */}
        <select
          value={filters.status || 'ALL'}
          onChange={handleStatusChange}
          className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
        >
          <option value="ALL">All Statuses</option>
          <option value="BACKLOG">Backlog</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="COMPLETED">Completed</option>
        </select>

        {/* Priority Dropdown */}
        <select
          value={filters.priority || 'ALL'}
          onChange={handlePriorityChange}
          className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
        >
          <option value="ALL">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>

        {/* Quick Scope Filters */}
        <button
          onClick={toggleAssignedToMe}
          className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium border transition-colors cursor-pointer ${
            filters.assigned_to_me
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Assigned to me</span>
        </button>

        <button
          onClick={toggleCreatedByMe}
          className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium border transition-colors cursor-pointer ${
            filters.created_by_me
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Created by me</span>
        </button>

        {/* Reset Filter Button */}
        <button
          onClick={onResetFilters}
          className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors ml-auto cursor-pointer"
          title="Reset all filters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  )
}

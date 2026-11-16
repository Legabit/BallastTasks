import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface DeleteTaskModalProps {
  isOpen: boolean
  taskTitle: string
  onClose: () => void
  onConfirm: () => Promise<void>
  loading?: boolean
}

export const DeleteTaskModal: React.FC<DeleteTaskModalProps> = ({
  isOpen,
  taskTitle,
  onClose,
  onConfirm,
  loading = false,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-xl shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900">Delete Task</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-slate-800">"{taskTitle}"</span>?
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>Delete Task</span>
          </button>
        </div>
      </div>
    </div>
  )
}

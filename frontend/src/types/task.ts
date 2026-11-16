import type { User } from './auth'

export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  creator: User
  assignee: User | null
  created_at: string
  updated_at: string
}

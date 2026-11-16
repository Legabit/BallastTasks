import { apiClient } from './client'
import type { Task, TaskPriority, TaskStatus } from '../types/task'
import type { User } from '../types/auth'
import type { PaginatedResponse } from '../types/notification'

export interface TaskFilterParams {
  status?: string
  priority?: string
  due_date_after?: string
  due_date_before?: string
  assigned_to_me?: boolean | string
  created_by_me?: boolean | string
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export interface TaskPayload {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  due_date?: string | null
  assignee?: number | null
}

export const fetchTasks = async (params?: TaskFilterParams): Promise<PaginatedResponse<Task>> => {
  const cleanParams: Record<string, string | number | boolean> = {}
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'ALL') {
        cleanParams[key] = value
      }
    })
  }
  const response = await apiClient.get<PaginatedResponse<Task>>('/api/tasks/', {
    params: cleanParams,
  })
  return response.data
}

export const fetchTask = async (id: number): Promise<Task> => {
  const response = await apiClient.get<Task>(`/api/tasks/${id}/`)
  return response.data
}

export const createTask = async (payload: TaskPayload): Promise<Task> => {
  const response = await apiClient.post<Task>('/api/tasks/', payload)
  return response.data
}

export const updateTask = async (id: number, payload: Partial<TaskPayload>): Promise<Task> => {
  const response = await apiClient.patch<Task>(`/api/tasks/${id}/`, payload)
  return response.data
}

export const deleteTask = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/tasks/${id}/`)
}

export const fetchUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/api/auth/users/')
  return response.data
}

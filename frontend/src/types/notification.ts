export type NotificationType = 'ASSIGNMENT' | 'DUE_DATE_REMINDER'

export interface Notification {
  id: number
  recipient: number
  task: number | null
  task_title?: string
  notification_type: NotificationType
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

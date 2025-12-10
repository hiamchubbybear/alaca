import { request } from '../../../shared/api/apiClient'

export type Notification = {
  id: string
  title: string
  body: string
  type: string
  data?: string
  isRead: boolean
  createdAt: string
  readAt?: string
  targetUserId?: string
}

export async function getMyNotifications() {
  return request<never, Notification[]>('/notifications/me', {
    method: 'GET',
    auth: true
  })
}

export async function markAsRead(id: string) {
  return request<never, boolean>(`/notifications/${id}/read`, {
    method: 'PUT',
    auth: true
  })
}

export async function markAllAsRead() {
  return request<never, boolean>('/notifications/read-all', {
    method: 'PUT',
    auth: true
  })
}

export async function getUnreadCount() {
  return request<never, number>('/notifications/unread-count', {
    method: 'GET',
    auth: true
  })
}

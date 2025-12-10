import { request } from '../../shared/api/apiClient'

export async function getAllUsers(page = 1, pageSize = 20) {
  return request<never, { users: any[]; total: number }>(`/account/admin/users?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
    auth: true
  })
}

export async function deleteUser(userId: string) {
  return request<never, boolean>(`/account/admin/users/${userId}`, { method: 'DELETE', auth: true })
}

export async function banUser(userId: string) {
  return request<never, boolean>(`/account/admin/users/${userId}/ban`, { method: 'PUT', auth: true })
}

export async function unbanUser(userId: string) {
  return request<never, boolean>(`/account/admin/users/${userId}/unban`, {
    method: 'PUT',
    auth: true
  })
}

export async function getPlatformStats() {
  return request<never, any>('/account/admin/stats', { method: 'GET', auth: true })
}

export async function getNotificationHistory(page = 1, pageSize = 20) {
  return request<never, { notifications: any[]; total: number }>(
    `/account/admin/notifications?page=${page}&pageSize=${pageSize}`,
    {
      method: 'GET',
      auth: true
    }
  )
}

export async function sendSystemNotification(data: { title: string; message: string; type: string; userId?: string }) {
  return request<{ title: string; body: string; type: string; userId?: string }, boolean>(
    '/account/admin/notifications',
    {
      method: 'POST',
      body: {
        title: data.title,
        body: data.message, // Map message -> body
        type: data.type,
        userId: data.userId
      },
      auth: true
    }
  )
}

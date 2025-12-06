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

import { request } from '../../shared/api/apiClient'

// Get all posts for admin (with pagination)
export const getAllPosts = async (page: number, pageSize: number) => {
  return request<never, any>(`/post/admin/all?pageNumber=${page}&pageSize=${pageSize}`, {
    method: 'GET',
    auth: true
  })
}

// Delete post (admin only)
export const deletePost = async (postId: string) => {
  return request<never, boolean>(`/post/admin/${postId}`, {
    method: 'DELETE',
    auth: true
  })
}

// Hide post (admin only)
export const hidePost = async (postId: string) => {
  return request<never, boolean>(`/post/admin/${postId}/hide`, {
    method: 'PUT',
    auth: true
  })
}

// Show post (admin only)
export const showPost = async (postId: string) => {
  return request<never, boolean>(`/post/admin/${postId}/show`, {
    method: 'PUT',
    auth: true
  })
}

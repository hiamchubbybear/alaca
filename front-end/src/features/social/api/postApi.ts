import { request } from '../../../shared/api/apiClient'
import type {
  Post,
  CreatePostRequest,
  CreatePostResponse,
  PaginatedPosts,
  Comment,
  CreateCommentRequest
} from '../types/post.types'

// Re-export types for backward compatibility
export type { Post, CreatePostRequest, CreatePostResponse, PaginatedPosts, Comment, CreateCommentRequest }

export async function getAllPosts(pageNumber: number = 1, pageSize: number = 10) {
  return request<never, PaginatedPosts>(
    `/post/all?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    {
      method: 'GET',
      auth: true
    }
  )
}

export async function getAllPostsByLike(pageNumber: number = 1, pageSize: number = 10) {
  return request<never, PaginatedPosts>(
    `/post/all-by-like?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    {
      method: 'GET',
      auth: true
    }
  )
}

export async function createPost(data: CreatePostRequest) {
  return request<CreatePostRequest, CreatePostResponse>(
    '/post',
    {
      method: 'POST',
      body: data,
      auth: true
    }
  )
}

export async function deletePost(postId: string) {
  return request<never, boolean>(
    `/post/${postId}`,
    {
      method: 'DELETE',
      auth: true
    }
  )
}


export async function likePost(postId: string) {
  return request<never, { liked: boolean; likeCount: number }>(
    `/post/${postId}/like`,
    {
      method: 'POST',
      auth: true
    }
  )
}

export async function createComment(postId: string, data: CreateCommentRequest) {
  return request<CreateCommentRequest, Comment>(
    `/post/${postId}/comment`,
    {
      method: 'POST',
      body: data,
      auth: true
    }
  )
}

export async function getComments(postId: string) {
  return request<never, Comment[]>(
    `/post/${postId}/comments`,
    {
      method: 'GET',
      auth: true
    }
  )
}


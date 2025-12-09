import { request } from '../../shared/api/apiClient'
import type { Exercise } from '../../shared/api/exerciseApi'

// Re-export type or define new interface if needed
export type { Exercise }

export const getAllExercises = async (page: number, pageSize: number, muscle?: string, difficulty?: string) => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  })
  if (muscle) params.append('muscle', muscle)
  if (difficulty) params.append('difficulty', difficulty)

  return request<never, { exercises: Exercise[]; total: number }>(`/exercises?${params.toString()}`, {
    method: 'GET',
    auth: true
  })
}

export const getExerciseById = async (id: string) => {
  return request<never, Exercise>(`/exercises/${id}`, {
    method: 'GET',
    auth: true
  })
}

export const createExercise = async (data: Omit<Exercise, 'id'>) => {
  return request<Omit<Exercise, 'id'>, Exercise>('/exercises', {
    method: 'POST',
    auth: true,
    body: data
  })
}

export const updateExercise = async (id: string, data: Partial<Exercise>) => {
  return request<Partial<Exercise>, Exercise>(`/exercises/${id}`, {
    method: 'PUT',
    auth: true,
    body: data
  })
}

export const deleteExercise = async (id: string) => {
  return request<never, boolean>(`/exercises/${id}`, {
    method: 'DELETE',
    auth: true
  })
}

export const searchExercises = async (query: string, page: number, pageSize: number) => {
  const params = new URLSearchParams({
    query,
    page: page.toString(),
    pageSize: pageSize.toString()
  })
  return request<never, { exercises: Exercise[]; total: number }>(`/exercises/search?${params.toString()}`, {
    method: 'GET',
    auth: true
  })
}

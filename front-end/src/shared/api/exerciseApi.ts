import { request, type ApiResponse } from './apiClient'

export type Exercise = {
  id?: string
  title?: string
  description?: string
  primaryMuscle?: string
  secondaryMuscles?: string
  equipment?: string
  difficulty?: string
  videoUrl?: string
  images?: string
  tags?: string[] | string
}

export type ExerciseListResponse = {
  exercises: Exercise[]
  total: number
  page: number
  pageSize: number
}

export async function getExercises(
  params: { page?: number; pageSize?: number; muscleGroup?: string } = {}
): Promise<ApiResponse<ExerciseListResponse>> {
  const query = new URLSearchParams()
  if (params.page) query.append('page', String(params.page))
  if (params.pageSize) query.append('pageSize', String(params.pageSize))
  if (params.muscleGroup) query.append('muscleGroup', params.muscleGroup)

  const qs = query.toString()
  const path = `/exercises${qs ? `?${qs}` : ''}`

  return request<undefined, ExerciseListResponse>(path, {
    method: 'GET',
    auth: true
  })
}


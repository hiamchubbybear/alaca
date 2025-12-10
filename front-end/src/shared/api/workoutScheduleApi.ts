import { request, type ApiResponse } from './apiClient'

export interface ExerciseRequest {
  exerciseId: string
  sets: number
  reps: number
  restSeconds: number
  notes?: string
}

export interface DailyPlanRequest {
  sessionNumber: number
  sessionName?: string
  scheduledDate?: string
  exercises: ExerciseRequest[]
}

export interface CreateScheduleRequest {
  weekNumber: number
  dailyPlans: DailyPlanRequest[]
}

export interface ExerciseResponse {
  id: string
  exerciseId: string
  exerciseTitle: string
  sets: number
  reps: number
  restSeconds: number
  notes: string
}

export interface DailyPlan {
  scheduleId?: string
  weekNumber?: number
  sessionNumber: number
  sessionName: string
  scheduledDate?: string
  exercises: ExerciseResponse[]
}

export interface WeeklyPlan {
  dailyPlans: DailyPlan[]
}

export async function saveSchedule(payload: CreateScheduleRequest): Promise<ApiResponse<WeeklyPlan>> {
  return request<CreateScheduleRequest, WeeklyPlan>('/workout-schedules/custom-week', {
    method: 'POST',
    body: payload,
    auth: true
  })
}

export async function getLatestSchedule(): Promise<ApiResponse<WeeklyPlan>> {
  return request<undefined, WeeklyPlan>('/workout-schedules/me', {
    method: 'GET',
    auth: true
  })
}

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
  scheduledTime?: string
  status?: string
  exercises: ExerciseResponse[]
  totalDurationMin?: number
  estimatedCaloriesBurned?: number
}

// Backend returns array directly, not wrapped in object
export type WeeklyPlan = DailyPlan[]

export async function saveSchedule(payload: CreateScheduleRequest): Promise<ApiResponse<WeeklyPlan>> {
  console.log('[API] saveSchedule payload:', JSON.stringify(payload, null, 2))
  try {
    const response = await request<CreateScheduleRequest, WeeklyPlan>('/workout-schedules/custom-week', {
      method: 'POST',
      body: payload,
      auth: true
    })
    console.log('[API] saveSchedule response:', response)
    return response
  } catch (error) {
    console.error('[API] saveSchedule error:', error)
    throw error
  }
}

export async function getLatestSchedule(): Promise<ApiResponse<WeeklyPlan>> {
  console.log('[API] getLatestSchedule called')
  try {
    const response = await request<undefined, WeeklyPlan>('/workout-schedules/me', {
      method: 'GET',
      auth: true
    })
    console.log('[API] getLatestSchedule response:', response)
    return response
  } catch (error) {
    console.error('[API] getLatestSchedule error:', error)
    throw error
  }
}

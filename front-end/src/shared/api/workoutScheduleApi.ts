import { API_BASE_URL } from './apiClient'

export interface CreateScheduleRequest {
  weekNumber: number
  sessions: SessionRequest[]
}

export interface SessionRequest {
  sessionNumber: number
  sessionName?: string
  scheduledDate?: string
  exercises: ExerciseRequest[]
}

export interface ExerciseRequest {
  exerciseId: string
  sets: number
  reps: number
  restSeconds: number
  notes?: string
}

export interface ScheduleResponse {
  scheduleId: string
  weekNumber: number
  sessionNumber: number
  sessionName: string
  scheduledDate: string
  exercises: {
    id: string
    exerciseId: string
    exerciseTitle: string
    sets: number
    reps: number
    restSeconds: number
    notes: string
  }[]
}

export async function createCustomWeeklySchedule(data: CreateScheduleRequest) {
  const response = await fetch(`${API_BASE_URL}/workout-schedules/custom-week`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`
    },
    body: JSON.stringify(data)
  })
  return response.json()
}

export async function getMySchedule() {
  const response = await fetch(`${API_BASE_URL}/workout-schedules/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`
    }
  })
  return response.json()
}

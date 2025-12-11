import { request, type ApiResponse } from '../../../shared/api/apiClient'

// Types
export interface WorkoutExercise {
  workoutExerciseId: string
  exerciseId: string
  exerciseName: string
  sets: number
  reps: number
  restTime: number
  videoUrl?: string
  instructions?: string
  orderIndex: number
}

export interface WorkoutSchedule {
  workoutScheduleId: string
  workoutId: string
  workoutName: string
  scheduledDate: string
  isCompleted: boolean
  completedAt?: string
  exercises: WorkoutExercise[]
}

export interface CompleteWorkoutRequest {
  workoutScheduleId: string
  completedAt: string
  notes?: string
}

// API Functions

/**
 * Get today's workout schedule
 */
export async function getTodayWorkout(): Promise<ApiResponse<WorkoutSchedule>> {
  return request('/workouts/today', {
    method: 'GET',
    auth: true
  })
}

/**
 * Get latest workout schedule (for workout player)
 */
export async function getLatestWorkout(): Promise<ApiResponse<WorkoutSchedule>> {
  return request('/workouts/latest', {
    method: 'GET',
    auth: true
  })
}

/**
 * Get workout schedule by ID
 */
export async function getWorkoutSchedule(scheduleId: string): Promise<ApiResponse<WorkoutSchedule>> {
  return request(`/workouts/schedules/${scheduleId}`, {
    method: 'GET',
    auth: true
  })
}

/**
 * Mark workout as completed
 */
export async function completeWorkout(data: CompleteWorkoutRequest): Promise<ApiResponse<void>> {
  return request('/workouts/complete', {
    method: 'POST',
    body: JSON.stringify(data),
    auth: true
  })
}

/**
 * Get user's workout history
 */
export async function getWorkoutHistory(
  page: number = 1,
  pageSize: number = 10
): Promise<ApiResponse<WorkoutSchedule[]>> {
  return request(`/workouts/history?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
    auth: true
  })
}

/**
 * Get workout completion stats
 */
export interface WorkoutStats {
  totalWorkouts: number
  completedWorkouts: number
  currentStreak: number
  longestStreak: number
  completionRate: number
}

export async function getWorkoutStats(): Promise<ApiResponse<WorkoutStats>> {
  return request('/workouts/stats', {
    method: 'GET',
    auth: true
  })
}

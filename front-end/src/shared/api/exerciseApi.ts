import { API_BASE_URL } from './apiClient'

export interface Exercise {
  id: string
  title: string
  description: string
  primaryMuscle: string
  secondaryMuscles: string[]
  equipment: string
  difficulty: string
  instructions: string
  tags: string[]
  caloriesBurnedPerSet: number
  recommendedSets: number
  recommendedReps: number
  restSeconds: number
  videoUrl: string | null
  images: string[] | null
}

export interface ExerciseRecommendation {
  exercises: Exercise[]
  muscle: string
  goal: string
  userInfo: {
    bmi: number
    difficulty: string
    practiceLevel: string
  }
}

export interface WorkoutRecommendation {
  plan: {
    [day: string]: {
      name: string
      exercises: Exercise[]
    }
  }
  userInfo: {
    bmi: number
    goal: string
    practiceLevel: string
    recommendedDays: number
  }
}

// Get exercise recommendations (auto from BMI)
export async function getExerciseRecommendations(muscle?: string, goal?: string) {
  const params = new URLSearchParams()
  if (muscle) params.append('muscle', muscle)
  if (goal) params.append('goal', goal)

  const url = `/recommendations/exercises${params.toString() ? `?${params.toString()}` : ''}`
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`
    }
  })
  return response.json()
}

// Get workout plan recommendations (auto from BMI)
export async function getWorkoutRecommendations(goal?: string, days?: number) {
  const params = new URLSearchParams()
  if (goal) params.append('goal', goal)
  if (days) params.append('days', days.toString())

  const url = `/recommendations/workouts${params.toString() ? `?${params.toString()}` : ''}`
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`
    }
  })
  return response.json()
}

// Get all exercises from library
export async function getExercises(page: number = 1, pageSize: number = 50, muscle?: string, difficulty?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  })
  if (muscle) params.append('muscle', muscle)
  if (difficulty) params.append('difficulty', difficulty)

  const response = await fetch(`${API_BASE_URL}/exercises?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`
    }
  })
  return response.json()
}

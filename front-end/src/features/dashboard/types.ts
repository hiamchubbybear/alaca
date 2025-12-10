import type { PracticeLevel } from '../../shared/api/bmiApi'

export type MainSection =
  | 'training'
  | 'nutrition'
  | 'progress'
  | 'challenge'
  | 'social'
  | 'health'
  | 'profile'
  | 'notification'

export type NavSection = Exclude<MainSection, 'profile' | 'notification'>

export interface HealthMetrics {
  weightKg: number
  heightM: number
  activityFactor: number
  practiceLevel: PracticeLevel
  bmi?: number
  assessment?: string
  dailyCalories?: number
  recommendedSessions?: number
}
export type DashboardSection = MainSection

import type { PracticeLevel } from '../../shared/api/bmiApi'
import type { HealthMetrics } from '../dashboard/types'

export const loadHealthMetricsFromResponse = (res: any): HealthMetrics | null => {
  if (res.success && res.data && res.data.length > 0) {
    const latest = res.data.sort((a: any, b: any) => {
      const dateA = a.recordedAt || a.RecordedAt || ''
      const dateB = b.recordedAt || b.RecordedAt || ''
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })[0]

    let dailyCalories: number | undefined = undefined
    let recommendedSessions: number | undefined = undefined
    const goal = latest.goal || latest.Goal
    if (goal && typeof goal === 'object') {
      const tdee = (goal as any).tdee || (goal as any).TDEE
      if (typeof tdee === 'number') {
        dailyCalories = tdee
      }

      const plan = (goal as any).plan || (goal as any).Plan
      if (plan && typeof plan === 'object') {
        const exercisePerWeek = plan.ExercisePerWeek || plan.exercisePerWeek
        if (typeof exercisePerWeek === 'number') {
          recommendedSessions = exercisePerWeek
        }
      }

      if (!recommendedSessions) {
        const sessions =
          (goal as any).recommendedSessions ||
          (goal as any).RecommendedSessions ||
          (goal as any).recommendedDays ||
          (goal as any).RecommendedDays
        if (typeof sessions === 'number') {
          recommendedSessions = sessions
        }
      }
    }

    const metrics: HealthMetrics = {
      weightKg: latest.weightKg || 0,
      heightM: latest.heightCm ? latest.heightCm / 100 : 0,
      activityFactor: latest.activityFactor || latest.ActivityFactor || 1.55,
      practiceLevel: (latest.practiceLevel || latest.PracticeLevel || 'MEDIUM') as PracticeLevel,
      bmi: latest.bmi || latest.BMI,
      assessment: latest.assessment || latest.Assessment,
      dailyCalories: dailyCalories,
      recommendedSessions: recommendedSessions
    }

    return metrics
  }
  return null
}

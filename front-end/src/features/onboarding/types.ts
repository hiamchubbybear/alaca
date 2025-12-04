export type OnboardingStep = 'bmi' | 'activity' | 'experience' | 'complete'

export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'super_active'

export type PracticeLevel = 'PRO' | 'HARD' | 'MEDIUM' | 'EASY' | 'NEWBIE'

export type OnboardingData = {
  heightCm?: number
  weightKg?: number
  bmi?: number
  assessment?: string
  activityLevel?: ActivityLevel
  practiceLevel?: PracticeLevel
}

export type ActivityLevelOption = {
  id: ActivityLevel
  title: string
  description: string
  pal: number
}

export type PracticeLevelOption = {
  id: PracticeLevel
  title: string
  description: string
  timeRange: string
}

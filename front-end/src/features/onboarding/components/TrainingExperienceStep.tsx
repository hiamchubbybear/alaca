import { useState } from 'react'
import { getBmiRecord } from '../../../services/bmiService'
import type { PracticeLevelOption } from '../types'

type Props = {
  onComplete: () => void
}

const practiceLevels: PracticeLevelOption[] = [
  {
    id: 'PRO',
    title: 'Pro',
    description: 'Professional athlete level',
    timeRange: '> 1 hour/day'
  },
  {
    id: 'HARD',
    title: 'Hard',
    description: 'Advanced fitness enthusiast',
    timeRange: '45m → 1h'
  },
  {
    id: 'MEDIUM',
    title: 'Medium',
    description: 'Regular workout routine',
    timeRange: '30m → 45m'
  },
  {
    id: 'EASY',
    title: 'Easy',
    description: 'Getting started with fitness',
    timeRange: '15m → 30m'
  },
  {
    id: 'NEWBIE',
    title: 'Newbie',
    description: 'Just beginning your journey',
    timeRange: '5m → 15m'
  }
]

export function TrainingExperienceStep({ onComplete }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSelect = async () => {
    try {
      setLoading(true)
      setError(null)

      // Verify BMI record was created by calling /bmi/me
      const res = await getBmiRecord()
      if (!res.success) {
        setError('Failed to verify your profile. Please try again.')
        return
      }

      // Complete onboarding
      onComplete()
    } catch {
      setError('Unable to reach server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="onboarding-step">
      <div className="onboarding-header">
        <h2>Select Your Training Experience</h2>
        <p className="onboarding-subtitle">
          Help us tailor your workout plans to match your current fitness level.
        </p>
      </div>

      {error && <p className="auth-error">{error}</p>}

      <div className="activity-grid">
        {practiceLevels.map((level) => (
          <button
            key={level.id}
            type="button"
            className="activity-card"
            onClick={() => handleSelect()}
            disabled={loading}
          >
            <h3>{level.title}</h3>
            <p className="activity-description">{level.description}</p>
            <span className="activity-pal">{level.timeRange}</span>
          </button>
        ))}
      </div>

      {loading && <p className="onboarding-loading">Setting up your profile...</p>}
    </div>
  )
}

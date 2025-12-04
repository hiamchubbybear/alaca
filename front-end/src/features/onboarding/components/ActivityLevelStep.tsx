import type { ActivityLevelOption } from '../types'

type Props = {
  onNext: () => void
}

const activityLevels: ActivityLevelOption[] = [
  {
    id: 'sedentary',
    title: 'Sedentary',
    description: 'Little to no exercise',
    pal: 1.2
  },
  {
    id: 'lightly_active',
    title: 'Lightly Active',
    description: 'Light exercise/sports 1-3 days/week',
    pal: 1.375
  },
  {
    id: 'moderately_active',
    title: 'Moderately Active',
    description: 'Moderate exercise/sports 3-5 days/week',
    pal: 1.55
  },
  {
    id: 'very_active',
    title: 'Very Active',
    description: 'Hard exercise/sports 6-7 days a week',
    pal: 1.725
  },
  {
    id: 'super_active',
    title: 'Super Active',
    description: 'Very hard exercise & physical job or 2x training',
    pal: 1.9
  }
]

export function ActivityLevelStep({ onNext }: Props) {
  return (
    <div className="onboarding-step">
      <div className="onboarding-header">
        <h2>Select Your Activity Level</h2>
        <p className="onboarding-subtitle">
          This helps us calculate your Total Daily Energy Expenditure (TDEE).
        </p>
      </div>

      <div className="activity-grid">
        {activityLevels.map((level) => (
          <button
            key={level.id}
            type="button"
            className="activity-card"
            onClick={() => onNext()}
          >
            <h3>{level.title}</h3>
            <p className="activity-description">{level.description}</p>
            <span className="activity-pal">PAL {level.pal}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

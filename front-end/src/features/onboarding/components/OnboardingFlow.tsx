import { useState } from 'react'
import type { OnboardingStep } from '../types'
import { ActivityLevelStep } from './ActivityLevelStep'
import { BmiStep } from './BmiStep'
import { TrainingExperienceStep } from './TrainingExperienceStep'

type Props = {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('bmi')

  const handleBmiNext = () => {
    setCurrentStep('activity')
  }

  const handleActivityNext = () => {
    setCurrentStep('experience')
  }

  const handleExperienceComplete = () => {
    onComplete()
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width:
                currentStep === 'bmi' ? '33%' : currentStep === 'activity' ? '66%' : '100%'
            }}
          />
        </div>
        <p className="progress-text">
          Step {currentStep === 'bmi' ? '1' : currentStep === 'activity' ? '2' : '3'} of 3
        </p>
      </div>

      {currentStep === 'bmi' && <BmiStep onNext={handleBmiNext} />}
      {currentStep === 'activity' && <ActivityLevelStep onNext={handleActivityNext} />}
      {currentStep === 'experience' && (
        <TrainingExperienceStep onComplete={handleExperienceComplete} />
      )}
    </div>
  )
}

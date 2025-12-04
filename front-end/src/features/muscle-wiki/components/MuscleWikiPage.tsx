import { useState } from 'react'
import type { MuscleGroup } from '../../../shared/constants/muscleGroups'
import { muscleGroups, type MuscleKey } from '../../../shared/constants/muscleGroups'

type Props = {
  onBack: () => void
}

export function MuscleWikiPage({ onBack }: Props) {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleKey | null>(null)

  return (
    <section className="muscle-wiki-page">
      <div className="muscle-wiki-container">
        <div className="muscle-wiki-header">
          <h1 className="muscle-wiki-title">Muscle Wiki</h1>
          <p className="muscle-wiki-subtitle">Click on a muscle group to learn more</p>
          <button
            className="back-to-home-btn"
            onClick={() => {
              setSelectedMuscle(null)
              onBack()
            }}
          >
            ← Back to Home
          </button>
        </div>

        <div className="muscle-wiki-content">
          <div className="muscle-diagram-container">
            <div className="muscle-diagram">
              <img src="/muscle.jpg" alt="Muscle diagram" className="muscle-image" />
            </div>
          </div>

          <div className="muscle-list-panel">
            <div className="muscle-list">
              {Object.entries(muscleGroups).map(([key, group]) => {
                const muscleKey = key as MuscleKey
                const muscleGroup = group as MuscleGroup
                const isSelected = selectedMuscle === muscleKey

                return (
                  <label key={key} className={`muscle-list-item ${isSelected ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      className="muscle-list-checkbox"
                      checked={isSelected}
                      onChange={() => setSelectedMuscle(isSelected ? null : muscleKey)}
                    />
                    <div className="muscle-list-text">
                      <span className="muscle-list-name">{muscleGroup.name}</span>
                      <span className="muscle-list-location">{muscleGroup.location}</span>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="muscle-info-panel">
            {selectedMuscle ? (
              <div className="muscle-info-content">
                <h2 className="muscle-info-title">{muscleGroups[selectedMuscle].name}</h2>
                <p className="muscle-info-description">{muscleGroups[selectedMuscle].description}</p>

                <div className="muscle-info-section">
                  <h3 className="muscle-info-heading">Location</h3>
                  <p className="muscle-info-text">{muscleGroups[selectedMuscle].location}</p>
                </div>

                <div className="muscle-info-section">
                  <h3 className="muscle-info-heading">Functions</h3>
                  <ul className="muscle-info-list">
                    {muscleGroups[selectedMuscle].functions.map((func: string, index: number) => (
                      <li key={index}>{func}</li>
                    ))}
                  </ul>
                </div>

                <div className="muscle-info-section">
                  <h3 className="muscle-info-heading">Recommended Exercises</h3>
                  <ul className="muscle-info-list">
                    {muscleGroups[selectedMuscle].exercises.map((exercise: string, index: number) => (
                      <li key={index}>{exercise}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="muscle-info-placeholder">
                <h2 className="muscle-info-placeholder-title">Select a Muscle Group</h2>
                <p className="muscle-info-placeholder-text">
                  Choose a muscle group from the checklist in the middle column to see its functions,
                  location, and recommended exercises here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

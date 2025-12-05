import { useState } from 'react'
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
          <h1 className="muscle-wiki-title">Bách Khoa Cơ</h1>
          <p className="muscle-wiki-subtitle">Nhấp vào nhóm cơ để tìm hiểu thêm</p>
          <button
            className="back-to-home-btn"
            onClick={() => {
              setSelectedMuscle(null)
              onBack()
            }}
          >
            ← Trở về Trang chủ
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
                      <span className="muscle-list-name">{group.name}</span>
                      <span className="muscle-list-location">{group.location}</span>
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
                  <h3 className="muscle-info-heading">Vị trí</h3>
                  <p className="muscle-info-text">{muscleGroups[selectedMuscle].location}</p>
                </div>

                <div className="muscle-info-section">
                  <h3 className="muscle-info-heading">Chức năng</h3>
                  <ul className="muscle-info-list">
                    {muscleGroups[selectedMuscle].functions.map((func, index) => (
                      <li key={index}>{func}</li>
                    ))}
                  </ul>
                </div>

                <div className="muscle-info-section">
                  <h3 className="muscle-info-heading">Bài tập đề xuất</h3>
                  <ul className="muscle-info-list">
                    {muscleGroups[selectedMuscle].exercises.map((exercise, index) => (
                      <li key={index}>{exercise}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="muscle-info-placeholder">
                <h2 className="muscle-info-placeholder-title">Chọn Nhóm Cơ</h2>
                <p className="muscle-info-placeholder-text">
                  Chọn một nhóm cơ từ danh sách ở cột giữa để xem chức năng,
                  vị trí và bài tập đề xuất tại đây.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

import { useEffect, useRef, useState } from 'react'
import { exerciseVideos } from '../../../shared/constants/exerciseVideos'
import { muscleGroups, type MuscleKey } from '../../../shared/constants/muscleGroups'
import './MuscleWikiPage.css'

type Props = {
  onBack: () => void
}

export function MuscleWikiPage({ onBack }: Props) {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleKey | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null)
  const videoContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showVideo = (index: number) => {
    setSelectedVideoIndex(index)
    setTimeout(() => {
      videoContainerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 100)
  }

  const closeVideo = () => {
    setSelectedVideoIndex(null)
  }

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
                      <li key={index}>
                        <button
                          type="button"
                          className="exercise-link-btn"
                          onClick={() => showVideo(index)}
                        >
                          {exercise} →
                        </button>
                      </li>
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

      {selectedVideoIndex !== null && selectedMuscle && exerciseVideos[selectedMuscle] && (
        <div className="fullscreen-video-container" ref={videoContainerRef}>
          <button className="close-video-btn" onClick={closeVideo}>
            ✕ Đóng
          </button>
          <div className="fullscreen-video-wrapper">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${exerciseVideos[selectedMuscle][selectedVideoIndex].videoId}?autoplay=1`}
              title={exerciseVideos[selectedMuscle][selectedVideoIndex].title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <h3 className="fullscreen-video-title">
            {exerciseVideos[selectedMuscle][selectedVideoIndex].title}
          </h3>
        </div>
      )}

      {showScrollTop && (
        <button
          className="scroll-to-top-btn"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
    </section>
  )
}

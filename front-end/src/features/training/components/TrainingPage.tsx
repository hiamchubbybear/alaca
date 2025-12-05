import { useEffect, useState } from 'react'
import './TrainingPage.css'
// Mock data for staging
type Workout = {
  id: string
  name: string
  title: string
  description: string
  exercises: any[]
  intensity: string
  durationMin: number
}

export function TrainingPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadWorkouts()
  }, [])

  const loadWorkouts = async () => {
    try {
      setLoading(true)
      setError(null)
      // Mock data - no API calls
      setWorkouts([])
    } catch (err) {
      setError('Không thể tải bài tập')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="section-page">
        <div className="loading-state">Đang tải bài tập...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="section-page">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={loadWorkouts} className="btn-primary">Thử lại</button>
        </div>
      </div>
    )
  }

  return (
    <div className="section-page">
      <div className="section-header">
        <h1 className="main-content-title">Luyện Tập</h1>
        <div className="header-actions">
          <button className="btn-secondary">Xem Bài Tập</button>
          <button className="btn-primary">Tạo Bài Tập Mới</button>
        </div>
      </div>

      {workouts.length === 0 ? (
        <div className="empty-state">
          <h2>Chưa Có Bài Tập</h2>
          <p>Tạo bài tập đầu tiên để bắt đầu luyện tập</p>
          <button className="btn-primary">Tạo Bài Tập</button>
        </div>
      ) : (
        <div className="workout-grid">
          {workouts.map((workout) => (
            <div key={workout.id} className="workout-card">
              <div className="workout-header">
                <h3>{workout.title}</h3>
                <span className={`intensity-badge ${workout.intensity}`}>
                  {workout.intensity === 'low' ? 'Nhẹ' : workout.intensity === 'medium' ? 'Trung bình' : 'Nặng'}
                </span>
              </div>
              <p className="workout-description">{workout.description}</p>
              <div className="workout-meta">
                <span className="workout-duration">
                  ⏱️ {workout.durationMin} phút
                </span>
                <span className="workout-exercises">
                  💪 {workout.exercises?.length || 0} bài tập
                </span>
              </div>
              <div className="workout-actions">
                <button className="btn-secondary">Chỉnh sửa</button>
                <button className="btn-primary">Bắt đầu</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

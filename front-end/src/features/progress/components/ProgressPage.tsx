import { useEffect, useState } from 'react'
import './ProgressPage.css'
// Mock data for staging
type ProgressEntry = {
  id: string
  date: string
  weight: number
  notes: string
  type: string
  numericValue: number
  textValue: string
  photoUrl: string
  recordedAt: string
}

export function ProgressPage() {
  const [entries, setEntries] = useState<ProgressEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadProgress()
  }, [filter])

  const loadProgress = async () => {
    try {
      setLoading(true)
      setError(null)
      // Mock data - no API calls
      setEntries([])
    } catch (err) {
      setError('Không thể tải tiến độ')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const weightEntries = entries.filter(e => e.type === 'weight')
  const photoEntries = entries.filter(e => e.type === 'photo')

  if (loading) {
    return (
      <div className="section-page">
        <div className="loading-state">Đang tải tiến độ...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="section-page">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={loadProgress} className="btn-primary">Thử lại</button>
        </div>
      </div>
    )
  }

  return (
    <div className="section-page">
      <div className="section-header">
        <h1 className="main-content-title">Tiến Độ Của Bạn</h1>
        <button className="btn-primary">Ghi Nhận Tiến Độ</button>
      </div>

      <div className="progress-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tất cả
        </button>
        <button
          className={`filter-btn ${filter === 'weight' ? 'active' : ''}`}
          onClick={() => setFilter('weight')}
        >
          Cân nặng
        </button>
        <button
          className={`filter-btn ${filter === 'photo' ? 'active' : ''}`}
          onClick={() => setFilter('photo')}
        >
          Hình ảnh
        </button>
        <button
          className={`filter-btn ${filter === 'measurements' ? 'active' : ''}`}
          onClick={() => setFilter('measurements')}
        >
          Số đo
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <h2>Chưa Có Dữ Liệu Tiến Độ</h2>
          <p>Bắt đầu theo dõi tiến độ để xem sự thay đổi của bạn</p>
          <button className="btn-primary">Ghi Nhận Lần Đầu</button>
        </div>
      ) : (
        <div className="progress-grid">
          {/* Weight Chart */}
          {weightEntries.length > 0 && (
            <div className="progress-card full-width">
              <h2>Biểu Đồ Cân Nặng</h2>
              <div className="weight-chart">
                <div className="chart-placeholder">
                  <p>Biểu đồ cân nặng sẽ hiển thị tại đây</p>
                  <p className="chart-data">
                    Mới nhất: {weightEntries[weightEntries.length - 1]?.numericValue} kg
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Photos */}
          {photoEntries.length > 0 && (
            <div className="progress-card full-width">
              <h2>Hình Ảnh Tiến Độ</h2>
              <div className="photo-grid">
                {photoEntries.map((entry) => (
                  <div key={entry.id} className="photo-item">
                    {entry.photoUrl ? (
                      <img src={entry.photoUrl} alt="Tiến độ" />
                    ) : (
                      <div className="photo-placeholder">📷</div>
                    )}
                    <span className="photo-date">
                      {new Date(entry.recordedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Entries List */}
          <div className="progress-card full-width">
            <h2>Ghi Nhận Gần Đây</h2>
            <div className="entry-list">
              {entries.map((entry) => (
                <div key={entry.id} className="entry-item">
                  <div className="entry-info">
                    <span className="entry-type">{entry.type === 'weight' ? 'Cân nặng' : entry.type === 'photo' ? 'Hình ảnh' : 'Số đo'}</span>
                    <span className="entry-date">
                      {new Date(entry.recordedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="entry-value">
                    {entry.numericValue && `${entry.numericValue} ${entry.type === 'weight' ? 'kg' : ''}`}
                    {entry.textValue && entry.textValue}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

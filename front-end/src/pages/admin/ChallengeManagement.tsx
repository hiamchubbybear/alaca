import { useEffect, useState } from 'react'
import './ChallengeManagement.css'
import { ConfirmModal } from './ConfirmModal'

interface Challenge {
  id: string
  title: string
  description: string
  goalType: string
  targetValue: number
  duration: number
  startDate: string
  endDate: string
  participantCount?: number
  completionRate?: number
  createdAt: string
}

interface ConfirmState {
  isOpen: boolean
  title: string
  message: string
  type: 'danger' | 'warning' | 'info'
  onConfirm: () => void
}

export function ChallengeManagement() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [confirmModal, setConfirmModal] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {}
  })
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [viewingChallenge, setViewingChallenge] = useState<Challenge | null>(null)
  const pageSize = 20

  useEffect(() => {
    loadChallenges()
  }, [page])

  useEffect(() => {
    filterChallenges()
  }, [challenges, searchTerm, statusFilter])

  const loadChallenges = async () => {
    setLoading(true)
    try {
      // TODO: API call
      // const res = await getAllChallenges(page, pageSize)
      setChallenges([])
      setTotal(0)
    } catch (error) {
      console.error('Failed to load challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterChallenges = () => {
    let filtered = challenges

    if (searchTerm) {
      filtered = filtered.filter(challenge =>
        challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      const now = new Date()
      filtered = filtered.filter(challenge => {
        const start = new Date(challenge.startDate)
        const end = new Date(challenge.endDate)

        if (statusFilter === 'upcoming') return start > now
        if (statusFilter === 'active') return start <= now && end >= now
        if (statusFilter === 'completed') return end < now
        return true
      })
    }

    setFilteredChallenges(filtered)
  }

  const handleDelete = async (_challengeId: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa Thử Thách',
      message: `Bạn có chắc muốn xóa thử thách "${title}"?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          // TODO: API call
          showSuccess('Đã xóa thử thách')
          loadChallenges()
        } catch (error) {
          showSuccess('Lỗi khi xóa thử thách')
        }
        setConfirmModal({ ...confirmModal, isOpen: false })
      }
    })
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const getChallengeStatus = (challenge: Challenge) => {
    const now = new Date()
    const start = new Date(challenge.startDate)
    const end = new Date(challenge.endDate)

    if (start > now) return { text: 'Sắp diễn ra', class: 'upcoming' }
    if (start <= now && end >= now) return { text: 'Đang diễn ra', class: 'active' }
    return { text: 'Đã kết thúc', class: 'completed' }
  }

  if (loading) {
    return <div className="loading">Đang tải...</div>
  }

  return (
    <div className="challenge-management">
      {successMessage && (
        <div className="success-toast">{successMessage}</div>
      )}

      {/* Header Stats */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-value">{total}</div>
          <div className="stat-label">Tổng thử thách</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">
            {challenges.filter(c => {
              const now = new Date()
              const start = new Date(c.startDate)
              const end = new Date(c.endDate)
              return start <= now && end >= now
            }).length}
          </div>
          <div className="stat-label">Đang diễn ra</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">
            {challenges.reduce((sum, c) => sum + (c.participantCount || 0), 0)}
          </div>
          <div className="stat-label">Tổng người tham gia</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">
            {challenges.length > 0
              ? (challenges.reduce((sum, c) => sum + (c.completionRate || 0), 0) / challenges.length).toFixed(1)
              : 0}%
          </div>
          <div className="stat-label">Tỷ lệ hoàn thành TB</div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm thử thách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Trạng thái:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="upcoming">Sắp diễn ra</option>
            <option value="active">Đang diễn ra</option>
            <option value="completed">Đã kết thúc</option>
          </select>
        </div>

        <div className="results-count">
          Hiển thị {filteredChallenges.length} / {total} thử thách
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="challenges-grid">
        {filteredChallenges.length === 0 ? (
          <div className="empty-state">
            <p>Chưa có thử thách nào.</p>
          </div>
        ) : (
          filteredChallenges.map((challenge) => {
            const status = getChallengeStatus(challenge)
            return (
              <div key={challenge.id} className="challenge-card">
                <div className="challenge-header">
                  <h3>{challenge.title}</h3>
                  <span className={`status-badge ${status.class}`}>
                    {status.text}
                  </span>
                </div>

                <div className="challenge-body">
                  <p className="challenge-description">{challenge.description}</p>

                  <div className="challenge-details">
                    <div className="detail-item">
                      <span className="detail-label">Mục tiêu:</span>
                      <span className="detail-value">{challenge.goalType} - {challenge.targetValue}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Thời gian:</span>
                      <span className="detail-value">{challenge.duration} ngày</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Bắt đầu:</span>
                      <span className="detail-value">{new Date(challenge.startDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Kết thúc:</span>
                      <span className="detail-value">{new Date(challenge.endDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  <div className="challenge-stats">
                    <div className="stat-box">
                      <div className="stat-number">{challenge.participantCount || 0}</div>
                      <div className="stat-text">Người tham gia</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-number">{challenge.completionRate || 0}%</div>
                      <div className="stat-text">Hoàn thành</div>
                    </div>
                  </div>
                </div>

                <div className="challenge-actions">
                  <button className="btn-view" onClick={() => setViewingChallenge(challenge)}>
                    Xem Chi Tiết
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(challenge.id, challenge.title)}>
                    Xóa
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          ← Trước
        </button>
        <span>Trang {page} / {Math.ceil(total / pageSize) || 1}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / pageSize)}>
          Sau →
        </button>
      </div>

      {/* View Challenge Modal */}
      {viewingChallenge && (
        <div className="modal-overlay" onClick={() => setViewingChallenge(null)}>
          <div className="modal-content challenge-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{viewingChallenge.title}</h3>
              <button className="close-btn" onClick={() => setViewingChallenge(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="challenge-detail">
                <p><strong>Mô tả:</strong></p>
                <p className="challenge-full-description">{viewingChallenge.description}</p>

                <div className="detail-grid">
                  <div className="detail-row">
                    <span className="label">Loại mục tiêu:</span>
                    <span className="value">{viewingChallenge.goalType}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Giá trị mục tiêu:</span>
                    <span className="value">{viewingChallenge.targetValue}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Thời gian:</span>
                    <span className="value">{viewingChallenge.duration} ngày</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Bắt đầu:</span>
                    <span className="value">{new Date(viewingChallenge.startDate).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Kết thúc:</span>
                    <span className="value">{new Date(viewingChallenge.endDate).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Người tham gia:</span>
                    <span className="value">{viewingChallenge.participantCount || 0}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Tỷ lệ hoàn thành:</span>
                    <span className="value">{viewingChallenge.completionRate || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  )
}

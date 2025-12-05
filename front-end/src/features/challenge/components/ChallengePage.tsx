import { useEffect, useState } from 'react'
import { getAllChallenges, getMyChallenges, joinChallenge, type Challenge } from '../../../services/challengeService'
import './ChallengePage.css'

export function ChallengePage() {
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([])
  const [myChallenges, setMyChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all')

  useEffect(() => {
    loadChallenges()
  }, [])

  const loadChallenges = async () => {
    try {
      setLoading(true)
      setError(null)
      const [allRes, myRes] = await Promise.all([
        getAllChallenges(),
        getMyChallenges()
      ])

      if (allRes.success && allRes.data) {
        setAllChallenges(allRes.data)
      }
      if (myRes.success && myRes.data) {
        setMyChallenges(myRes.data)
      }
    } catch (err) {
      setError('Không thể tải thử thách')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const res = await joinChallenge(challengeId)
      if (res.success) {
        loadChallenges()
      }
    } catch (err) {
      console.error('Không thể tham gia thử thách:', err)
    }
  }

  const challenges = activeTab === 'all' ? allChallenges : myChallenges

  if (loading) {
    return (
      <div className="section-page">
        <div className="loading-state">Đang tải thử thách...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="section-page">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={loadChallenges} className="btn-primary">Thử lại</button>
        </div>
      </div>
    )
  }

  return (
    <div className="section-page">
      <h1 className="main-content-title">Thử Thách</h1>

      <div className="challenge-tabs">
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Tất Cả Thử Thách
        </button>
        <button
          className={`tab-btn ${activeTab === 'mine' ? 'active' : ''}`}
          onClick={() => setActiveTab('mine')}
        >
          Thử Thách Của Tôi ({myChallenges.length})
        </button>
      </div>

      {challenges.length === 0 ? (
        <div className="empty-state">
          <h2>{activeTab === 'mine' ? 'Chưa Tham Gia Thử Thách Nào' : 'Không Có Thử Thách'}</h2>
          <p>{activeTab === 'mine' ? 'Tham gia một thử thách để bắt đầu' : 'Quay lại sau để xem thử thách mới'}</p>
        </div>
      ) : (
        <div className="challenge-grid">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="challenge-card">
              <div className="challenge-header">
                <h3>{challenge.title}</h3>
                {challenge.isParticipating && (
                  <span className="participating-badge">Đã tham gia</span>
                )}
              </div>
              <p className="challenge-description">{challenge.description}</p>
              <div className="challenge-meta">
                <div className="meta-item">
                  <span className="meta-label">Bắt đầu</span>
                  <span className="meta-value">
                    {new Date(challenge.startDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Kết thúc</span>
                  <span className="meta-value">
                    {new Date(challenge.endDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Người tham gia</span>
                  <span className="meta-value">{challenge.participantCount}</span>
                </div>
              </div>
              {!challenge.isParticipating && (
                <button
                  className="btn-primary"
                  onClick={() => handleJoinChallenge(challenge.id)}
                >
                  Tham Gia
                </button>
              )}
              {challenge.isParticipating && (
                <button className="btn-secondary">Xem Tiến Độ</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

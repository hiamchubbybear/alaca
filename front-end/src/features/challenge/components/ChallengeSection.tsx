import { useEffect, useState } from 'react'
import {
  getAllAchievements,
  getAllChallenges,
  getMyAchievements,
  getMyChallenges,
  joinChallenge,
  type Achievement,
  type Challenge,
  type ChallengeParticipant,
  type UserAchievement
} from '../api/challengeApi'
import './ChallengeSection.css'

type TabType = 'challenges' | 'achievements'
type AchievementCategory = 'all' | 'workout' | 'nutrition' | 'progress' | 'social' | 'challenge'

export function ChallengeSection() {
  console.log('🎯 [ChallengeSection] VERSION: NEW DESIGN v2.0 - Horizontal cards with progress bars')

  const [activeTab, setActiveTab] = useState<TabType>('challenges')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Challenges state
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([])
  const [myChallenges, setMyChallenges] = useState<ChallengeParticipant[]>([])

  // Achievements state
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([])
  const [myAchievements, setMyAchievements] = useState<UserAchievement[]>([])
  const [achievementFilter, setAchievementFilter] = useState<AchievementCategory>('all')

  useEffect(() => {
    console.log('[Challenge] Component mounted, activeTab:', activeTab)
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('[Challenge] Loading data for tab:', activeTab)
      if (activeTab === 'challenges') {
        const [challengesRes, myRes] = await Promise.all([getAllChallenges(), getMyChallenges()])
        console.log('[Challenge] Challenges response:', challengesRes)
        console.log('[Challenge] My challenges response:', myRes)

        // Ensure data is always an array
        if (challengesRes.success) {
          const data = Array.isArray(challengesRes.data) ? challengesRes.data : []
          setAllChallenges(data)
        }
        if (myRes.success) {
          const data = Array.isArray(myRes.data) ? myRes.data : []
          setMyChallenges(data)
        }
      } else {
        const [achievementsRes, myAchievementsRes] = await Promise.all([getAllAchievements(), getMyAchievements()])
        console.log('[Challenge] Achievements response:', achievementsRes)
        console.log('[Challenge] My achievements response:', myAchievementsRes)

        // Ensure data is always an array
        if (achievementsRes.success) {
          const data = Array.isArray(achievementsRes.data) ? achievementsRes.data : []
          setAllAchievements(data)
        }
        if (myAchievementsRes.success) {
          const data = Array.isArray(myAchievementsRes.data) ? myAchievementsRes.data : []
          setMyAchievements(data)
        }
      }
    } catch (err) {
      console.error('[Challenge] Failed to load data:', err)
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
      console.log('[Challenge] Loading complete')

      // Mock data for testing UI when backend is empty
      if (activeTab === 'achievements' && allAchievements.length === 0) {
        console.log('[Challenge] No data from backend, using MOCK data for UI testing')
        setAllAchievements([
          {
            id: '1',
            name: 'Người mới bắt đầu',
            description: 'Hoàn thành buổi tập đầu tiên',
            category: 'workout',
            badgeIcon: '💪',
            points: 10,
            criteria: '{}',
            tier: 'bronze',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Chiến binh 7 ngày',
            description: 'Tập luyện liên tục 7 ngày',
            category: 'challenge',
            badgeIcon: '🔥',
            points: 50,
            criteria: '{}',
            tier: 'silver',
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Ăn uống lành mạnh',
            description: 'Theo dõi dinh dưỡng 30 ngày',
            category: 'nutrition',
            badgeIcon: '🥗',
            points: 100,
            criteria: '{}',
            tier: 'gold',
            createdAt: new Date().toISOString()
          },
          {
            id: '4',
            name: 'Tiến bộ vượt bậc',
            description: 'Tăng 20% sức mạnh',
            category: 'progress',
            badgeIcon: '📈',
            points: 75,
            criteria: '{}',
            tier: 'silver',
            createdAt: new Date().toISOString()
          }
        ])
        setMyAchievements([
          {
            id: '1',
            userId: 'user1',
            achievementId: '1',
            unlockedAt: new Date().toISOString()
          }
        ])
      }
    }
  }

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const res = await joinChallenge(challengeId)
      if (res.success) {
        loadData()
      }
    } catch (error) {
      console.error('Failed to join challenge:', error)
    }
  }

  const getMyActiveChallenges = () => {
    return myChallenges.filter((p) => p.status === 'active')
  }

  const getAvailableChallenges = () => {
    const myIds = new Set(myChallenges.map((p) => p.challengeId))
    return allChallenges.filter((c) => !myIds.has(c.id))
  }

  const getUnlockedAchievements = () => {
    const unlockedIds = new Set(myAchievements.map((ua) => ua.achievementId))
    return allAchievements.filter((a) => unlockedIds.has(a.id))
  }

  const getLockedAchievements = () => {
    const unlockedIds = new Set(myAchievements.map((ua) => ua.achievementId))
    return allAchievements.filter((a) => !unlockedIds.has(a.id))
  }

  const filterAchievements = (achievements: Achievement[]) => {
    if (achievementFilter === 'all') return achievements
    return achievements.filter((a) => a.category === achievementFilter)
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return '#CD7F32'
      case 'silver':
        return '#C0C0C0'
      case 'gold':
        return '#FFD700'
      case 'platinum':
        return '#E5E4E2'
      default:
        return '#667eea'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'workout':
        return (
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            <path d='M6.5 4H9.5V20H6.5V4ZM14.5 4H17.5V20H14.5V4ZM2 8H5V16H2V8ZM22 8V16H19V8H22Z' />
          </svg>
        )
      case 'nutrition':
        return (
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            <path d='M16 2C16 2 16 5 14 6.5C12 8 8 8 6 10C4 12 4 15 6 17C8 19 11 19 13 17C15 15 17.5 14 20 12C20 12 18 10 16 10C14 10 12 9 12 7C12 5 15 3 16 2Z' />
          </svg>
        )
      case 'progress':
        return (
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            <path d='M18 20V10M12 20V4M6 20V14' />
          </svg>
        )
      case 'social':
        return (
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            <path d='M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21' />
            <circle cx='9' cy='7' r='4' />
          </svg>
        )
      case 'challenge':
        return (
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            <path d='M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z' />
          </svg>
        )
      default:
        return (
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            <circle cx='12' cy='8' r='7' />
            <polyline points='8.21 13.89 7 23 12 20 17 23 15.79 13.88' />
          </svg>
        )
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const getDaysRemaining = (endDate?: string) => {
    if (!endDate) return null
    const end = new Date(endDate)
    const now = new Date()
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  return (
    <div className='challenge-container'>
      {/* Header */}
      <div className='challenge-header'>
        <div>
          <h1 className='challenge-title'>Thử Thách & Thành Tựu</h1>
          <p className='challenge-subtitle'>Hoàn thành thử thách và mở khóa thành tựu</p>
        </div>
        <div className='challenge-stats'>
          <div className='stat-item'>
            <span className='stat-value'>{myAchievements.length}</span>
            <span className='stat-label'>Thành tựu</span>
          </div>
          <div className='stat-item'>
            <span className='stat-value'>
              {myAchievements.reduce((sum, ua) => sum + (ua.achievement?.points || 0), 0)}
            </span>
            <span className='stat-label'>Điểm</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className='challenge-tabs'>
        <button
          className={`challenge-tab ${activeTab === 'challenges' ? 'active' : ''}`}
          onClick={() => setActiveTab('challenges')}
        >
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            <path d='M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z' />
          </svg>
          Thử Thách
        </button>
        <button
          className={`challenge-tab ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            <circle cx='12' cy='8' r='7' />
            <polyline points='8.21 13.89 7 23 12 20 17 23 15.79 13.88' />
          </svg>
          Thành Tựu
        </button>
      </div>

      {/* Content */}
      <div className='challenge-content'>
        {error ? (
          <div className='error-state' style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ color: '#ef4444', fontSize: '1.1rem', marginBottom: '1rem' }}>{error}</p>
            <button className='btn-primary' onClick={loadData}>
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className='loading-state'>Đang tải...</div>
        ) : activeTab === 'challenges' ? (
          <div className='challenges-view'>
            {/* Active Challenges */}
            <section className='challenge-section'>
              <h2 className='section-title'>Đang tham gia ({getMyActiveChallenges().length})</h2>
              {getMyActiveChallenges().length === 0 ? (
                <p className='empty-state'>Bạn chưa tham gia thử thách nào</p>
              ) : (
                <div className='challenge-grid'>
                  {getMyActiveChallenges().map((participant) => {
                    const challenge =
                      participant.challenge || allChallenges.find((c) => c.id === participant.challengeId)
                    if (!challenge) return null

                    const progress = participant.progress ? JSON.parse(participant.progress) : {}
                    const currentStreak = progress.currentStreak || 0
                    const targetStreak = challenge.strike || 0
                    const progressPercent = targetStreak > 0 ? (currentStreak / targetStreak) * 100 : 0
                    const daysLeft = getDaysRemaining(challenge.endDate)

                    return (
                      <div key={participant.id} className='challenge-card active'>
                        <div className='card-header'>
                          <h3 className='card-title'>{challenge.title}</h3>
                          <span className='status-badge active'>Đang tham gia</span>
                        </div>
                        <p className='card-description'>{challenge.description}</p>

                        <div className='progress-section'>
                          <div className='progress-info'>
                            <span>
                              🔥 {currentStreak} / {targetStreak} ngày
                            </span>
                            {daysLeft !== null && <span>⏰ Còn {daysLeft} ngày</span>}
                          </div>
                          <div className='progress-bar'>
                            <div className='progress-fill' style={{ width: `${Math.min(progressPercent, 100)}%` }} />
                          </div>
                        </div>

                        <div className='card-footer'>
                          <span className='joined-date'>Tham gia: {formatDate(participant.joinedAt)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Available Challenges */}
            <section className='challenge-section'>
              <h2 className='section-title'>Có sẵn ({getAvailableChallenges().length})</h2>
              {getAvailableChallenges().length === 0 ? (
                <p className='empty-state'>Không có thử thách mới</p>
              ) : (
                <div className='challenge-grid'>
                  {getAvailableChallenges().map((challenge) => {
                    const daysLeft = getDaysRemaining(challenge.endDate)
                    const reward = challenge.reward ? JSON.parse(challenge.reward) : {}

                    return (
                      <div key={challenge.id} className='challenge-card available'>
                        <div className='card-header'>
                          <h3 className='card-title'>{challenge.title}</h3>
                        </div>
                        <p className='card-description'>{challenge.description}</p>

                        <div className='challenge-info'>
                          <div className='info-item'>
                            <span className='info-label'>Mục tiêu:</span>
                            <span className='info-value'>🔥 {challenge.strike} ngày</span>
                          </div>
                          {daysLeft !== null && (
                            <div className='info-item'>
                              <span className='info-label'>Thời gian:</span>
                              <span className='info-value'>⏰ {daysLeft} ngày</span>
                            </div>
                          )}
                          {reward.points && (
                            <div className='info-item'>
                              <span className='info-label'>Phần thưởng:</span>
                              <span className='info-value'>{reward.points} điểm</span>
                            </div>
                          )}
                        </div>

                        <button className='btn-join' onClick={() => handleJoinChallenge(challenge.id)}>
                          Tham gia
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className='achievements-view'>
            {/* Category Filter */}
            <div className='category-filter'>
              {(['all', 'workout', 'nutrition', 'progress', 'social', 'challenge'] as AchievementCategory[]).map(
                (cat) => {
                  const labels = {
                    all: 'Tất cả',
                    workout: 'Luyện tập',
                    nutrition: 'Dinh dưỡng',
                    progress: 'Tiến độ',
                    social: 'Xã hội',
                    challenge: 'Thử thách'
                  }

                  return (
                    <button
                      key={cat}
                      className={`filter-btn ${achievementFilter === cat ? 'active' : ''}`}
                      onClick={() => setAchievementFilter(cat)}
                    >
                      {cat === 'all' ? (
                        <>
                          <svg
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                          >
                            <circle cx='12' cy='12' r='10' />
                            <path d='M12 6v6l4 2' />
                          </svg>
                          {labels[cat]}
                        </>
                      ) : (
                        <>
                          {getCategoryIcon(cat)}
                          {labels[cat]}
                        </>
                      )}
                    </button>
                  )
                }
              )}
            </div>

            {/* Unlocked Achievements */}
            <section className='achievement-section'>
              <h2 className='section-title'>Đã mở khóa ({filterAchievements(getUnlockedAchievements()).length})</h2>
              <div className='achievement-grid'>
                {filterAchievements(getUnlockedAchievements()).map((achievement) => {
                  const userAchievement = myAchievements.find((ua) => ua.achievementId === achievement.id)

                  return (
                    <div key={achievement.id} className='achievement-card unlocked'>
                      <div className='achievement-icon'>
                        <svg
                          width='48'
                          height='48'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='2'
                        >
                          <path d='M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z' />
                        </svg>
                      </div>
                      <div className='achievement-content'>
                        <h3 className='achievement-name'>{achievement.name}</h3>
                        <p className='achievement-desc'>{achievement.description}</p>

                        <div className='achievement-progress'>
                          <div className='progress-header'>
                            <span className='progress-label'>Hoàn thành</span>
                            <span className='progress-percent'>100%</span>
                          </div>
                          <div className='progress-bar-container'>
                            <div className='progress-bar-fill' style={{ width: '100%' }} />
                          </div>
                        </div>

                        <div className='achievement-footer'>
                          <div className='achievement-meta'>
                            <span className='tier-badge' style={{ background: getTierColor(achievement.tier) }}>
                              {achievement.tier}
                            </span>
                            <span className='points-badge'>{achievement.points} điểm</span>
                          </div>
                          <span className='unlock-date'>{formatDate(userAchievement?.unlockedAt)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Locked Achievements */}
            <section className='achievement-section'>
              <h2 className='section-title'>Chưa mở khóa ({filterAchievements(getLockedAchievements()).length})</h2>
              <div className='achievement-grid'>
                {filterAchievements(getLockedAchievements()).map((achievement) => {
                  // Mock progress - in real app, get from backend
                  const mockProgress = Math.floor(Math.random() * 80)

                  return (
                    <div key={achievement.id} className='achievement-card locked'>
                      <div className='achievement-icon locked'>
                        <svg
                          width='48'
                          height='48'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='2'
                        >
                          <rect x='3' y='11' width='18' height='11' rx='2' ry='2' />
                          <path d='M7 11V7a5 5 0 0 1 10 0v4' />
                        </svg>
                      </div>
                      <div className='achievement-content'>
                        <h3 className='achievement-name'>{achievement.name}</h3>
                        <p className='achievement-desc'>{achievement.description}</p>

                        <div className='achievement-progress'>
                          <div className='progress-header'>
                            <span className='progress-label'>Tiến độ</span>
                            <span className='progress-percent'>{mockProgress}%</span>
                          </div>
                          <div className='progress-bar-container'>
                            <div className='progress-bar-fill' style={{ width: `${mockProgress}%` }} />
                          </div>
                        </div>

                        <div className='achievement-footer'>
                          <div className='achievement-meta'>
                            <span className='tier-badge' style={{ background: getTierColor(achievement.tier) }}>
                              {achievement.tier}
                            </span>
                            <span className='points-badge'>{achievement.points} điểm</span>
                          </div>
                          {mockProgress >= 100 ? (
                            <button className='btn-claim'>Nhận</button>
                          ) : (
                            <span className='progress-remaining'>{100 - mockProgress}% còn lại</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

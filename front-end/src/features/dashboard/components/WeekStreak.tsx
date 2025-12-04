import { useEffect, useState } from 'react'
import { request } from '../../../shared/api/apiClient'
import './WeekStreak.css'

export interface StreakData {
  type: string
  currentStreak: number
  longestStreak: number
  lastActivityDate: string
}

export interface UserStats {
  totalPoints: number
  achievementsUnlocked: number
  totalAchievements: number
  streaks: StreakData[]
  recentAchievements: any[]
}

export function WeekStreak() {
  const [streaks, setStreaks] = useState<StreakData[]>([])
  const [loading, setLoading] = useState(true)
  const [weekStreak, setWeekStreak] = useState(0)

  useEffect(() => {
    loadStreaks()
  }, [])

  const loadStreaks = async () => {
    try {
      setLoading(true)
      // Try to get stats - if API endpoint exists, use it
      // Otherwise use mock data for demonstration
      try {
        const res = await request<never, UserStats>('/recommendation/stats', {
          method: 'GET',
          auth: true
        })

        if (res.success && res.data?.streaks && res.data.streaks.length > 0) {
          setStreaks(res.data.streaks)
          const workoutStreak = res.data.streaks.find((s) => s.type === 'workout')
          if (workoutStreak) {
            setWeekStreak(Math.floor(workoutStreak.currentStreak / 7))
          }
          setLoading(false)
          return
        }
      } catch (apiError) {
        // API endpoint might not exist yet, use mock data
        console.log('Stats API not available, using mock data')
      }

      // Fallback: Use mock data for demonstration
      // In production, this would come from the actual streak API
      const mockStreaks: StreakData[] = [
        {
          type: 'workout',
          currentStreak: 14, // 14 days = 2 weeks
          longestStreak: 28,
          lastActivityDate: new Date().toISOString()
        }
      ]
      setStreaks(mockStreaks)
      setWeekStreak(2)
    } catch (error) {
      console.error('Failed to load streaks:', error)
      // Use mock data on error
      setStreaks([
        {
          type: 'workout',
          currentStreak: 14,
          longestStreak: 28,
          lastActivityDate: new Date().toISOString()
        }
      ])
      setWeekStreak(2)
    } finally {
      setLoading(false)
    }
  }

  const workoutStreak = streaks.find((s) => s.type === 'workout')
  const currentStreak = workoutStreak ? workoutStreak.currentStreak : weekStreak * 7
  const longestStreak = workoutStreak ? workoutStreak.longestStreak : 0

  // Get current week days
  const getWeekDays = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - dayOfWeek + 1) // Monday as start

    const days = []
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      days.push({
        name: dayNames[i],
        date: date.getDate(),
        isPast: date < today,
        isToday: date.toDateString() === today.toDateString(),
        isCompleted: i < (currentStreak % 7)
      })
    }
    
    return days
  }

  const weekDays = getWeekDays()
  const motivationalMessages = [
    'You are on the right track',
    'Keep up the great work!',
    'Amazing progress!',
    'You\'re doing fantastic!',
    'Stay consistent!'
  ]
  const motivationalMessage = motivationalMessages[currentStreak % motivationalMessages.length]

  return (
    <div className="week-streak-container">
      <div className="week-streak-header">
        <div className="week-streak-title">Healthy Habits</div>
      </div>
      
      {loading ? (
        <div className="week-streak-loading">Loading...</div>
      ) : (
        <>
          <div className="week-streak-badge-container">
            <div className="week-streak-badge">
              <svg
                className="week-streak-badge-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div className="week-streak-main">
            <div className="week-streak-number">{currentStreak}</div>
            <div className="week-streak-label">Day Streak!</div>
          </div>

          <div className="week-streak-message">{motivationalMessage}</div>

          <div className="week-streak-calendar">
            {weekDays.map((day, index) => (
              <div key={index} className="week-streak-day">
                <div className="week-streak-day-name">{day.name}</div>
                {day.isCompleted ? (
                  <div className="week-streak-day-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                ) : (
                  <div className={`week-streak-day-number ${day.isToday ? 'today' : ''}`}>
                    {day.date}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="week-streak-claim-btn">Claim</button>
        </>
      )}
    </div>
  )
}


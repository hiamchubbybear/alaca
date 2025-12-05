import { useEffect, useState, useRef } from 'react'
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

interface Position {
  x: number
  y: number
}

export function WeekStreak() {
  const [streaks, setStreaks] = useState<StreakData[]>([])
  const [loading, setLoading] = useState(true)
  const [weekStreak, setWeekStreak] = useState(0)
  
  // Drag and resize state
  const [position, setPosition] = useState<Position>(() => {
    const saved = localStorage.getItem('weekStreak_position')
    return saved ? JSON.parse(saved) : { x: 1.5, y: 1.5 }
  })
  
  const [size, setSize] = useState(() => {
    const saved = localStorage.getItem('weekStreak_size')
    return saved ? JSON.parse(saved) : { width: 260, height: 'auto' }
  })
  
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState<{ pos: Position; size: { width: number; height: number } }>({ 
    pos: { x: 0, y: 0 },
    size: { width: 260, height: 400 }
  })
  
  const containerRef = useRef<HTMLDivElement>(null)
  const dragHandleRef = useRef<HTMLDivElement>(null)
  const resizeHandleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadStreaks()
  }, [])

  // Save position and size to localStorage
  useEffect(() => {
    localStorage.setItem('weekStreak_position', JSON.stringify(position))
  }, [position])

  useEffect(() => {
    localStorage.setItem('weekStreak_size', JSON.stringify(size))
  }, [size])

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent) => {
    if (e.target === dragHandleRef.current || dragHandleRef.current?.contains(e.target as Node)) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleDrag = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      
      // Constrain to viewport
      const maxX = window.innerWidth - (typeof size.width === 'number' ? size.width : 260)
      const maxY = window.innerHeight - 200 // Approximate height
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      })
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    const currentWidth = typeof size.width === 'number' ? size.width : 260
    const currentHeight = typeof size.height === 'number' ? size.height : 400
    setResizeStart({
      pos: { x: e.clientX, y: e.clientY },
      size: { width: currentWidth, height: currentHeight }
    })
  }

  const handleResize = (e: MouseEvent) => {
    if (isResizing) {
      const deltaX = e.clientX - resizeStart.pos.x
      const deltaY = e.clientY - resizeStart.pos.y
      
      // Min and max constraints
      const minWidth = 200
      const maxWidth = 500
      const minHeight = 300
      const maxHeight = 800
      
      const newWidth = resizeStart.size.width + deltaX
      const newHeight = resizeStart.size.height + deltaY
      
      setSize({
        width: Math.max(minWidth, Math.min(newWidth, maxWidth)),
        height: Math.max(minHeight, Math.min(newHeight, maxHeight))
      })
    }
  }

  const handleResizeEnd = () => {
    setIsResizing(false)
  }

  // Event listeners for drag and resize
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDrag)
      document.addEventListener('mouseup', handleDragEnd)
      return () => {
        document.removeEventListener('mousemove', handleDrag)
        document.removeEventListener('mouseup', handleDragEnd)
      }
    }
  }, [isDragging, dragStart])

  useEffect(() => {
    if (isResizing) {
      const handleResizeMove = (e: MouseEvent) => handleResize(e)
      const handleResizeUp = () => handleResizeEnd()
      
      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleResizeUp)
      return () => {
        document.removeEventListener('mousemove', handleResizeMove)
        document.removeEventListener('mouseup', handleResizeUp)
      }
    }
  }, [isResizing, resizeStart])

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
    <div 
      ref={containerRef}
      className="week-streak-container"
      style={{
        left: `${position.x}px`,
        bottom: 'auto',
        top: `${position.y}px`,
        width: typeof size.width === 'number' ? `${size.width}px` : size.width,
        height: typeof size.height === 'number' ? `${size.height}px` : size.height,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      <div 
        ref={dragHandleRef}
        className="week-streak-header week-streak-drag-handle"
        onMouseDown={handleDragStart}
      >
        <div className="week-streak-title">Healthy Habits</div>
        <div className="week-streak-drag-icon">⋮⋮</div>
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
      <div 
        ref={resizeHandleRef}
        className="week-streak-resize-handle"
        onMouseDown={handleResizeStart}
      />
    </div>
  )
}

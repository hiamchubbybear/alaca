import { useEffect, useState } from 'react'
import { completeWorkout, getLatestWorkout } from '../api/workoutApi'
import './WorkoutPlayer.css'

type WorkoutState = 'idle' | 'active' | 'resting' | 'completed'

interface Exercise {
  id: string
  name: string
  videoUrl: string
  sets: number
  restTime: number // seconds between sets
  instructions: string // Exercise instructions
}

interface WorkoutSession {
  id: string
  scheduleId: string
  name: string
  exercises: Exercise[]
}

const SET_DURATION = 180 // 3 minutes in seconds

export function WorkoutPlayer() {
  // Workout data
  const [workout, setWorkout] = useState<WorkoutSession | null>(null)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [, setLoading] = useState(true)
  const [, setError] = useState<string | null>(null)

  // Timer states
  const [state, setState] = useState<WorkoutState>('idle')
  const [timeRemaining, setTimeRemaining] = useState(SET_DURATION)
  const [isPaused, setIsPaused] = useState(false)

  // Video player ref
  const [videoKey, setVideoKey] = useState(0)

  // Load workout data from API
  useEffect(() => {
    loadWorkout()
  }, [])

  const loadWorkout = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('[WorkoutPlayer] Loading workout...')

      const response = await getLatestWorkout()
      console.log('[WorkoutPlayer] API Response:', response)

      if (response.success && response.data) {
        const schedule = response.data
        console.log('[WorkoutPlayer] Schedule data:', schedule)
        console.log('[WorkoutPlayer] Exercises:', schedule.exercises)

        // Check if exercises exist and not empty
        if (!schedule.exercises || schedule.exercises.length === 0) {
          console.log('[WorkoutPlayer] No exercises in schedule, using mock data')
          loadMockWorkout()
          return
        }

        // Map API data to WorkoutSession
        const workoutSession: WorkoutSession = {
          id: schedule.workoutId,
          scheduleId: schedule.workoutScheduleId,
          name: schedule.workoutName,
          exercises: schedule.exercises.map((ex) => {
            // Convert YouTube URL to embed format
            let embedUrl = ex.videoUrl || 'https://www.youtube.com/embed/IODxDxX7oi4'
            if (!embedUrl.includes('/embed/')) {
              const watchMatch = embedUrl.match(/[?&]v=([^&]+)/)
              if (watchMatch) {
                embedUrl = `https://www.youtube.com/embed/${watchMatch[1]}`
              }
            }

            // Decode Unicode escape sequences in instructions
            let decodedInstructions = ex.instructions || 'Thực hiện bài tập theo hướng dẫn trong video.'

            // Check if instructions is a JSON array string
            if (decodedInstructions.startsWith('[') && decodedInstructions.endsWith(']')) {
              try {
                const parsed = JSON.parse(decodedInstructions)
                if (Array.isArray(parsed)) {
                  decodedInstructions = parsed.join(', ')
                }
              } catch (e) {
                console.warn('Failed to parse instructions JSON:', e)
              }
            }

            // Decode Unicode escapes
            try {
              decodedInstructions = decodedInstructions.replace(/\\u([0-9A-Fa-f]{4})/g, (_match, code) =>
                String.fromCharCode(parseInt(code, 16))
              )
            } catch (e) {
              console.warn('Failed to decode instructions:', e)
            }

            return {
              id: ex.exerciseId,
              name: ex.exerciseName,
              videoUrl: embedUrl,
              sets: ex.sets,
              restTime: ex.restTime,
              instructions: decodedInstructions
            }
          })
        }

        console.log('[WorkoutPlayer] Mapped workout:', workoutSession)
        console.log('[WorkoutPlayer] Total exercises:', workoutSession.exercises.length)
        setWorkout(workoutSession)
      } else {
        console.log('[WorkoutPlayer] API failed, using mock data')
        // Fallback to mock data if API fails
        loadMockWorkout()
      }
    } catch (err) {
      console.error('[WorkoutPlayer] Failed to load workout:', err)
      setError('Không thể tải bài tập')
      // Fallback to mock data
      loadMockWorkout()
    } finally {
      setLoading(false)
    }
  }

  const loadMockWorkout = () => {
    const mockWorkout: WorkoutSession = {
      id: 'mock-1',
      scheduleId: 'mock-schedule-1',
      name: 'Buổi tập hôm nay',
      exercises: [
        {
          id: '1',
          name: 'Push-ups',
          videoUrl: 'https://www.youtube.com/embed/IODxDxX7oi4',
          sets: 3,
          restTime: 45,
          instructions:
            'Giữ lưng thẳng, hạ người xuống cho đến khi ngực gần chạm sàn, sau đó đẩy lên. Thở ra khi đẩy lên, hít vào khi hạ xuống.'
        },
        {
          id: '2',
          name: 'Squats',
          videoUrl: 'https://www.youtube.com/embed/aclHkVaku9U',
          sets: 3,
          restTime: 60,
          instructions:
            'Đứng thẳng, chân rộng bằng vai. Hạ người xuống như ngồi ghế, giữ lưng thẳng. Đẩy gót chân để đứng lên.'
        },
        {
          id: '3',
          name: 'Plank',
          videoUrl: 'https://www.youtube.com/embed/pSHjTRCQxIw',
          sets: 3,
          restTime: 30,
          instructions:
            'Nằm sấp, chống khuỷu tay và mũi bàn chân. Giữ thân thẳng từ đầu đến gót, không để hông sụp xuống.'
        }
      ]
    }
    setWorkout(mockWorkout)
  }

  // Set timer countdown
  useEffect(() => {
    if (state === 'active' && timeRemaining > 0 && !isPaused) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (state === 'active' && timeRemaining === 0) {
      // Time's up - auto complete set
      handleCompleteSet()
    }
  }, [state, timeRemaining, isPaused])

  // Rest timer countdown
  useEffect(() => {
    if (state === 'resting' && timeRemaining > 0 && !isPaused) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Rest ended, start next set
            setState('idle')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    } else if (state === 'resting' && timeRemaining === 0) {
      setState('idle')
    }
  }, [state, timeRemaining, isPaused])

  const currentExercise = workout?.exercises[currentExerciseIndex]
  const nextExercise = workout?.exercises[currentExerciseIndex + 1]

  const handleStart = () => {
    setState('active')
    setTimeRemaining(SET_DURATION)
    // Force video reload to auto-play
    setVideoKey((prev) => prev + 1)
  }

  const handleCompleteSet = () => {
    if (!currentExercise) return

    if (currentSet < currentExercise.sets) {
      // Start rest timer
      setState('resting')
      setTimeRemaining(currentExercise.restTime)
      setCurrentSet((prev) => prev + 1)
    } else {
      // Exercise completed, move to next
      if (nextExercise) {
        setCurrentExerciseIndex((prev) => prev + 1)
        setCurrentSet(1)
        setState('idle')
        setTimeRemaining(SET_DURATION)
      } else {
        // Workout completed - call API
        handleWorkoutComplete()
      }
    }
  }

  const handleWorkoutComplete = async () => {
    setState('completed')

    if (!workout) return

    try {
      console.log('[WorkoutPlayer] Marking workout as completed...')

      const response = await completeWorkout({
        workoutScheduleId: workout.scheduleId,
        completedAt: new Date().toISOString(),
        notes: `Completed ${workout.exercises.length} exercises`
      })

      if (response.success) {
        console.log('[WorkoutPlayer] Workout marked as completed successfully!')
      } else {
        console.error('[WorkoutPlayer] Failed to mark workout as completed:', response.message)
      }
    } catch (err) {
      console.error('[WorkoutPlayer] Error completing workout:', err)
    }
  }

  const handlePause = () => {
    setIsPaused(!isPaused)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getTimerColor = () => {
    if (state === 'resting') return timeRemaining < 10 ? '#ef4444' : '#c4b5fd'
    if (state === 'active' && timeRemaining < 30) return '#f59e0b'
    return '#667eea'
  }

  const getTimerProgress = () => {
    if (state === 'active') {
      return (timeRemaining / SET_DURATION) * 100
    } else if (state === 'resting' && currentExercise) {
      return (timeRemaining / currentExercise.restTime) * 100
    }
    return 100
  }

  if (!workout || !currentExercise) {
    return <div className='workout-player-loading'>Đang tải bài tập...</div>
  }

  if (state === 'completed') {
    return (
      <div className='workout-player-completed'>
        <h1>🎉 Hoàn thành!</h1>
        <p>Bạn đã hoàn thành buổi tập hôm nay</p>
        <button className='btn-primary' onClick={() => window.location.reload()}>
          Về trang chủ
        </button>
      </div>
    )
  }

  return (
    <div className='workout-player-compact'>
      {/* Compact Header */}
      <div className='compact-header'>
        <div className='exercise-title'>
          <h2>{currentExercise.name}</h2>
          <span className='set-badge'>
            Set {currentSet}/{currentExercise.sets}
          </span>
        </div>
        {nextExercise && <span className='next-exercise'>Tiếp: {nextExercise.name}</span>}
      </div>

      {/* Main Content - Side by Side */}
      <div className='compact-content'>
        {/* Left: Timer & Controls */}
        <div className='timer-controls'>
          <div
            className='circular-timer-compact'
            style={{ '--progress': getTimerProgress(), '--color': getTimerColor() } as any}
          >
            <svg className='timer-ring' viewBox='0 0 120 120'>
              <circle className='timer-ring-bg' cx='60' cy='60' r='54' />
              <circle className='timer-ring-progress' cx='60' cy='60' r='54' />
            </svg>
            <div className='timer-content'>
              <div className='timer-value'>{formatTime(timeRemaining)}</div>
              <div className='timer-label'>
                {state === 'resting' ? 'Nghỉ ngơi' : state === 'active' ? 'Đang tập' : 'Sẵn sàng'}
              </div>
            </div>
          </div>

          {/* Exercise Instructions */}
          <div className='exercise-instructions'>
            <h4>Hướng dẫn:</h4>
            <p>{currentExercise.instructions}</p>
          </div>

          {/* Control Buttons */}
          <div className='control-buttons-compact'>
            {state === 'idle' && (
              <button className='btn-control btn-start' onClick={handleStart}>
                Bắt đầu set
              </button>
            )}

            {state === 'active' && (
              <>
                <button className='btn-control btn-complete' onClick={handleCompleteSet}>
                  Hoàn thành set
                </button>
                <button className='btn-control btn-pause' onClick={handlePause}>
                  {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
                </button>
              </>
            )}

            {state === 'resting' && (
              <button className='btn-control btn-skip' onClick={() => setState('idle')}>
                Bỏ qua nghỉ
              </button>
            )}
          </div>

          {/* Helpful Tip */}
          {state === 'active' && (
            <div className='workout-tip'>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                <circle cx='12' cy='12' r='10' />
                <path d='M12 16v-4M12 8h.01' />
              </svg>
              <span>Bạn có thể tạm dừng để hiểu rõ hướng dẫn trước khi tiếp tục</span>
            </div>
          )}
        </div>

        {/* Right: Video Player */}
        <div className='video-player-compact'>
          <div className='video-container-compact'>
            <iframe
              key={videoKey}
              src={`${currentExercise.videoUrl}?autoplay=${state === 'active' ? 1 : 0}&controls=1&disablekb=1&modestbranding=1&rel=0`}
              title={currentExercise.name}
              frameBorder='0'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  )
}

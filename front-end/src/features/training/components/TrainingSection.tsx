import { useEffect, useMemo, useState } from 'react'
import { getMyBmiRecords } from '../../../shared/api/bmiApi'
import { getExerciseRecommendations, getExercises, type Exercise } from '../../../shared/api/exerciseApi'
import { getLatestSchedule, saveSchedule, type DailyPlan } from '../../../shared/api/workoutScheduleApi'
import { type HealthMetrics } from '../../dashboard/types'
import { loadHealthMetricsFromResponse } from '../../health/utils'

interface TrainingSectionProps {
  healthMetrics: HealthMetrics | null
  setHealthMetrics: (metrics: HealthMetrics) => void
  onNavigateToHealth: () => void
}

export function TrainingSection({ healthMetrics, setHealthMetrics, onNavigateToHealth }: TrainingSectionProps) {
  const [trainingLoading, setTrainingLoading] = useState(false)
  const [trainingError, setTrainingError] = useState<string | null>(null)

  const [sessionCards, setSessionCards] = useState<number[]>([])
  const [sessionItems, setSessionItems] = useState<
    Record<number, Array<{ name: string; muscle: string; calories: string }>>
  >({})

  const [savingSchedule, setSavingSchedule] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarTarget, setSidebarTarget] = useState<{ session: number; row: number } | null>(null)
  const [sidebarTab, setSidebarTab] = useState<'recommended' | 'library'>('recommended')

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [exerciseLoading, setExerciseLoading] = useState(false)
  const [exerciseError, setExerciseError] = useState<string | null>(null)
  const [recommendedExercises, setRecommendedExercises] = useState<Exercise[]>([])
  const [exerciseDetailModal, setExerciseDetailModal] = useState<Exercise | null>(null)

  // Calculate recommended sessions based on health metrics
  const recommendedSessionCount = useMemo(() => {
    if (trainingLoading || trainingError) return 0
    if (healthMetrics?.recommendedSessions) return healthMetrics.recommendedSessions
    if (!healthMetrics?.activityFactor) return 3
    const af = healthMetrics.activityFactor
    if (af < 1.3) return 2
    if (af < 1.5) return 3
    if (af < 1.65) return 4
    if (af < 1.8) return 5
    return 6
  }, [healthMetrics, trainingError, trainingLoading])

  // Initialize session cards when recommended count changes
  useEffect(() => {
    if (recommendedSessionCount <= 0) {
      setSessionCards([])
      setSessionItems({})
      return
    }
    setSessionCards((prev) => {
      // Only set if not already set (preserve user edits if they match count? actually simpler to just init if different or empty)
      // The original code:
      if (prev.length === recommendedSessionCount) return prev
      const next = Array.from({ length: recommendedSessionCount }, (_, i) => i + 1)
      return next
    })
  }, [recommendedSessionCount])

  // Sync session items structure
  useEffect(() => {
    setSessionItems((prev) => {
      let changed = false
      const next = { ...prev }
      sessionCards.forEach((order) => {
        if (!next[order]) {
          next[order] = []
          changed = true
        }
      })
      return changed ? next : prev
    })
  }, [sessionCards])

  // Initial Data Fetch
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (!healthMetrics || !healthMetrics.bmi) {
          const bmiRes = await getMyBmiRecords()
          if (!bmiRes.success || !bmiRes.data || bmiRes.data.length === 0) {
            // Let pure rendering handle the error state if notice is needed?
            // Logic says call onNavigateToHealth if missing data, but maybe we should show the UI prompt instead.
            // Original logic called onSelectSection('health') and setHealthNotice.
            // We'll handle this by showing a prompt in the UI if !healthMetrics.
            return
          }
          const metrics = loadHealthMetricsFromResponse(bmiRes)
          if (!metrics || !metrics.bmi) {
            return
          }
        }

        setTrainingLoading(true)
        const [bmiRes, scheduleRes] = await Promise.all([getMyBmiRecords(), getLatestSchedule()])

        if (cancelled) return

        // Update health metrics if newer (re-using logic from original)
        if (bmiRes.success && bmiRes.data && bmiRes.data.length > 0) {
          const metrics = loadHealthMetricsFromResponse(bmiRes)
          if (metrics) {
            setHealthMetrics(metrics)
          }
        }

        // Process Schedule
        if (scheduleRes.success && scheduleRes.data) {
          const schedules = scheduleRes.data.dailyPlans as DailyPlan[]

          const sessionNums = Array.from(new Set(schedules.map((s) => s.sessionNumber))).sort((a, b) => a - b)
          if (sessionNums.length > 0) {
            setSessionCards(sessionNums)
          }

          setSessionItems((prev) => {
            const next = { ...prev }
            schedules.forEach((s) => {
              const rowItems = s.exercises.map((ex) => ({
                name: ex.exerciseTitle,
                muscle: '',
                calories: ''
              }))
              next[s.sessionNumber] = rowItems
            })
            return next
          })
        }
      } catch (error) {
        console.error('Failed to load training data', error)
        setTrainingError('Failed to load training data')
      } finally {
        if (!cancelled) setTrainingLoading(false)
      }
    })()

    // Fetch exercises in background
    ;(async () => {
      try {
        setExerciseLoading(true)
        const res = await getExercises(1, 50)
        if (res.success && res.data?.exercises) {
          setExercises(res.data.exercises)
        }
      } catch {
        setExerciseError('Không thể tải thư viện bài tập.')
      } finally {
        setExerciseLoading(false)
      }
    })()

    // Fetch recommendations
    ;(async () => {
      try {
        const res = await getExerciseRecommendations()
        if (res.data?.exercises) {
          setRecommendedExercises(res.data.exercises)
        }
      } catch (error) {
        console.error(error)
      }
    })()

    return () => {
      cancelled = true
    }
  }, []) // Empty dependency array = mount only

  const convertToEmbedUrl = (url: string | null | undefined): string | null => {
    if (!url) return null
    if (url.includes('/embed/')) return url
    let videoId: string | null = null
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    if (watchMatch) videoId = watchMatch[1]
    const vMatch = url.match(/youtube\.com\/v\/([^&\n?#]+)/)
    if (vMatch) videoId = vMatch[1]
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  }

  const openSidebar = (session: number, row: number) => {
    setSidebarTarget({ session, row })
    setSidebarOpen(true)
    setSidebarTab('recommended')

    // Ensure exercises are loaded if library tab is clicked (already loaded on mount but safe check)
    if (exercises.length === 0 && !exerciseLoading && !exerciseError) {
      // Re-fetch logic can go here if distinct from mount
    }
  }

  const selectExerciseToRow = (exercise: {
    name?: string
    title?: string
    muscle?: string
    primaryMuscle?: string
    calories?: string | number
  }) => {
    if (!sidebarTarget) return
    const { session, row } = sidebarTarget
    setSessionItems((prev) => {
      const next = { ...prev }
      const rows = next[session] ? [...next[session]] : []
      while (rows.length < row + 1) rows.push({ name: '', muscle: '', calories: '' })
      rows[row] = {
        name: exercise.name || exercise.title || '',
        muscle: exercise.muscle || exercise.primaryMuscle || '',
        calories: exercise.calories !== undefined ? String(exercise.calories) : rows[row]?.calories || ''
      }
      next[session] = rows
      return next
    })
    setSidebarOpen(false)
    setSidebarTarget(null)
  }

  const handleSaveSchedule = async () => {
    try {
      setSavingSchedule(true)
      setSaveError(null)
      setSaveSuccess(null)

      const sessions = sessionCards
        .map((sessionNumber) => {
          const sessionExerciseRequests = (sessionItems[sessionNumber] || [])
            .filter((item) => item.name)
            .map((item) => {
              const exercise = [...recommendedExercises, ...exercises].find((ex) => ex.title === item.name)
              return {
                exerciseId: exercise?.id || '',
                sets: 3,
                reps: 10,
                restSeconds: 60,
                notes: ''
              }
            })
            .filter((ex) => ex.exerciseId)

          return {
            sessionNumber,
            sessionName: `Buổi ${sessionNumber}`,
            exercises: sessionExerciseRequests
          }
        })
        .filter((session) => session.exercises.length > 0)

      if (sessions.length === 0) {
        setSaveError('Vui lòng thêm ít nhất một bài tập vào lịch tập!')
        return
      }

      const response = await saveSchedule({
        weekNumber: 1,
        dailyPlans: sessions
      })

      if (response.success || response.data) {
        setSaveSuccess('Đã lưu lịch tập thành công!')
        setTimeout(() => setSaveSuccess(null), 3000)
      } else {
        setSaveError(response.message || 'Không thể lưu lịch tập')
      }
    } catch (error) {
      console.error('Save schedule error:', error)
      setSaveError('Đã xảy ra lỗi khi lưu lịch tập')
    } finally {
      setSavingSchedule(false)
    }
  }

  // Check if we effectively have no health data for training purposes
  const hasInsufficientHealthData = !healthMetrics || !healthMetrics.bmi

  if (hasInsufficientHealthData && !trainingLoading) {
    // Note: The parent component handles the redirect in original code.
    // Depending on UX, we might want to render the error here rather than redirecting forcefully.
    return (
      <div className='training-page'>
        <div className='status-message error'>
          Vui lòng nhập chỉ số sức khoẻ trước khi sử dụng tính năng Tập luyện.
          <br />
          <button className='btn-primary' onClick={onNavigateToHealth} style={{ marginTop: '10px' }}>
            Đi tới Chỉ số sức khoẻ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='training-page'>
      <div className='training-header'>
        <div>
          <h1 className='main-content-title'>Luyện Tập</h1>
          <p className='main-content-subtitle'>Kế hoạch gợi ý dựa trên TDEE và mức vận động của bạn.</p>
        </div>
        <div className='training-stat'>
          <span>TDEE</span>
          <strong>
            {trainingLoading
              ? 'Đang tải...'
              : trainingError
                ? '—'
                : healthMetrics?.dailyCalories
                  ? Math.round(healthMetrics.dailyCalories).toLocaleString('vi-VN')
                  : 'Chưa có'}
          </strong>
        </div>
      </div>

      {trainingError && (
        <div className='health-status error' style={{ margin: 0 }}>
          {trainingError}
        </div>
      )}

      <div className='training-recommend'>
        <div className='training-recommend-text'>
          <p className='label'>Số buổi/tuần (Recommend)</p>
          <h3>
            {(() => {
              if (trainingLoading) return 'Đang tải...'
              if (trainingError) return '—'
              if (healthMetrics?.recommendedSessions) return `${healthMetrics.recommendedSessions} buổi`
              if (!healthMetrics?.activityFactor) return '—'
              const af = healthMetrics.activityFactor
              if (af < 1.3) return '2 buổi'
              if (af < 1.5) return '3 buổi'
              if (af < 1.65) return '4 buổi'
              if (af < 1.8) return '5 buổi'
              return '6 buổi'
            })()}
          </h3>
        </div>
      </div>

      {trainingLoading && <p className='muted'>Đang tải dữ liệu...</p>}

      {!trainingLoading && !trainingError && (
        <div className='workout-grid'>
          {sessionCards.length === 0 && <p className='muted'>Chưa có buổi tập nào.</p>}
          {sessionCards.map((order) => (
            <div className='workout-card' key={`session-${order}`}>
              <div className='workout-card-header'>
                <div>
                  <p className='workout-title'>Buổi {order}</p>
                  <p className='workout-focus'>Tuỳ chỉnh bài tập của bạn</p>
                </div>

                <button
                  type='button'
                  className='workout-remove-btn'
                  onClick={() => setSessionCards((prev) => prev.filter((n) => n !== order))}
                  aria-label={`Xoá buổi ${order}`}
                >
                  ×
                </button>
              </div>
              <div className='workout-meta table'>
                <div className='workout-row header'>
                  <span>Tên bài tập</span>
                  <span>Nhóm cơ</span>
                  <span>Calories/1 set</span>
                  <span></span>
                </div>
                {(sessionItems[order] || []).map((item, idx) => (
                  <div className='workout-row' key={`session-${order}-row-${idx}`}>
                    <span>{item.name || 'Chưa có'}</span>
                    <span>{item.muscle || '---'}</span>
                    <span>{item.calories || '---'}</span>
                    <div className='row-actions'>
                      <button
                        type='button'
                        className='btn-action btn-detail'
                        onClick={() => {
                          const exercise = [...recommendedExercises, ...exercises].find((ex) => ex.title === item.name)
                          if (exercise) {
                            setExerciseDetailModal(exercise)
                          }
                        }}
                        aria-label='Xem chi tiết'
                        title='Xem chi tiết'
                      >
                        <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                          <path
                            d='M12 4C7 4 2.73 7.11 1 11.5C2.73 15.89 7 19 12 19C17 19 21.27 15.89 23 11.5C21.27 7.11 17 4 12 4ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z'
                            fill='currentColor'
                          />
                        </svg>
                      </button>
                      <button
                        type='button'
                        className='btn-action btn-edit'
                        onClick={() => openSidebar(order, idx)}
                        aria-label='Thay đổi bài tập'
                        title='Chỉnh sửa'
                      >
                        <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                          <path
                            d='M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.12 5.13L18.87 8.88L20.71 7.04Z'
                            fill='currentColor'
                          />
                        </svg>
                      </button>
                      <button
                        type='button'
                        className='btn-action btn-delete'
                        onClick={() => {
                          setSessionItems((prev) => {
                            const next = { ...prev }
                            const sessionExercises = [...(next[order] || [])]
                            sessionExercises.splice(idx, 1)
                            if (sessionExercises.length === 0) {
                              delete next[order]
                            } else {
                              next[order] = sessionExercises
                            }
                            return next
                          })
                        }}
                        aria-label='Xóa bài tập'
                        title='Xóa bài tập'
                      >
                        <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                          <path
                            d='M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9C18 7.9 17.1 7 16 7H8C6.9 7 6 7.9 6 9V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z'
                            fill='currentColor'
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                <div className='workout-row add-exercise-row'>
                  <button
                    type='button'
                    className='btn-add-exercise'
                    onClick={() => {
                      setSessionItems((prev) => ({
                        ...prev,
                        [order]: [...(prev[order] || []), { name: '', muscle: '', calories: '' }]
                      }))

                      const newIdx = (sessionItems[order] || []).length
                      openSidebar(order, newIdx)
                    }}
                  >
                    <span>+ Thêm bài tập</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {!trainingLoading && !trainingError && (
        <div className='workout-actions'>
          <button
            type='button'
            className='btn-add-session'
            onClick={() => {
              const nextSessionNumber = sessionCards.length > 0 ? Math.max(...sessionCards) + 1 : 1
              setSessionCards((prev) => [...prev, nextSessionNumber])
            }}
          >
            Thêm buổi tập
          </button>

          {sessionCards.length > 0 && (
            <button type='button' className='btn-save-schedule' onClick={handleSaveSchedule} disabled={savingSchedule}>
              {savingSchedule ? 'Đang lưu...' : 'Lưu lịch tập'}
            </button>
          )}
        </div>
      )}

      {/* Save Status Messages */}
      {saveSuccess && <div className='status-message success'>{saveSuccess}</div>}
      {saveError && <div className='status-message error'>{saveError}</div>}

      {/* Exercise Sidebar */}
      {sidebarOpen && sidebarTarget && (
        <div className='exercise-sidebar'>
          <div className='exercise-sidebar-header'>
            <div>
              <p className='sidebar-title'>
                Buổi {sidebarTarget.session} · Dòng {sidebarTarget.row + 1}
              </p>
              <p className='sidebar-subtitle'>Chọn bài tập để thêm</p>
            </div>
            <button
              type='button'
              className='workout-remove-btn'
              onClick={() => setSidebarOpen(false)}
              aria-label='Đóng'
            >
              ×
            </button>
          </div>
          <div className='exercise-tabs'>
            <button
              type='button'
              className={`exercise-tab ${sidebarTab === 'recommended' ? 'active' : ''}`}
              onClick={() => setSidebarTab('recommended')}
            >
              Bài tập đề xuất
            </button>
            <button
              type='button'
              className={`exercise-tab ${sidebarTab === 'library' ? 'active' : ''}`}
              onClick={() => setSidebarTab('library')}
            >
              Thư viện bài tập
            </button>
          </div>

          <div className='exercise-list'>
            {sidebarTab === 'recommended' &&
              recommendedExercises.map((ex) => (
                <div
                  className='exercise-item clickable'
                  key={ex.id}
                  onClick={() => setExerciseDetailModal(ex)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <p className='exercise-title'>{ex.title}</p>
                    <p className='exercise-meta'>
                      {ex.primaryMuscle} · {ex.caloriesBurnedPerSet} cal/set
                    </p>
                  </div>
                  <button
                    type='button'
                    className='btn-primary small'
                    onClick={(e) => {
                      e.stopPropagation()
                      selectExerciseToRow({
                        name: ex.title,
                        muscle: ex.primaryMuscle,
                        calories: ex.caloriesBurnedPerSet
                      })
                    }}
                  >
                    +
                  </button>
                </div>
              ))}

            {sidebarTab === 'library' && (
              <>
                {exerciseLoading && <p className='muted'>Đang tải thư viện...</p>}
                {exerciseError && <p className='muted'>{exerciseError}</p>}
                {!exerciseLoading &&
                  !exerciseError &&
                  exercises.map((ex) => (
                    <div
                      className='exercise-item clickable'
                      key={ex.id}
                      onClick={() => setExerciseDetailModal(ex)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div>
                        <p className='exercise-title'>{ex.title}</p>
                        <p className='exercise-meta'>
                          {ex.primaryMuscle || '---'} ·{' '}
                          {ex.caloriesBurnedPerSet || (ex as any).CaloriesBurnedPerSet || 0} cal/set
                        </p>
                      </div>
                      <button
                        type='button'
                        className='btn-primary small'
                        onClick={(e) => {
                          e.stopPropagation()
                          const calories = ex.caloriesBurnedPerSet || (ex as any).CaloriesBurnedPerSet || 0
                          selectExerciseToRow({
                            name: ex.title,
                            muscle: ex.primaryMuscle || '',
                            calories: calories.toString()
                          })
                        }}
                      >
                        +
                      </button>
                    </div>
                  ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Exercise Detail Modal */}
      {exerciseDetailModal && (
        <div className='modal-overlay' onClick={() => setExerciseDetailModal(null)}>
          <div className='modal-content exercise-detail-modal' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>{exerciseDetailModal.title}</h2>
              <button type='button' className='modal-close' onClick={() => setExerciseDetailModal(null)}>
                ×
              </button>
            </div>
            <div className='modal-body'>
              <div className='exercise-detail-section'>
                <h3>Thông tin cơ bản</h3>
                <div className='exercise-info-grid'>
                  <div className='info-item'>
                    <span className='info-label'>Nhóm cơ chính:</span>
                    <span className='info-value'>{exerciseDetailModal.primaryMuscle}</span>
                  </div>
                  {exerciseDetailModal.secondaryMuscles && (
                    <div className='info-item'>
                      <span className='info-label'>Nhóm cơ phụ:</span>
                      <span className='info-value'>
                        {Array.isArray(exerciseDetailModal.secondaryMuscles)
                          ? exerciseDetailModal.secondaryMuscles.join(', ')
                          : exerciseDetailModal.secondaryMuscles}
                      </span>
                    </div>
                  )}
                  <div className='info-item'>
                    <span className='info-label'>Độ khó:</span>
                    <span className='info-value'>{exerciseDetailModal.difficulty || 'Trung bình'}</span>
                  </div>
                  <div className='info-item'>
                    <span className='info-label'>Thiết bị:</span>
                    <span className='info-value'>{exerciseDetailModal.equipment || 'Không cần'}</span>
                  </div>
                  <div className='info-item'>
                    <span className='info-label'>Calories/set:</span>
                    <span className='info-value'>{exerciseDetailModal.caloriesBurnedPerSet || 15}</span>
                  </div>
                  <div className='info-item'>
                    <span className='info-label'>Sets đề xuất:</span>
                    <span className='info-value'>{exerciseDetailModal.recommendedSets || 3}</span>
                  </div>
                  <div className='info-item'>
                    <span className='info-label'>Reps đề xuất:</span>
                    <span className='info-value'>{exerciseDetailModal.recommendedReps || 10}</span>
                  </div>
                  <div className='info-item'>
                    <span className='info-label'>Thời gian nghỉ:</span>
                    <span className='info-value'>{exerciseDetailModal.restSeconds || 60}s</span>
                  </div>
                </div>
              </div>

              {exerciseDetailModal.description && (
                <div className='exercise-detail-section'>
                  <h3>Mô tả</h3>
                  <p>{exerciseDetailModal.description}</p>
                </div>
              )}

              {(() => {
                const embedUrl = convertToEmbedUrl(exerciseDetailModal.videoUrl)
                return embedUrl ? (
                  <div className='exercise-detail-section'>
                    <h3>Video hướng dẫn</h3>
                    <div className='video-container'>
                      <iframe
                        width='100%'
                        height='315'
                        src={embedUrl}
                        title={exerciseDetailModal.title}
                        frameBorder='0'
                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                ) : exerciseDetailModal.videoUrl ? (
                  <div className='exercise-detail-section'>
                    <h3>Video hướng dẫn</h3>
                    <p className='muted'>URL video không hợp lệ hoặc không phải YouTube.</p>
                    <a
                      href={exerciseDetailModal.videoUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='btn-primary'
                    >
                      Mở video trong tab mới
                    </a>
                  </div>
                ) : null
              })()}

              {exerciseDetailModal.images &&
                Array.isArray(exerciseDetailModal.images) &&
                exerciseDetailModal.images.length > 0 && (
                  <div className='exercise-detail-section'>
                    <h3>Hình ảnh</h3>
                    <div className='exercise-images'>
                      {exerciseDetailModal.images.map((img, idx) => (
                        <img key={idx} src={img} alt={`${exerciseDetailModal.title} ${idx + 1}`} />
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

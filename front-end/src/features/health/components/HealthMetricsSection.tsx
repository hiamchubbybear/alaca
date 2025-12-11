import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react'
import { createBmiRecord, getMyBmiRecords, type PracticeLevel } from '../../../shared/api/bmiApi'
import { type HealthMetrics } from '../../dashboard/types'
import { loadHealthMetricsFromResponse } from '../utils'

interface HealthMetricsSectionProps {
  healthMetrics: HealthMetrics | null
  onMetricsUpdated: (metrics: HealthMetrics) => void
  healthLoading?: boolean
  initialIsEditing?: boolean
  healthNotice?: string | null
}

type TabType = 'current' | 'history'
type DetailTabType = 'info' | 'goals'

interface BmiRecord {
  bmiRecordId: string
  weightKg: number
  heightCm: number
  bmi: number
  assessment: string
  measuredAt: string
  activityFactor?: number
  practiceLevel?: string
  dailyCalories?: number
  goal?: Record<string, any>
}

export function HealthMetricsSection({
  healthMetrics,
  onMetricsUpdated,
  healthLoading = false,
  initialIsEditing = false,
  healthNotice
}: HealthMetricsSectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>('current')
  const [isEditing, setIsEditing] = useState(initialIsEditing)
  const [currentStep, setCurrentStep] = useState(1)
  const [bmiHistory, setBmiHistory] = useState<BmiRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<BmiRecord | null>(null)
  const [detailTab, setDetailTab] = useState<DetailTabType>('info')

  const [healthForm, setHealthForm] = useState<{
    weightKg: string
    heightM: string
    activityFactor: string
    practiceLevel: PracticeLevel
  }>({
    weightKg: '',
    heightM: '',
    activityFactor: '1.55',
    practiceLevel: 'MEDIUM'
  })
  const [healthSaving, setHealthSaving] = useState(false)
  const [healthError, setHealthError] = useState<string | null>(null)
  const [healthSuccess, setHealthSuccess] = useState<string | null>(null)

  const totalSteps = 3

  useEffect(() => {
    if (initialIsEditing || healthNotice) {
      setIsEditing(true)
      setCurrentStep(1)
    }
  }, [initialIsEditing, healthNotice])

  useEffect(() => {
    if (healthMetrics) {
      setHealthForm({
        weightKg: healthMetrics.weightKg ? healthMetrics.weightKg.toString() : '',
        heightM: healthMetrics.heightM ? healthMetrics.heightM.toString() : '',
        activityFactor: healthMetrics.activityFactor ? healthMetrics.activityFactor.toString() : '1.55',
        practiceLevel: healthMetrics.practiceLevel || 'MEDIUM'
      })
    }
  }, [healthMetrics])

  useEffect(() => {
    if (activeTab === 'history') {
      loadBmiHistory()
    }
  }, [activeTab])

  const loadBmiHistory = async () => {
    try {
      setHistoryLoading(true)
      const res = await getMyBmiRecords()
      if (res.success && res.data) {
        // Transform data to extract dailyCalories from goal.tdee
        const transformedData = res.data.map((record) => ({
          ...record,
          dailyCalories: record.goal?.tdee || record.goal?.Tdee || undefined
        }))
        setBmiHistory(transformedData)
      }
    } catch (error) {
      console.error('Failed to load BMI history', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleHealthChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'practiceLevel') {
      setHealthForm((prev) => ({ ...prev, practiceLevel: value as PracticeLevel }))
      return
    }
    setHealthForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleHealthSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setHealthError(null)
    setHealthSuccess(null)

    const weight = parseFloat(healthForm.weightKg)
    const height = parseFloat(healthForm.heightM)
    const activity = parseFloat(healthForm.activityFactor)

    if (Number.isNaN(weight) || Number.isNaN(height) || weight <= 0 || height <= 0) {
      setHealthError('Vui lòng nhập cân nặng và chiều cao hợp lệ.')
      return
    }
    if (Number.isNaN(activity) || activity <= 0) {
      setHealthError('Vui lòng chọn cường độ tập luyện hợp lệ.')
      return
    }

    try {
      setHealthSaving(true)
      const res = await createBmiRecord({
        weightKg: weight,
        heightCm: height * 100,
        activityFactor: activity,
        practiceLevel: healthForm.practiceLevel
      })

      if (!res.success) {
        setHealthError(res.message || 'Lỗi khi lưu chỉ số BMI.')
        setHealthSaving(false)
        return
      }

      setHealthSuccess('Cập nhật chỉ số sức khoẻ thành công!')

      try {
        const recordsRes = await getMyBmiRecords()
        if (recordsRes.success) {
          const newMetrics = loadHealthMetricsFromResponse(recordsRes)
          if (newMetrics) {
            onMetricsUpdated(newMetrics)
          }
        }
      } catch (err) {
        console.error('Failed to reload metrics', err)
      }

      setIsEditing(false)
      setCurrentStep(1)
      setTimeout(() => setHealthSuccess(null), 3000)
    } catch (error) {
      console.error(error)
      setHealthError('Không thể lưu chỉ số sức khoẻ. Vui lòng thử lại.')
    } finally {
      setHealthSaving(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityLabel = (factor: number) => {
    if (factor <= 1.2) return 'Ít vận động'
    if (factor <= 1.375) return 'Vận động nhẹ'
    if (factor <= 1.55) return 'Vận động vừa phải'
    if (factor <= 1.725) return 'Vận động nhiều'
    return 'Vận động rất nhiều'
  }

  const getPracticeLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      PRO: 'Chuyên nghiệp',
      HARD: 'Cao cấp',
      MEDIUM: 'Trung cấp',
      EASY: 'Dễ',
      NEWBIE: 'Bắt đầu'
    }
    return labels[level] || level
  }

  const handleRecordClick = (record: BmiRecord) => {
    setSelectedRecord(record)
    setDetailTab('info')
  }

  const closeSidebar = () => {
    setSelectedRecord(null)
  }

  return (
    <div className='health-metrics'>
      <h1 className='main-content-title'>Chỉ Số Sức Khoẻ</h1>
      <p className='main-content-subtitle'>Theo dõi và quản lý chỉ số sức khoẻ của bạn</p>
      {healthNotice && <p className='health-status notice'>{healthNotice}</p>}

      <div className='health-tabs'>
        <button
          className={`health-tab ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('current')
            setSelectedRecord(null)
          }}
        >
          Sức khỏe hiện tại
        </button>
        <button
          className={`health-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Theo dõi chỉ số
        </button>
      </div>

      {activeTab === 'current' ? (
        <div className='health-tab-content'>
          {healthLoading ? (
            <p className='muted'>Đang tải dữ liệu...</p>
          ) : isEditing ? (
            <form className='health-form' onSubmit={handleHealthSubmit}>
              {/* Step Progress Indicator */}
              <div className='step-wizard'>
                <div className='step-progress'>
                  <div
                    className='step-progress-bar'
                    style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                  />
                  <div
                    className={`step-item ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}
                  >
                    <div className='step-circle'>1</div>
                    <span className='step-label'>Thông tin cơ bản</span>
                  </div>
                  <div
                    className={`step-item ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}
                  >
                    <div className='step-circle'>2</div>
                    <span className='step-label'>Cường độ tập luyện</span>
                  </div>
                  <div className={`step-item ${currentStep >= 3 ? 'active' : ''}`}>
                    <div className='step-circle'>3</div>
                    <span className='step-label'>Xác nhận</span>
                  </div>
                </div>
              </div>

              {/* Step Content */}
              <div className='step-content'>
                {currentStep === 1 && (
                  <div className='step-field-group'>
                    <div className='step-field'>
                      <label htmlFor='weightKg'>Cân nặng của bạn</label>
                      <p className='step-field-description'>Nhập cân nặng hiện tại (kg)</p>
                      <input
                        id='weightKg'
                        name='weightKg'
                        type='number'
                        min='1'
                        step='0.1'
                        value={healthForm.weightKg}
                        onChange={handleHealthChange}
                        required
                        placeholder='Ví dụ: 70'
                        autoFocus
                      />
                    </div>

                    <div className='step-field'>
                      <label htmlFor='heightM'>Chiều cao của bạn</label>
                      <p className='step-field-description'>Nhập chiều cao (mét)</p>
                      <input
                        id='heightM'
                        name='heightM'
                        type='number'
                        min='0.5'
                        max='2.5'
                        step='0.01'
                        value={healthForm.heightM}
                        onChange={handleHealthChange}
                        required
                        placeholder='Ví dụ: 1.75'
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className='step-field-group'>
                    <div className='step-field'>
                      <label htmlFor='activityFactor'>Cường độ tập luyện</label>
                      <p className='step-field-description'>Bạn tập luyện thường xuyên như thế nào?</p>
                      <select
                        id='activityFactor'
                        name='activityFactor'
                        value={healthForm.activityFactor}
                        onChange={handleHealthChange}
                        autoFocus
                      >
                        <option value='1.2'>Ít vận động (ít hoặc không tập)</option>
                        <option value='1.375'>Vận động nhẹ (1-3 ngày/tuần)</option>
                        <option value='1.55'>Vận động vừa phải (3-5 ngày/tuần)</option>
                        <option value='1.725'>Vận động nhiều (6-7 ngày/tuần)</option>
                        <option value='1.9'>Vận động rất nhiều (2 lần/ngày)</option>
                      </select>
                    </div>

                    <div className='step-field'>
                      <label htmlFor='practiceLevel'>Mức độ vận động</label>
                      <p className='step-field-description'>Trình độ tập luyện của bạn</p>
                      <select
                        id='practiceLevel'
                        name='practiceLevel'
                        value={healthForm.practiceLevel}
                        onChange={handleHealthChange}
                      >
                        <option value='NEWBIE'>Bắt đầu (5-15 phút/buổi)</option>
                        <option value='EASY'>Dễ (15-30 phút/buổi)</option>
                        <option value='MEDIUM'>Trung cấp (30-45 phút/buổi)</option>
                        <option value='HARD'>Cao cấp (45-60 phút/buổi)</option>
                        <option value='PRO'>Chuyên nghiệp (&gt;60 phút/buổi)</option>
                      </select>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className='step-field-group'>
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px', color: '#1f2937' }}>
                        Xác nhận thông tin
                      </h3>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px',
                          background: '#f9fafb',
                          padding: '24px',
                          borderRadius: '16px',
                          border: '1px solid #e5e7eb'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '12px 0',
                            borderBottom: '1px solid #e5e7eb'
                          }}
                        >
                          <span style={{ color: '#6b7280', fontWeight: 500 }}>Cân nặng:</span>
                          <strong style={{ color: '#1f2937' }}>{healthForm.weightKg} kg</strong>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '12px 0',
                            borderBottom: '1px solid #e5e7eb'
                          }}
                        >
                          <span style={{ color: '#6b7280', fontWeight: 500 }}>Chiều cao:</span>
                          <strong style={{ color: '#1f2937' }}>{healthForm.heightM} m</strong>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '12px 0',
                            borderBottom: '1px solid #e5e7eb'
                          }}
                        >
                          <span style={{ color: '#6b7280', fontWeight: 500 }}>Cường độ:</span>
                          <strong style={{ color: '#1f2937' }}>
                            {getActivityLabel(parseFloat(healthForm.activityFactor))}
                          </strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                          <span style={{ color: '#6b7280', fontWeight: 500 }}>Mức độ:</span>
                          <strong style={{ color: '#1f2937' }}>
                            {getPracticeLevelLabel(healthForm.practiceLevel)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step Actions */}
              <div className='step-actions'>
                {currentStep > 1 ? (
                  <button
                    type='button'
                    className='btn-secondary'
                    onClick={() => setCurrentStep(currentStep - 1)}
                    disabled={healthSaving}
                  >
                    Quay lại
                  </button>
                ) : (
                  <button
                    type='button'
                    className='btn-secondary'
                    onClick={() => {
                      setIsEditing(false)
                      setCurrentStep(1)
                      setHealthError(null)
                      setHealthSuccess(null)
                      if (healthMetrics) {
                        setHealthForm({
                          weightKg: healthMetrics.weightKg ? healthMetrics.weightKg.toString() : '',
                          heightM: healthMetrics.heightM ? healthMetrics.heightM.toString() : '',
                          activityFactor: healthMetrics.activityFactor
                            ? healthMetrics.activityFactor.toString()
                            : '1.55',
                          practiceLevel: healthMetrics.practiceLevel || 'MEDIUM'
                        })
                      }
                    }}
                    disabled={healthSaving}
                  >
                    Hủy
                  </button>
                )}

                {currentStep < totalSteps ? (
                  <button
                    type='button'
                    className='btn-primary'
                    onClick={() => {
                      if (currentStep === 1) {
                        if (!healthForm.weightKg || !healthForm.heightM) {
                          setHealthError('Vui lòng nhập đầy đủ thông tin')
                          return
                        }
                      }
                      setHealthError(null)
                      setCurrentStep(currentStep + 1)
                    }}
                  >
                    Tiếp theo
                  </button>
                ) : (
                  <button type='submit' className='btn-primary' disabled={healthSaving}>
                    {healthSaving ? 'Đang lưu...' : 'Hoàn thành'}
                  </button>
                )}
              </div>

              {healthError && (
                <p className='health-status error' style={{ textAlign: 'center', marginTop: '16px' }}>
                  {healthError}
                </p>
              )}
              {healthSuccess && (
                <p className='health-status success' style={{ textAlign: 'center', marginTop: '16px' }}>
                  {healthSuccess}
                </p>
              )}
            </form>
          ) : (
            <>
              {healthMetrics ? (
                <div className='health-result'>
                  <h3>Chỉ số sức khoẻ của bạn</h3>
                  <div className='health-result-grid'>
                    <div className='health-result-item'>
                      <span>Cân nặng</span>
                      <strong>{healthMetrics.weightKg ? `${healthMetrics.weightKg} kg` : '—'}</strong>
                    </div>
                    <div className='health-result-item'>
                      <span>Chiều cao</span>
                      <strong>{healthMetrics.heightM ? `${healthMetrics.heightM} m` : '—'}</strong>
                    </div>
                    <div className='health-result-item'>
                      <span>BMI</span>
                      <strong>{healthMetrics.bmi ? healthMetrics.bmi.toFixed(2) : '—'}</strong>
                    </div>
                    <div className='health-result-item'>
                      <span>Đánh giá</span>
                      <strong>{healthMetrics.assessment || '—'}</strong>
                    </div>
                    <div className='health-result-item'>
                      <span>TDEE (kcal)</span>
                      <strong>
                        {healthMetrics.dailyCalories ? `${Math.round(healthMetrics.dailyCalories)} kcal` : '—'}
                      </strong>
                    </div>
                    <div className='health-result-item'>
                      <span>Cường độ</span>
                      <strong>
                        {healthMetrics.activityFactor ? getActivityLabel(healthMetrics.activityFactor) : '—'}
                      </strong>
                    </div>
                    <div className='health-result-item'>
                      <span>Mức độ</span>
                      <strong>
                        {healthMetrics.practiceLevel ? getPracticeLevelLabel(healthMetrics.practiceLevel) : '—'}
                      </strong>
                    </div>
                  </div>
                </div>
              ) : (
                <p className='muted'>Bạn chưa có dữ liệu chỉ số sức khoẻ. Hãy nhập thông tin để bắt đầu.</p>
              )}

              {/* Warning Notice */}
              <div className='health-warning-notice'>
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                  <path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' />
                  <line x1='12' y1='9' x2='12' y2='13' />
                  <line x1='12' y1='17' x2='12.01' y2='17' />
                </svg>
                <span>Lưu ý: Sau khi nhập chỉ số BMI, bạn không thể chỉnh sửa.</span>
              </div>

              <div className='health-actions'>
                <button type='button' className='btn-primary' onClick={() => setIsEditing(true)}>
                  Thêm mới
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className='health-tab-content'>
          {historyLoading ? (
            <p className='muted'>Đang tải lịch sử...</p>
          ) : (
            <div className='history-list-container'>
              <h3>Lịch sử đo lường</h3>
              {bmiHistory.length === 0 ? (
                <p className='muted'>Chưa có lịch sử đo lường nào.</p>
              ) : (
                <div className='history-records'>
                  {bmiHistory.map((record) => (
                    <div
                      key={record.bmiRecordId}
                      className={`history-record-card ${selectedRecord?.bmiRecordId === record.bmiRecordId ? 'selected' : ''}`}
                      onClick={() => handleRecordClick(record)}
                    >
                      <div className='record-date'>{formatDate(record.measuredAt)}</div>
                      <div className='record-summary'>
                        <span className='record-bmi'>BMI: {record.bmi.toFixed(2)}</span>
                        <span className='record-assessment'>{record.assessment}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sidebar Modal */}
      {selectedRecord && (
        <>
          <div className='health-sidebar-overlay' onClick={closeSidebar} />
          <div className='health-sidebar'>
            <div className='sidebar-header'>
              <h2>Chi tiết đo lường</h2>
              <button className='sidebar-close' onClick={closeSidebar}>
                ×
              </button>
            </div>

            <div className='sidebar-tabs'>
              <button
                className={`sidebar-tab ${detailTab === 'info' ? 'active' : ''}`}
                onClick={() => setDetailTab('info')}
              >
                Thông tin
              </button>
              <button
                className={`sidebar-tab ${detailTab === 'goals' ? 'active' : ''}`}
                onClick={() => setDetailTab('goals')}
              >
                Mục tiêu
              </button>
            </div>

            <div className='sidebar-content'>
              {detailTab === 'info' ? (
                <>
                  <div className='detail-date'>{formatDate(selectedRecord.measuredAt)}</div>
                  <div className='health-result-grid'>
                    <div className='health-result-item'>
                      <span>Cân nặng</span>
                      <strong>{selectedRecord.weightKg} kg</strong>
                    </div>
                    <div className='health-result-item'>
                      <span>Chiều cao</span>
                      <strong>{(selectedRecord.heightCm / 100).toFixed(2)} m</strong>
                    </div>
                    <div className='health-result-item'>
                      <span>BMI</span>
                      <strong>{selectedRecord.bmi.toFixed(2)}</strong>
                    </div>
                    <div className='health-result-item'>
                      <span>Đánh giá</span>
                      <strong>{selectedRecord.assessment}</strong>
                    </div>
                    {selectedRecord.dailyCalories && (
                      <div className='health-result-item'>
                        <span>TDEE (kcal)</span>
                        <strong>{Math.round(selectedRecord.dailyCalories)} kcal</strong>
                      </div>
                    )}
                    {selectedRecord.activityFactor && (
                      <div className='health-result-item'>
                        <span>Cường độ</span>
                        <strong>{getActivityLabel(selectedRecord.activityFactor)}</strong>
                      </div>
                    )}
                    {selectedRecord.practiceLevel && (
                      <div className='health-result-item'>
                        <span>Mức độ</span>
                        <strong>{getPracticeLevelLabel(selectedRecord.practiceLevel)}</strong>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className='goals-content'>
                  {selectedRecord.goal && Object.keys(selectedRecord.goal).length > 0 ? (
                    <div className='goals-list'>
                      {Object.entries(selectedRecord.goal).map(([key, value]) => {
                        // Vietnamese label mapping
                        const labelMap: Record<string, string> = {
                          PlanId: 'ID Kế hoạch',
                          Assessment: 'Đánh giá',
                          WeeklyTargetKg: 'Mục tiêu tuần (kg)',
                          ExercisePerWeek: 'Số buổi tập/tuần',
                          NextGoal: 'Mục tiêu tiếp theo',
                          Calories: 'Calories (kcal)',
                          Protein: 'Protein (g)',
                          Carbs: 'Carbs (g)',
                          Fat: 'Fat (g)',
                          Tdee: 'TDEE (kcal)',
                          Plan: 'Kế hoạch',
                          Nutrition: 'Dinh dưỡng'
                        }

                        // Format number helper
                        const formatNumber = (val: any): string => {
                          const num = parseFloat(val)
                          if (isNaN(num)) return String(val)
                          return num.toFixed(1)
                        }

                        // If value is an object, render its properties individually
                        if (value && typeof value === 'object' && !Array.isArray(value)) {
                          return Object.entries(value as Record<string, any>).map(([subKey, subValue]) => {
                            let displayValue = subValue === null || subValue === undefined ? '—' : String(subValue)

                            // Format numbers for nutrition fields
                            if (['Calories', 'Protein', 'Carbs', 'Fat', 'WeeklyTargetKg'].includes(subKey)) {
                              displayValue = formatNumber(subValue)
                            }

                            return (
                              <div key={`${key}-${subKey}`} className='goal-item'>
                                <span className='goal-label'>{labelMap[subKey] || subKey}</span>
                                <strong className='goal-value'>{displayValue}</strong>
                              </div>
                            )
                          })
                        }

                        // For primitives
                        let displayValue: string
                        if (value === null || value === undefined) {
                          displayValue = '—'
                        } else if (Array.isArray(value)) {
                          displayValue = value.join(', ')
                        } else if (key === 'Tdee' || key === 'tdee') {
                          displayValue = formatNumber(value)
                        } else {
                          displayValue = String(value)
                        }

                        return (
                          <div key={key} className='goal-item'>
                            <span className='goal-label'>{labelMap[key] || key}</span>
                            <strong className='goal-value'>{displayValue}</strong>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className='muted'>Không có mục tiêu được thiết lập.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

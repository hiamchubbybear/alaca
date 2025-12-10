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

export function HealthMetricsSection({
  healthMetrics,
  onMetricsUpdated,
  healthLoading = false,
  initialIsEditing = false,
  healthNotice
}: HealthMetricsSectionProps) {
  const [isEditing, setIsEditing] = useState(initialIsEditing)
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

  useEffect(() => {
    if (initialIsEditing || healthNotice) {
      setIsEditing(true)
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
        // Don't return yet, ensure saving is false at end
        setHealthSaving(false)
        return
      }

      setHealthSuccess('Cập nhật chỉ số sức khoẻ thành công!')

      // Reload full metrics
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
      setTimeout(() => setHealthSuccess(null), 3000)
    } catch (error) {
      console.error(error)
      setHealthError('Không thể lưu chỉ số sức khoẻ. Vui lòng thử lại.')
    } finally {
      setHealthSaving(false)
    }
  }

  return (
    <div className='health-metrics'>
      <h1 className='main-content-title'>Chỉ Số Sức Khoẻ</h1>
      <p className='main-content-subtitle'>
        {isEditing
          ? 'Nhập cân nặng, chiều cao và mức vận động để lưu vào hồ sơ.'
          : 'Xem và quản lý chỉ số sức khoẻ của bạn.'}
      </p>
      {healthNotice && <p className='health-status notice'>{healthNotice}</p>}

      {healthLoading ? (
        <p className='muted'>Đang tải dữ liệu...</p>
      ) : isEditing ? (
        <form className='health-form' onSubmit={handleHealthSubmit}>
          <div className='health-grid'>
            <div className='health-field'>
              <label htmlFor='weightKg'>Cân nặng (kg)</label>
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
              />
            </div>

            <div className='health-field'>
              <label htmlFor='heightM'>Chiều cao (m)</label>
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

            <div className='health-field'>
              <label htmlFor='activityFactor'>Cường độ tập luyện</label>
              <select
                id='activityFactor'
                name='activityFactor'
                value={healthForm.activityFactor}
                onChange={handleHealthChange}
              >
                <option value='1.2'>Ít vận động</option>
                <option value='1.375'>Vận động nhẹ</option>
                <option value='1.55'>Vận động vừa phải</option>
                <option value='1.725'>Vận động nhiều</option>
                <option value='1.9'>Vận động rất nhiều</option>
              </select>
            </div>

            <div className='health-field'>
              <label htmlFor='practiceLevel'>Mức độ vận động</label>
              <select
                id='practiceLevel'
                name='practiceLevel'
                value={healthForm.practiceLevel}
                onChange={handleHealthChange}
              >
                <option value='PRO'>Chuyên nghiệp</option>
                <option value='HARD'>Cao cấp</option>
                <option value='MEDIUM'>Trung cấp</option>
                <option value='EASY'>Dễ</option>
                <option value='NEWBIE'>Bắt đầu</option>
              </select>
            </div>
          </div>

          <div className='health-actions'>
            <button type='submit' className='btn-primary' disabled={healthSaving}>
              {healthSaving ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button
              type='button'
              className='btn-secondary'
              onClick={() => {
                setIsEditing(false)
                setHealthError(null)
                setHealthSuccess(null)
                // Reset form to latest metrics
                if (healthMetrics) {
                  setHealthForm({
                    weightKg: healthMetrics.weightKg ? healthMetrics.weightKg.toString() : '',
                    heightM: healthMetrics.heightM ? healthMetrics.heightM.toString() : '',
                    activityFactor: healthMetrics.activityFactor ? healthMetrics.activityFactor.toString() : '1.55',
                    practiceLevel: healthMetrics.practiceLevel || 'MEDIUM'
                  })
                }
              }}
              disabled={healthSaving}
            >
              Hủy
            </button>
            {healthError && <span className='health-status error'>{healthError}</span>}
            {healthSuccess && <span className='health-status success'>{healthSuccess}</span>}
          </div>
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
                  <strong>{healthMetrics.activityFactor}</strong>
                </div>
                <div className='health-result-item'>
                  <span>Mức độ</span>
                  <strong>{healthMetrics.practiceLevel}</strong>
                </div>
              </div>
            </div>
          ) : (
            <p className='muted'>Bạn chưa có dữ liệu chỉ số sức khoẻ. Hãy nhập thông tin để bắt đầu.</p>
          )}
          <div className='health-actions'>
            <button type='button' className='btn-primary' onClick={() => setIsEditing(true)}>
              Chỉnh sửa
            </button>
          </div>
        </>
      )}
    </div>
  )
}

import { useState } from 'react'
import { getBmiRecord } from '../../../services/bmiService'
import type { PracticeLevelOption } from '../types'

type Props = {
  onComplete: () => void
}

const practiceLevels: PracticeLevelOption[] = [
  {
    id: 'PRO',
    title: 'Chuyên nghiệp',
    description: 'Cấp độ vận động viên chuyên nghiệp',
    timeRange: '> 1 giờ/ngày'
  },
  {
    id: 'HARD',
    title: 'Nặng',
    description: 'Người đam mê thể hình nâng cao',
    timeRange: '45p → 1h'
  },
  {
    id: 'MEDIUM',
    title: 'Trung bình',
    description: 'Lịch tập luyện đều đặn',
    timeRange: '30p → 45p'
  },
  {
    id: 'EASY',
    title: 'Dễ',
    description: 'Bắt đầu với thể hình',
    timeRange: '15p → 30p'
  },
  {
    id: 'NEWBIE',
    title: 'Mới bắt đầu',
    description: 'Vừa bắt đầu hành trình',
    timeRange: '5p → 15p'
  }
]

export function TrainingExperienceStep({ onComplete }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSelect = async () => {
    try {
      setLoading(true)
      setError(null)

      // Verify BMI record was created by calling /bmi/me
      const res = await getBmiRecord()
      if (!res.success) {
        setError('Không thể xác minh hồ sơ. Vui lòng thử lại.')
        return
      }

      // Complete onboarding
      onComplete()
    } catch {
      setError('Không thể kết nối máy chủ. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="onboarding-step">
      <div className="onboarding-header">
        <h2>Chọn Kinh Nghiệm Tập Luyện</h2>
        <p className="onboarding-subtitle">
          Giúp chúng tôi tùy chỉnh kế hoạch tập luyện phù hợp với trình độ hiện tại.
        </p>
      </div>

      {error && <p className="auth-error">{error}</p>}

      <div className="activity-grid">
        {practiceLevels.map((level) => (
          <button
            key={level.id}
            type="button"
            className="activity-card"
            onClick={() => handleSelect()}
            disabled={loading}
          >
            <h3>{level.title}</h3>
            <p className="activity-description">{level.description}</p>
            <span className="activity-pal">{level.timeRange}</span>
          </button>
        ))}
      </div>

      {loading && <p className="onboarding-loading">Đang thiết lập hồ sơ...</p>}
    </div>
  )
}

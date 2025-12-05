import type { ActivityLevelOption } from '../types'

type Props = {
  onNext: () => void
}

const activityLevels: ActivityLevelOption[] = [
  {
    id: 'sedentary',
    title: 'Ít vận động',
    description: 'Ít hoặc không tập luyện',
    pal: 1.2
  },
  {
    id: 'lightly_active',
    title: 'Vận động nhẹ',
    description: 'Tập nhẹ  1-3 ngày/tuần',
    pal: 1.375
  },
  {
    id: 'moderately_active',
    title: 'Vận động trung bình',
    description: 'Tập trung bình 3-5 ngày/tuần',
    pal: 1.55
  },
  {
    id: 'very_active',
    title: 'Rất vận động',
    description: 'Tập nặng 6-7 ngày/tuần',
    pal: 1.725
  },
  {
    id: 'super_active',
    title: 'Siêu vận động',
    description: 'Tập rất nặng & công việc thể lực',
    pal: 1.9
  }
]

export function ActivityLevelStep({ onNext }: Props) {
  return (
    <div className="onboarding-step">
      <div className="onboarding-header">
        <h2>Chọn Mức Độ Vận Động</h2>
        <p className="onboarding-subtitle">
          Điều này giúp chúng tôi tính toán Tổng Lượng Năng Lượng Tiêu Thụ Hàng Ngày (TDEE).
        </p>
      </div>

      <div className="activity-grid">
        {activityLevels.map((level) => (
          <button
            key={level.id}
            type="button"
            className="activity-card"
            onClick={() => onNext()}
          >
            <h3>{level.title}</h3>
            <p className="activity-description">{level.description}</p>
            <span className="activity-pal">PAL {level.pal}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

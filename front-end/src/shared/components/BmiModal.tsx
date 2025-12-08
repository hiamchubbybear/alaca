import { useState } from 'react'

type Props = {
  open: boolean
  onClose: () => void
}

function getBmiStatus(bmi: number) {
  if (bmi < 18.5) {
    return {
      status: 'Thiếu cân',
      color: '#3b82f6',
      advice: 'Bạn đang thiếu cân. Hãy tăng cường dinh dưỡng và tập luyện để xây dựng cơ bắp khỏe mạnh.',
      tips: [
        'Ăn nhiều protein để xây dựng cơ bắp',
        'Tập luyện sức bền kết hợp với tạ',
        'Ăn nhiều bữa nhỏ trong ngày'
      ]
    }
  } else if (bmi >= 18.5 && bmi < 25) {
    return {
      status: 'Bình thường',
      color: '#10b981',
      advice: 'Chúc mừng! Chỉ số BMI của bạn ở mức lý tưởng. Hãy duy trì lối sống lành mạnh này.',
      tips: [
        'Duy trì chế độ ăn cân bằng',
        'Tập luyện đều đặn 3-5 lần/tuần',
        'Ngủ đủ giấc và quản lý stress'
      ]
    }
  } else if (bmi >= 25 && bmi < 30) {
    return {
      status: 'Thừa cân',
      color: '#f59e0b',
      advice: 'Bạn đang thừa cân nhẹ. Hãy điều chỉnh chế độ ăn và tăng cường vận động để cải thiện sức khỏe.',
      tips: [
        'Giảm calories tiêu thụ mỗi ngày',
        'Tập cardio 30-45 phút/ngày',
        'Uống nhiều nước và hạn chế đường'
      ]
    }
  } else {
    return {
      status: 'Béo phì',
      color: '#ef4444',
      advice: 'Bạn đang béo phì. Hãy tham khảo ý kiến bác sĩ và bắt đầu chương trình giảm cân ngay hôm nay.',
      tips: [
        'Tham khảo chuyên gia dinh dưỡng',
        'Bắt đầu với vận động nhẹ nhàng',
        'Theo dõi calories và cân nặng hàng ngày'
      ]
    }
  }
}

export function BmiModal({ open, onClose }: Props) {
  const [height, setHeight] = useState<string>('')
  const [weight, setWeight] = useState<string>('')
  const [result, setResult] = useState<number | null>(null)

  if (!open) {
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!height || !weight) {
      return
    }

    const h = Number.parseFloat(height)
    const w = Number.parseFloat(weight)

    if (Number.isNaN(h) || Number.isNaN(w) || h <= 0 || w <= 0) {
      return
    }

    const bmi = w / (h * h)
    setResult(Number(bmi.toFixed(2)))
  }

  const bmiStatus = result ? getBmiStatus(result) : null

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div
        className={`bmi-modal-wide ${result ? 'has-results' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bmi-modal-header-minimal">
          <button type="button" className="auth-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className={`bmi-modal-content ${result ? 'split-layout' : ''}`}>
          <div className="bmi-form-section">
            <p className="auth-modal-subtitle">
              Nhập thông tin để tính chỉ số BMI của bạn
            </p>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-form-group">
                <label htmlFor="bmi-height">Chiều cao (m)</label>
                <input
                  id="bmi-height"
                  type="number"
                  step="0.01"
                  placeholder="Ví dụ: 1.70"
                  className="auth-input"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  required
                />
              </div>
              <div className="auth-form-group">
                <label htmlFor="bmi-weight">Cân nặng (kg)</label>
                <input
                  id="bmi-weight"
                  type="number"
                  step="0.1"
                  placeholder="Ví dụ: 65"
                  className="auth-input"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="auth-submit-btn">
                Tính BMI của bạn
              </button>
            </form>
          </div>

          {result && bmiStatus && (
            <div className="bmi-results-section">
              <div className="bmi-score-card" style={{ borderColor: bmiStatus.color }}>
                <div className="bmi-value" style={{ color: bmiStatus.color }}>
                  {result}
                </div>
                <div className="bmi-status" style={{ color: bmiStatus.color }}>
                  {bmiStatus.status}
                </div>
              </div>

              <div className="bmi-info-card">
                <h3>Đánh giá</h3>
                <p>{bmiStatus.advice}</p>
              </div>

              <div className="bmi-info-card">
                <h3>Lời khuyên</h3>
                <ul className="bmi-tips-list">
                  {bmiStatus.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>

              <div className="bmi-cta-card">
                <h3>Theo dõi tiến độ sức khỏe</h3>
                <p>
                  Đăng nhập để lưu kết quả BMI, theo dõi sự thay đổi theo thời gian,
                  và nhận kế hoạch tập luyện phù hợp với mục tiêu của bạn.
                </p>
                <button
                  className="bmi-cta-btn"
                  onClick={() => {
                    onClose()
                    // Will redirect to login
                  }}
                >
                  Đăng nhập ngay
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

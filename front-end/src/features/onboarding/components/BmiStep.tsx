import type React from 'react'
import { useState } from 'react'
// Mock function - no service needed
const calculateBmi = (height: number, weight: number) => (weight / (height * height)).toFixed(1)


type Props = {
  onNext: () => void
}

export function BmiStep({ onNext }: Props) {
  const [heightCm, setHeightCm] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [result, setResult] = useState<{ bmi: string; assessment: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)

    const height = parseFloat(heightCm)
    const weight = parseFloat(weightKg)

    if (!height || !weight || height <= 0 || weight <= 0) {
      setError('Vui lòng nhập số dương hợp lệ cho chiều cao và cân nặng.')
      return
    }

    try {
      setLoading(true)
      // Perform BMI calculation directly
      const bmiValue = calculateBmi(height, weight)

      let assessment = '';
      const bmiNum = parseFloat(bmiValue);
      if (bmiNum < 18.5) {
        assessment = 'Thiếu cân';
      } else if (bmiNum >= 18.5 && bmiNum < 24.9) {
        assessment = 'Bình thường';
      } else if (bmiNum >= 25 && bmiNum < 29.9) {
        assessment = 'Thừa cân';
      } else {
        assessment = 'Béo phì';
      }

      setResult({
        bmi: bmiValue,
        assessment: assessment
      })
    } catch (err) {
      setError('Không thể tính BMI. Vui lòng thử lại.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    onNext()
  }

  return (
    <div className="onboarding-step">
      <div className="onboarding-header">
        <h2>Tính Chỉ Số BMI</h2>
        <p className="onboarding-subtitle">
          Hãy bắt đầu bằng việc tính chỉ số khối cơ thể để cá nhân hóa kế hoạch thể hình.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-form-group">
          <label htmlFor="bmi-height">Chiều cao (cm)</label>
          <input
            id="bmi-height"
            type="number"
            step="0.1"
            min="0"
            placeholder="ví dụ: 170"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            required
          />
        </div>
        <div className="auth-form-group">
          <label htmlFor="bmi-weight">Cân nặng (kg)</label>
          <input
            id="bmi-weight"
            type="number"
            step="0.1"
            min="0"
            placeholder="ví dụ: 65"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? 'Đang tính...' : 'Tính BMI'}
        </button>
      </form>

      {error && <p className="auth-error">{error}</p>}

      {result && !error && (
        <div className="bmi-result-card">
          <h3>Kết Quả BMI Của Bạn</h3>
          <div className="bmi-value">{result.bmi}</div>
          <div className="bmi-assessment">{result.assessment}</div>
          <button type="button" className="auth-submit-btn" onClick={handleNext}>
            Tiếp tục
          </button>
        </div>
      )}
    </div>
  )
}

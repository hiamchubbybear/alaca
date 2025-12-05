import type React from 'react'
import { useState } from 'react'

type Props = {
  open: boolean
  onClose: () => void
}

export function BmiModal({ open, onClose }: Props) {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)

    const h = parseFloat(height)
    const w = parseFloat(weight)

    if (!h || !w || h <= 0 || w <= 0) {
      setError('Vui lòng nhập số dương hợp lệ cho chiều cao và cân nặng.')
      return
    }

    const bmi = w / (h * h)
    setResult(Number(bmi.toFixed(2)))
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div
        className="auth-modal"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div className="auth-modal-header">
          <h2>Tính Chỉ Số BMI</h2>
          <button type="button" className="auth-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <p className="auth-modal-subtitle">
          Nhập chiều cao (mét) và cân nặng (kg) để ước tính Chỉ Số Khối Cơ Thể.
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label htmlFor="bmi-height">Chiều cao (m)</label>
            <input
              id="bmi-height"
              type="number"
              step="0.01"
              min="0"
              placeholder="ví dụ: 1.70"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
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
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-submit-btn">
            Tìm BMI của bạn
          </button>
        </form>
        {error && <p className="auth-error">{error}</p>}
        {result !== null && !error && (
          <p className="bmi-result">
            BMI của bạn là <span>{result}</span>
          </p>
        )}
      </div>
    </div>
  )
}

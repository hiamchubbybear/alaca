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
      setError('Please enter valid positive numbers for height and weight.')
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
          <h2>Calculate your BMI</h2>
          <button type="button" className="auth-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <p className="auth-modal-subtitle">
          Enter your height in meters and weight in kilograms to estimate your Body Mass Index.
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label htmlFor="bmi-height">Height (m)</label>
            <input
              id="bmi-height"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 1.70"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
              required
            />
          </div>
          <div className="auth-form-group">
            <label htmlFor="bmi-weight">Weight (kg)</label>
            <input
              id="bmi-weight"
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 65"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-submit-btn">
            Find your BMI
          </button>
        </form>
        {error && <p className="auth-error">{error}</p>}
        {result !== null && !error && (
          <p className="bmi-result">
            Your BMI is <span>{result}</span>
          </p>
        )}
      </div>
    </div>
  )
}



import { FormEvent, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL ?? 'https://alaca.onrender.com'

type LoginPageProps = {
  onLoginSuccess: (accessToken: string) => void
}

type LoginResponse = {
  success: boolean
  message?: string
  data?: {
    accessToken: string
  }
}

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M2.5 12s4-7 9.5-7 9.5 7 9.5 7-4 7-9.5 7S2.5 12 2.5 12Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3.25" stroke="currentColor" strokeWidth="1.5" />
    {!open && (
      <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    )}
  </svg>
)

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const successTimeoutRef = useRef<number | null>(null)
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current)
      }
    }
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const json = (await response.json()) as LoginResponse

      if (!response.ok || !json.success || !json.data?.accessToken) {
        throw new Error(json.message || 'Invalid email or password.')
      }

      setSuccessMessage('Logged in successfully.')
      successTimeoutRef.current = window.setTimeout(() => {
        onLoginSuccess(json.data!.accessToken)
      }, 800)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to log in. Please try again.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-layout__panel auth-layout__panel--left">
        <div className="auth-layout__brand">
          <span className="auth-logo">A</span>
          <div>
            <p className="auth-logo__title">Alaca</p>
            <p className="auth-logo__subtitle">Personal fitness & nutrition planner</p>
          </div>
        </div>

        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-subheading">
          Log in to track your workouts, follow your nutrition plan and stay on top of your progress.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email" className="field__label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="field__input"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="field">
            <label htmlFor="password" className="field__label">
              Password
            </label>
            <div className="field__password-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="field__input field__input--password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                  <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}
          {successMessage && <p className="auth-success">{successMessage}</p>}

          <button type="submit" className="button button--primary" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="auth-helper">
            Don&apos;t have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </div>

        <div className="auth-layout__panel auth-layout__panel--right">
          <div className="auth-visual">
            <div className="auth-visual__card auth-visual__card--primary">
              <p className="auth-visual__metric-label">Today&apos;s calories</p>
              <p className="auth-visual__metric-value">1,780 kcal</p>
              <p className="auth-visual__metric-footnote">On track for your goal</p>
            </div>

            <div className="auth-visual__card auth-visual__card--secondary">
              <p className="auth-visual__metric-label">This week</p>
              <p className="auth-visual__metric-value">4 / 5 workouts</p>
              <p className="auth-visual__metric-footnote">Keep the streak alive 🔥</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



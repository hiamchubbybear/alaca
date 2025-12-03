import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL ?? 'https://alaca.onrender.com'

type SignUpResponse = {
  success: boolean
  message?: string
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

export function SignUpPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!username || !email || !password) {
      setError('Please fill in username, email and password.')
      return
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    const strongPassword = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
    if (!strongPassword.test(password)) {
      setError('Password must be at least 8 characters and include letters and numbers.')
      return
    }

    setIsSubmitting(true)
    try {
      // Backend expects CreateAccountRequestDto(username, email, password) at POST /account
      const response = await fetch(`${API_URL}/account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      })

      const json = (await response.json()) as SignUpResponse

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Unable to create account.')
      }

      setSuccessMessage('Account created successfully. Redirecting you to sign in…')
      // Redirect to login after a short delay so user can see the message
      setTimeout(() => {
        navigate('/login')
      }, 1200)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign up. Please try again.'
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
              <p className="auth-logo__subtitle">Create your personal fitness account</p>
            </div>
          </div>

          <h1 className="auth-heading">Create an account</h1>
          <p className="auth-subheading">
            Start tracking your workouts, nutrition and progress in one beautiful dashboard.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="username" className="field__label">
                Username
              </label>
              <input
                id="username"
                className="field__input"
                placeholder="yourname"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="field">
              <label htmlFor="email" className="field__label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="field__input"
                placeholder="you@example.com"
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
                  placeholder="At least 8 characters, letters & numbers"
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
              {isSubmitting ? 'Creating account…' : 'Sign up'}
            </button>

            <p className="auth-helper">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </form>
        </div>

        <div className="auth-layout__panel auth-layout__panel--right">
          <div className="auth-visual">
            <div className="auth-visual__card auth-visual__card--primary">
              <p className="auth-visual__metric-label">Smart planning</p>
              <p className="auth-visual__metric-value">Workout + Nutrition</p>
              <p className="auth-visual__metric-footnote">Designed around your goals</p>
            </div>

            <div className="auth-visual__card auth-visual__card--secondary">
              <p className="auth-visual__metric-label">Stay consistent</p>
              <p className="auth-visual__metric-value">Streaks & challenges</p>
              <p className="auth-visual__metric-footnote">Turn effort into habits</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



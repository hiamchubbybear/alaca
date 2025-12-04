import type React from 'react'
import { useState } from 'react'
import { login, registerUser } from '../apiClient'

export type AuthMode = 'login' | 'signup'

type Props = {
  open: boolean
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
  onClose: () => void
  onLoginSuccess: () => void
}

export function AuthModal({ open, mode, onModeChange, onClose, onLoginSuccess }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (mode === 'signup' && password !== confirm) {
      setError('Passwords do not match')
      return
    }

    try {
      setLoading(true)

      if (mode === 'login') {
        const res = await login(email, password)
        if (!res.success || !res.data || !(res as any).data.accessToken) {
          setError(res.message || 'Login failed')
          return
        }
        const token = (res as any).data.accessToken as string
        localStorage.setItem('accessToken', token)
        onLoginSuccess()
        onClose()
        return
      }

      // signup
      const username = name || email.split('@')[0]
      const res = await registerUser(username, email, password)
      if (!res.success) {
        setError(res.message || 'Sign up failed')
        return
      }

      // auto-login after signup
      const loginRes = await login(email, password)
      if (loginRes.success && (loginRes as any).data?.accessToken) {
        const token = (loginRes as any).data.accessToken as string
        localStorage.setItem('accessToken', token)
      }
      onLoginSuccess()
      onClose()
    } catch {
      setError('Unable to reach server. Please try again.')
    } finally {
      setLoading(false)
    }
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
          <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <button type="button" className="auth-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <p className="auth-modal-subtitle">
          {mode === 'login'
            ? 'Log in to access your personalized workouts and nutrition plans.'
            : 'Sign up to start your fitness journey with Alaca.'}
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="auth-form-group">
              <label htmlFor="auth-name">Full name</label>
              <input
                id="auth-name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
          )}
          <div className="auth-form-group">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="auth-form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {mode === 'signup' && (
            <div className="auth-form-group">
              <label htmlFor="auth-confirm">Confirm password</label>
              <input
                id="auth-confirm"
                type="password"
                placeholder="Repeat your password"
                required
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
              />
            </div>
          )}
          <button type="submit" className="auth-submit-btn">
            {loading
              ? mode === 'login'
                ? 'Logging in...'
                : 'Signing up...'
              : mode === 'login'
                ? 'Log In'
                : 'Sign Up'}
          </button>
        </form>
        {error && <p className="auth-error">{error}</p>}
        <div className="auth-switch">
          {mode === 'login' ? (
            <p>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => onModeChange('signup')}
                className="auth-switch-link"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onModeChange('login')}
                className="auth-switch-link"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}



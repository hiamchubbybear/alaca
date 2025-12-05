import type React from 'react'
import { useState } from 'react'
import { login, registerUser } from '../api/authApi'

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
      setError('Mật khẩu không khớp')
      return
    }

    try {
      setLoading(true)

      if (mode === 'login') {
        const res = await login(email, password)
        // Backend returns token in data.token (not data.accessToken)
        if (!res.success || !res.data || !(res as any).data.token) {
          setError(res.message || 'Đăng nhập thất bại')
          return
        }
        const token = (res as any).data.token as string
        localStorage.setItem('accessToken', token)
        onLoginSuccess()
        onClose()
        return
      }

      // signup
      const username = name || email.split('@')[0]
      const res = await registerUser(username, email, password)
      if (!res.success) {
        setError(res.message || 'Đăng ký thất bại')
        return
      }

      // auto-login after signup
      const loginRes = await login(email, password)
      if (loginRes.success && (loginRes as any).data?.token) {
        const token = (loginRes as any).data.token as string
        localStorage.setItem('accessToken', token)
      }
      onLoginSuccess()
      onClose()
    } catch {
      setError('Không thể kết nối máy chủ. Vui lòng thử lại.')
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
          <h2>{mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản'}</h2>
          <button type="button" className="auth-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <p className="auth-modal-subtitle">
          {mode === 'login'
            ? 'Đăng nhập để truy cập kế hoạch tập luyện và dinh dưỡng cá nhân hóa.'
            : 'Đăng ký để bắt đầu hành trình thể hình với Alaca.'}
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="auth-form-group">
              <label htmlFor="auth-name">Họ và tên</label>
              <input
                id="auth-name"
                type="text"
                placeholder="Nhập họ và tên của bạn"
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
            <label htmlFor="auth-password">Mật khẩu</label>
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
              <label htmlFor="auth-confirm">Xác nhận mật khẩu</label>
              <input
                id="auth-confirm"
                type="password"
                placeholder="Nhập lại mật khẩu"
                required
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
              />
            </div>
          )}
          <button type="submit" className="auth-submit-btn">
            {loading
              ? mode === 'login'
                ? 'Đang đăng nhập...'
                : 'Đang đăng ký...'
              : mode === 'login'
                ? 'Đăng Nhập'
                : 'Đăng Ký'}
          </button>
        </form>
        {error && <p className="auth-error">{error}</p>}
        <div className="auth-switch">
          {mode === 'login' ? (
            <p>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => onModeChange('signup')}
                className="auth-switch-link"
              >
                Đăng ký
              </button>
            </p>
          ) : (
            <p>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => onModeChange('login')}
                className="auth-switch-link"
              >
                Đăng nhập
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { forgotPassword } from '../api/accountApi'

type Props = {
  open: boolean
  onClose: () => void
}

export function ForgotPasswordModal({ open, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!email) {
      setError('Vui lòng nhập email')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ')
      return
    }

    setLoading(true)

    try {
      await forgotPassword(email)
      setSuccess(true)
      setEmail('')
    } catch (err: any) {
      // Backend always returns success for security
      // But if there's a network error, show it
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>Quên Mật Khẩu</h2>
          <button type="button" className="auth-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {success ? (
          <div className="auth-success-message">
            <p>
              ✓ Nếu email của bạn tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu.
              Vui lòng kiểm tra hộp thư của bạn.
            </p>
            <button
              type="button"
              className="auth-submit-btn"
              onClick={onClose}
              style={{ marginTop: '1rem' }}
            >
              Đóng
            </button>
          </div>
        ) : (
          <>
            <p className="auth-modal-subtitle">
              Nhập email của bạn để nhận link đặt lại mật khẩu
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-form-group">
                <label htmlFor="forgot-email">Email</label>
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Đang gửi...' : 'Gửi link đặt lại'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

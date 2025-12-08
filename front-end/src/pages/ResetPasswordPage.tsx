import { useEffect, useState } from 'react'
import { resetPassword } from '../shared/api/accountApi'

export function ResetPasswordPage() {
  const [token, setToken] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Extract token from URL
    const params = new URLSearchParams(window.location.search)
    const tokenParam = params.get('token')

    if (!tokenParam) {
      setError('Link không hợp lệ. Vui lòng yêu cầu link mới.')
    } else {
      setToken(tokenParam)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!token) {
      setError('Token không hợp lệ')
      return
    }

    if (!newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    setLoading(true)

    try {
      await resetPassword({
        token,
        newPassword,
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Đặt lại mật khẩu thất bại. Link có thể đã hết hạn.')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    window.location.href = '/'
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-card">
          <h1>Đặt Lại Mật Khẩu</h1>

          {success ? (
            <div className="reset-success">
              <div className="success-icon">✓</div>
              <h2>Đặt lại mật khẩu thành công!</h2>
              <p>Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ.</p>
              <button
                type="button"
                className="auth-submit-btn"
                onClick={handleBackToLogin}
              >
                Về trang đăng nhập
              </button>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <p className="auth-modal-subtitle">
                Nhập mật khẩu mới cho tài khoản của bạn
              </p>

              <div className="auth-form-group">
                <label htmlFor="new-password">Mật khẩu mới</label>
                <input
                  id="new-password"
                  type="password"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading || !token}
                  required
                />
              </div>

              <div className="auth-form-group">
                <label htmlFor="confirm-password">Xác nhận mật khẩu</label>
                <input
                  id="confirm-password"
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading || !token}
                  required
                />
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading || !token}
              >
                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>

              <button
                type="button"
                className="auth-link-btn"
                onClick={handleBackToLogin}
                style={{ marginTop: '1rem' }}
              >
                Quay lại trang chủ
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

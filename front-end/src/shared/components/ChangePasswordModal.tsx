import { useState } from 'react'
import { changePassword } from '../api/accountApi'

type Props = {
  open: boolean
  onClose: () => void
}

export function ChangePasswordModal({ open, onClose }: Props) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
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

    if (currentPassword === newPassword) {
      setError('Mật khẩu mới phải khác mật khẩu hiện tại')
      return
    }

    setLoading(true)

    try {
      await changePassword({
        currentPassword,
        newPassword,
      })

      // Success
      alert('Đổi mật khẩu thành công!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>Đổi Mật Khẩu</h2>
          <button type="button" className="auth-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <p className="auth-modal-subtitle">
          Nhập mật khẩu hiện tại và mật khẩu mới để thay đổi
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label htmlFor="current-password">Mật khẩu hiện tại</label>
            <input
              id="current-password"
              type="password"
              placeholder="Nhập mật khẩu hiện tại"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="new-password">Mật khẩu mới</label>
            <input
              id="new-password"
              type="password"
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="confirm-password">Xác nhận mật khẩu mới</label>
            <input
              id="confirm-password"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  )
}

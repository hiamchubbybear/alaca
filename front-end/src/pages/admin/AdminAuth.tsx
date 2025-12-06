import { useState } from 'react'
import { login } from '../../features/auth/api/authApi'
import './AdminAuth.css'

export function AdminAuth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
        if (!res.success || !res.data || !(res as any).data.token) {
          setError(res.message || 'Đăng nhập thất bại')
          return
        }
        const token = (res as any).data.token as string
        localStorage.setItem('accessToken', token)
        localStorage.setItem('userRole', 'Admin')
        // Reload to trigger admin dashboard
        window.location.reload()
        return
      }

      // Signup - use admin/first endpoint
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/account/admin/first`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, email, password })
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'Đăng ký thất bại')
        return
      }

      // Auto login after signup
      const loginRes = await login(email, password)
      if (loginRes.success && (loginRes as any).data.token) {
        const token = (loginRes as any).data.token as string
        localStorage.setItem('accessToken', token)
        localStorage.setItem('userRole', 'Admin')
        window.location.reload()
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-container">
        <div className="admin-auth-header">
          <h1>ADMIN PANEL</h1>
          <p>Quản trị viên FitLife Planner</p>
        </div>

        <div className="admin-auth-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => setMode('signup')}
          >
            Đăng Ký
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-auth-form">
          {error && <div className="error-box">{error}</div>}

          {mode === 'signup' && (
            <div className="form-field">
              <label>Tên</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="form-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {mode === 'signup' && (
            <div className="form-field">
              <label>Xác nhận mật khẩu</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
          </button>
        </form>

        <div className="admin-auth-footer">
          <a href="/">← Quay lại trang chủ</a>
        </div>
      </div>
    </div>
  )
}

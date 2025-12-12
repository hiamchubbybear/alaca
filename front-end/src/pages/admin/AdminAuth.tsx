import { useState } from 'react'
import { login } from '../../features/auth/api/authApi'
import './AdminAuth.css'

export function AdminAuth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      setLoading(true)

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
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='admin-auth-page'>
      <div className='admin-auth-container'>
        <div className='admin-auth-header'>
          <h1>ADMIN PANEL</h1>
          <p>Quản trị viên FitLife Planner</p>
        </div>

        <form onSubmit={handleSubmit} className='admin-auth-form'>
          {error && <div className='error-box'>{error}</div>}

          <div className='form-field'>
            <label>Email</label>
            <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
          </div>

          <div className='form-field'>
            <label>Mật khẩu</label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type='submit' className='submit-btn' disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className='admin-auth-footer'>
          <a href='/'>← Quay lại trang chủ</a>
        </div>
      </div>
    </div>
  )
}

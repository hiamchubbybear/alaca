import { useEffect, useState } from 'react'
import { getNotificationHistory, sendSystemNotification } from './adminApi'
import './NotificationManagement.css'

interface Notification {
  id: string
  title: string
  body: string
  message?: string
  type: string
  userId?: string
  targetUserId?: string
  username?: string
  createdAt: string
  status: string
}

interface NotificationManagementProps {
  prefilledUserId?: string | null
}

export function NotificationManagement({ prefilledUserId }: NotificationManagementProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(!!prefilledUserId) // Open form if ID is passed
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 20

  const [form, setForm] = useState({
    title: '',
    message: '',
    type: prefilledUserId ? 'user' : 'system', // Default to 'user' if ID passed
    userId: prefilledUserId || ''
  })

  // Update form if prefilledUserId changes (e.g. re-navigating)
  useEffect(() => {
    if (prefilledUserId) {
      setForm((prev) => ({ ...prev, userId: prefilledUserId, type: 'user' }))
      setIsCreating(true)
    }
  }, [prefilledUserId])

  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    loadNotifications()
  }, [page])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const res = await getNotificationHistory(page, pageSize)
      if (res.success && res.data) {
        setNotifications(res.data.notifications || [])
        setTotal(res.data.total || 0)
      } else {
        setNotifications([])
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!form.title || !form.message) {
      alert('Vui lòng nhập tiêu đề và nội dung')
      return
    }

    try {
      const res = await sendSystemNotification({
        title: form.title,
        message: form.message,
        type: form.type,
        userId: form.type === 'user' ? form.userId : undefined
      })

      if (res.success) {
        showSuccess('Đã gửi thông báo thành công')
        setIsCreating(false)
        setForm({ title: '', message: '', type: 'system', userId: '' })
        loadNotifications()
      } else {
        alert('Lỗi: ' + res.message)
      }
    } catch (e) {
      alert('Gửi thất bại')
    }
  }

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  return (
    <div className='notification-management'>
      {successMessage && <div className='success-toast'>{successMessage}</div>}

      <div className='top-actions'>
        <div className='page-title'>
          <h2>Quản Lý Thông Báo</h2>
          <p>Gửi thông báo hệ thống hoặc tin nhắn riêng cho người dùng</p>
        </div>
        <button className='btn-create' onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? 'Đóng Form' : 'Tạo Thông Báo Mới'}
        </button>
      </div>

      {isCreating && (
        <div className='create-form'>
          <h3>Soạn Thông Báo Mới</h3>

          {/* Templates Section */}
          <div className='form-group'>
            <label>Mẫu thông báo nhanh:</label>
            <select
              className='form-control'
              onChange={(e) => {
                const tpl = e.target.value
                if (tpl === 'warn_content') {
                  setForm({
                    ...form,
                    title: 'Cảnh báo vi phạm nội dung',
                    message:
                      'Bài viết của bạn đã bị xóa do vi phạm quy tắc cộng đồng về nội dung không phù hợp. Vui lòng xem lại điều khoản sử dụng.',
                    type: 'warning'
                  })
                } else if (tpl === 'warn_spam') {
                  setForm({
                    ...form,
                    title: 'Cảnh báo Spam',
                    message:
                      'Tài khoản của bạn bị phát hiện có hành vi spam. Vui lòng dừng ngay lập tức nếu không tài khoản sẽ bị khóa.',
                    type: 'warning'
                  })
                } else if (tpl === 'maint') {
                  setForm({
                    ...form,
                    title: 'Thông báo bảo trì hệ thống',
                    message: 'Hệ thống sẽ bảo trì từ 00:00 - 02:00 ngày mai. Vui lòng lưu lại công việc của bạn.',
                    type: 'system'
                  })
                } else if (tpl === 'challenge') {
                  setForm({
                    ...form,
                    title: 'Thử thách mới đã bắt đầu!',
                    message: 'Thử thách tháng này đã mở. Tham gia ngay để nhận huy hiệu độc quyền!',
                    type: 'system'
                  })
                }
              }}
            >
              <option value=''>-- Chọn mẫu thông báo --</option>
              <option value='warn_content'>Cảnh báo: Nội dung không phù hợp</option>
              <option value='warn_spam'>Cảnh báo: Spam</option>
              <option value='maint'>Thông báo: Bảo trì hệ thống</option>
              <option value='challenge'>Thông báo: Thử thách mới</option>
            </select>
          </div>

          <div className='form-group'>
            <div className='radio-group-container'>
              <label className='group-label'>Loại thông báo:</label>
              <div className='radio-group'>
                <label className='radio-item'>
                  <input
                    type='radio'
                    name='type'
                    value='system'
                    checked={form.type === 'system'}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  />
                  Hệ thống
                </label>
                <label className='radio-item'>
                  <input
                    type='radio'
                    name='type'
                    value='user'
                    checked={form.type === 'user'}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  />
                  Cá nhân
                </label>
                <label className='radio-item'>
                  <input
                    type='radio'
                    name='type'
                    value='warning'
                    checked={form.type === 'warning'}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  />
                  Cảnh báo
                </label>
              </div>
            </div>
          </div>

          {form.type === 'user' && (
            <div className='form-group'>
              <label>User ID nhận tin:</label>
              <input
                type='text'
                className='form-control'
                placeholder='Nhập ID người dùng...'
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
              />
            </div>
          )}

          <div className='form-group'>
            <label>Tiêu đề:</label>
            <input
              type='text'
              className='form-control'
              placeholder='Nhập tiêu đề thông báo...'
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className='form-group'>
            <label>Nội dung:</label>
            <textarea
              className='form-control'
              placeholder='Nhập nội dung chi tiết...'
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          <div className='form-actions'>
            <button className='btn-secondary' onClick={() => setIsCreating(false)}>
              Hủy bỏ
            </button>
            <button className='btn-primary' onClick={handleSend}>
              Gửi Thông Báo
            </button>
          </div>
        </div>
      )}

      <div className='table-container'>
        <table className='notification-table'>
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Nội dung</th>
              <th>Loại</th>
              <th>Người nhận</th>
              <th>Ngày gửi</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : notifications.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
                  Chưa có thông báo nào được gửi.
                </td>
              </tr>
            ) : (
              notifications.map((notif, index) => (
                <tr key={notif.id || index}>
                  <td style={{ fontWeight: 500 }}>{notif.title}</td>
                  <td>{notif.body || notif.message}</td>
                  <td>
                    <span className={`type-badge ${notif.type}`}>
                      {notif.type === 'system' ? 'Hệ thống' : notif.type === 'warning' ? 'Cảnh báo' : 'Cá nhân'}
                    </span>
                  </td>
                  <td>
                    {notif.username ? (
                      <div className='recipient-info'>
                        <span className='recipient-name'>{notif.username}</span>
                        {notif.userId && <small className='recipient-id'>#{notif.userId.substring(0, 8)}</small>}
                      </div>
                    ) : notif.userId || notif.targetUserId ? (
                      <span className='recipient-info'>{notif.userId || notif.targetUserId}</span>
                    ) : (
                      <span style={{ color: '#718096' }}>Tất cả users</span>
                    )}
                  </td>
                  <td>{new Date(notif.createdAt).toLocaleString('vi-VN')}</td>
                  <td>
                    <span style={{ color: '#48bb78', fontWeight: 600 }}>Đã gửi</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className='pagination'>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          Trước
        </button>
        <span>
          Trang {page} / {Math.ceil(total / pageSize) || 1}
        </span>
        <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / pageSize)}>
          Sau
        </button>
      </div>
    </div>
  )
}

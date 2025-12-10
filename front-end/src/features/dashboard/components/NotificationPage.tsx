import { useEffect, useState } from 'react'
import { getMyNotifications, markAllAsRead, markAsRead, type Notification } from '../api/notificationApi'
import './NotificationPage.css'

export function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getMyNotifications()
      if (res.success && res.data) {
        setNotifications(res.data)
      } else {
        setNotifications([])
      }
    } catch (err) {
      setError('Không thể tải thông báo')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)))

      const res = await markAsRead(notificationId)
      if (!res.success) {
        // Revert if failed (optional, but good practice)
        console.error('Lỗi khi đánh dấu đã đọc')
      }
    } catch (err) {
      console.error('Không thể đánh dấu đã đọc:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      await markAllAsRead()
    } catch (err) {
      console.error('Không thể đánh dấu tất cả đã đọc:', err)
    }
  }

  const filteredNotifications = filter === 'all' ? notifications : notifications.filter((n) => !n.isRead)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  if (loading) {
    return (
      <div className='section-page'>
        <div className='loading-state'>Đang tải thông báo...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='section-page'>
        <div className='error-state'>
          <p>{error}</p>
          <button onClick={loadNotifications} className='btn-primary'>
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='section-page'>
      <div className='section-header'>
        <h1 className='main-content-title'>Thông Báo</h1>
        {unreadCount > 0 && (
          <button className='btn-secondary' onClick={handleMarkAllAsRead}>
            Đánh dấu tất cả đã đọc ({unreadCount})
          </button>
        )}
      </div>

      <div className='notification-filters'>
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          Tất cả ({notifications.length})
        </button>
        <button className={`filter-btn ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>
          Chưa đọc ({unreadCount})
        </button>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className='empty-state'>
          <h2>{filter === 'unread' ? 'Không Có Thông Báo Chưa Đọc' : 'Không Có Thông Báo'}</h2>
          <p>Bạn đã xem hết thông báo!</p>
        </div>
      ) : (
        <div className='notification-list-page'>
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${notification.isRead ? 'read' : 'unread'} ${notification.type === 'warning' ? 'warning' : ''}`}
              onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
            >
              <div className='notification-header'>
                <h3>{notification.title}</h3>
                {!notification.isRead && <span className='unread-badge'>Mới</span>}
              </div>
              <p className='notification-body'>{notification.body}</p>
              <div className='notification-footer'>
                <span className='notification-time'>{new Date(notification.createdAt).toLocaleString('vi-VN')}</span>
                <span className={`notification-type type-${notification.type}`}>
                  {notification.type === 'system'
                    ? 'Hệ thống'
                    : notification.type === 'warning'
                      ? 'Cảnh báo'
                      : 'Cá nhân'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { getMyNotifications, markAllAsRead, markAsRead, type Notification } from '../api/notificationApi'
import './NotificationPage.css'

interface NotificationPageProps {
  isOverlay?: boolean
  onClose?: () => void
}

export function NotificationPage({ isOverlay = false, onClose }: NotificationPageProps) {
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
      <div className={isOverlay ? 'notification-overlay-container' : 'section-page'}>
        <div className='loading-state'>Đang tải thông báo...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={isOverlay ? 'notification-overlay-container' : 'section-page'}>
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
    <div className={isOverlay ? 'notification-overlay-container' : 'section-page'}>
      <div className='section-header' style={isOverlay ? { padding: '16px', borderBottom: '1px solid #eee' } : {}}>
        <h1 className='main-content-title' style={isOverlay ? { fontSize: '18px', margin: 0 } : {}}>
          Thông Báo
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {unreadCount > 0 && (
            <button
              className='btn-secondary'
              onClick={handleMarkAllAsRead}
              style={isOverlay ? { fontSize: '12px', padding: '4px 8px' } : {}}
            >
              {isOverlay ? 'Đọc tất cả' : `Đánh dấu tất cả đã đọc (${unreadCount})`}
            </button>
          )}
          {isOverlay && onClose && (
            <button
              className='btn-icon'
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <line x1='18' y1='6' x2='6' y2='18'></line>
                <line x1='6' y1='6' x2='18' y2='18'></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className='notification-filters' style={isOverlay ? { padding: '8px 16px' } : {}}>
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          Tất cả
        </button>
        <button className={`filter-btn ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>
          Chưa đọc ({unreadCount})
        </button>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className='empty-state' style={isOverlay ? { padding: '32px 16px' } : {}}>
          <h2>{filter === 'unread' ? 'Không có tin mới' : 'Hộp thư trống'}</h2>
          <p>Bạn đã xem hết thông báo!</p>
        </div>
      ) : (
        <div
          className='notification-list-page'
          style={isOverlay ? { maxHeight: '400px', overflowY: 'auto', padding: '0' } : {}}
        >
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${notification.isRead ? 'read' : 'unread'} ${notification.type === 'warning' ? 'warning' : ''}`}
              onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
              style={
                isOverlay ? { borderRadius: 0, margin: 0, borderBottom: '1px solid #eee', padding: '12px 16px' } : {}
              }
            >
              <div className='notification-header'>
                <h3 style={isOverlay ? { fontSize: '14px' } : {}}>{notification.title}</h3>
                {!notification.isRead && <span className='unread-badge'>Mới</span>}
              </div>
              <p className='notification-body' style={isOverlay ? { fontSize: '13px', margin: '4px 0' } : {}}>
                {notification.body}
              </p>
              <div className='notification-footer'>
                <span className='notification-time'>{new Date(notification.createdAt).toLocaleString('vi-VN')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

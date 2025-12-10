import { useState } from 'react'
import { type HealthMetrics, type MainSection, type NavSection } from '../types'

interface DashboardSidebarProps {
  activeSection: MainSection
  onSelectSection: (section: MainSection) => void
  userName?: string
  userAvatarUrl?: string | null
  healthMetrics?: HealthMetrics
  unreadCount: number
  showNotifications: boolean
  setShowNotifications: (show: boolean) => void
  onProfile: () => void
  onChangePassword: () => void
  onLogout: () => void
}

const sections: NavSection[] = ['training', 'nutrition', 'progress', 'challenge', 'social', 'health']

export function DashboardSidebar({
  activeSection,
  onSelectSection,
  userName = 'User',
  userAvatarUrl,
  healthMetrics,
  unreadCount,
  showNotifications,
  setShowNotifications,
  onProfile,
  onChangePassword,
  onLogout
}: DashboardSidebarProps) {
  const [showMenu, setShowMenu] = useState(false)

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const getSectionIcon = (section: NavSection) => {
    switch (section) {
      case 'training':
        return (
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M6.5 4H9.5V20H6.5V4ZM14.5 4H17.5V20H14.5V4ZM2 8H5V16H2V8ZM22 8V16H19V8H22ZM6.5 4C6.5 2.89543 7.39543 2 8.5 2H15.5C16.6046 2 17.5 2.89543 17.5 4V20C17.5 21.1046 16.6046 22 15.5 22H8.5C7.39543 22 6.5 21.1046 6.5 20V4Z'
              fill='currentColor'
            />
          </svg>
        )
      case 'nutrition':
        return (
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M16 2C16 2 16 5 14 6.5C12 8 8 8 6 10C4 12 4 15 6 17C8 19 11 19 13 17C15 15 17.5 14 20 12C20 12 18 10 16 10C14 10 12 9 12 7C12 5 15 3 16 2Z'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M9 13C9 13 9 16 11 18'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        )
      case 'progress':
        return (
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M18 20V10M12 20V4M6 20V14'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        )
      case 'challenge':
        return (
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        )
      case 'social':
        return (
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        )
      case 'health':
        return (
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M16 4C18.21 4 20 5.79 20 8C20 10.21 18.21 12 16 12C13.79 12 12 10.21 12 8C12 5.79 13.79 4 16 4ZM16 14C18.67 14 24 15.33 24 18V20H8V18C8 15.33 13.33 14 16 14ZM8 10C10.21 10 12 8.21 12 6C12 3.79 10.21 2 8 2C5.79 2 4 3.79 4 6C4 8.21 5.79 10 8 10ZM8 12C5.33 12 0 13.33 0 16V18H8.5C7.56 17.16 7 16.13 7 15C7 13.83 7.47 12.73 8.22 11.88C8.15 11.95 8.08 12 8 12Z'
              fill='currentColor'
            />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <aside className='sidebar'>
      <ul className='sidebar-list'>
        {sections.map((section) => (
          <li key={section}>
            <button
              type='button'
              className={`sidebar-item ${activeSection === section ? 'active' : ''}`}
              onClick={() => onSelectSection(section)}
            >
              <span className='sidebar-item-icon'>{getSectionIcon(section)}</span>
              <span className='sidebar-item-text'>
                {section === 'nutrition'
                  ? 'Dinh Dưỡng'
                  : section === 'progress'
                    ? 'Tiến Độ'
                    : section === 'training'
                      ? 'Luyện Tập'
                      : section === 'challenge'
                        ? 'Thử Thách'
                        : section === 'health'
                          ? 'Chỉ Số Sức Khoẻ'
                          : 'Cộng Đồng'}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className='sidebar-user'>
        <div className='sidebar-user-info' onClick={() => setShowMenu((open) => !open)}>
          <div className='sidebar-user-avatar'>
            {userAvatarUrl ? <img src={userAvatarUrl} alt={userName} /> : <span>{initials}</span>}
          </div>
          <div>
            <p className='sidebar-user-name'>{userName}</p>
            {/* Health Metrics Summary */}
            {(() => {
              const formattedBmi = healthMetrics?.bmi ? healthMetrics.bmi.toFixed(1) : '—'
              const formattedTdee = healthMetrics?.dailyCalories
                ? Math.round(healthMetrics.dailyCalories).toLocaleString('vi-VN')
                : '—'
              return (
                <span className='sidebar-user-role'>
                  BMI / TDEE
                  <br />
                  {healthMetrics ? `${formattedBmi} / ${formattedTdee}` : 'Chưa có dữ liệu'}
                </span>
              )
            })()}
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <button
            type='button'
            className={`sidebar-user-icon sidebar-user-notification ${showNotifications ? 'active' : ''}`}
            aria-label='Notifications'
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M19.4 15C20.4418 15 21.2882 14.1554 21.2882 13.1119C21.2882 12.0683 20.4418 11.2238 19.3983 11.2238C19.3983 11.2238 19.3983 11.2238 19.3983 11.2238C19.3983 11.2238 19.3983 11.2238 19.3983 11.2238C19.3983 11.2238 19.3983 11.2238 19.3983 11.2238C19.3983 10.1802 18.5519 9.33569 17.5083 9.33569C16.4648 9.33569 15.6184 10.1802 15.6184 11.2238V12.7238C15.6184 13.7673 14.772 14.6119 13.7285 14.6119C12.6849 14.6119 11.8385 13.7673 11.8385 12.7238V11.2238C11.8385 10.1802 10.9921 9.33569 9.94854 9.33569C8.905 9.33569 8.05859 10.1802 8.05859 11.2238V12.7238C8.05859 13.7673 7.21219 14.6119 6.16864 14.6119C5.12509 14.6119 4.27869 13.7673 4.27869 12.7238C4.27869 11.6802 5.12509 10.8357 6.16864 10.8357H6.55664'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#f56565',
                  color: 'white',
                  borderRadius: '10px',
                  minWidth: '16px',
                  height: '16px',
                  justifyContent: 'center',
                  padding: '0 4px',
                  fontWeight: 'bold',
                  border: '2px solid white',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>
        <button
          type='button'
          className='sidebar-user-icon sidebar-user-settings'
          onClick={() => setShowMenu((open) => !open)}
          aria-label='Open settings'
        >
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.67 19.18 11.36 19.13 11.06L21.16 9.48C21.34 9.34 21.4 9.09 21.28 8.88L19.36 5.56C19.24 5.34 18.99 5.27 18.79 5.35L16.4 6.31C15.9 5.93 15.37 5.61 14.78 5.35L14.42 2.81C14.37 2.57 14.17 2.4 13.93 2.4H10.07C9.83 2.4 9.63 2.57 9.58 2.81L9.22 5.35C8.63 5.61 8.1 5.93 7.6 6.31L5.21 5.35C5.01 5.27 4.76 5.34 4.64 5.56L2.72 8.88C2.6 9.09 2.65 9.34 2.83 9.48L4.87 11.06C4.82 11.36 4.8 11.67 4.8 12C4.8 12.33 4.82 12.64 4.87 12.94L2.83 14.52C2.65 14.66 2.6 14.91 2.71 15.12L4.63 18.44C4.75 18.66 5 18.73 5.2 18.65L7.59 17.69C8.09 18.07 8.62 18.39 9.21 18.65L9.57 21.19C9.62 21.43 9.82 21.6 10.06 21.6H13.92C14.16 21.6 14.36 21.43 14.41 21.19L14.77 18.65C15.36 18.39 15.89 18.07 16.39 17.69L18.78 18.65C18.98 18.73 19.23 18.66 19.35 18.44L21.27 15.12C21.39 14.91 21.34 14.66 21.16 14.52L19.14 12.94ZM12 15.6C10.01 15.6 8.4 13.99 8.4 12C8.4 10.01 10.01 8.4 12 8.4C13.99 8.4 15.6 10.01 15.6 12C15.6 13.99 13.99 15.6 12 15.6Z'
              fill='currentColor'
            />
          </svg>
        </button>
        {showMenu && (
          <div className='sidebar-user-menu'>
            <button
              type='button'
              onClick={() => {
                onProfile()
                setShowMenu(false)
              }}
            >
              Hồ Sơ
            </button>
            <button
              type='button'
              onClick={() => {
                setShowNotifications(true)
                setShowMenu(false)
              }}
            >
              Thông báo
              {unreadCount > 0 && (
                <span
                  style={{
                    marginLeft: 'auto',
                    background: '#f56565',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '2px 6px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    float: 'right'
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              type='button'
              onClick={() => {
                onChangePassword()
                setShowMenu(false)
              }}
            >
              Đổi mật khẩu
            </button>
            <button
              type='button'
              onClick={() => {
                onLogout()
                setShowMenu(false)
              }}
            >
              Đăng Xuất
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

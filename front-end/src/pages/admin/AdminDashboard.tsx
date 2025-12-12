import { useState } from 'react'
import './AdminDashboard.css'
import { Analytics } from './Analytics'
import { ChallengeManagement } from './ChallengeManagement'
import { ExerciseManagement } from './ExerciseManagement'
import { NotificationManagement } from './NotificationManagement'
import { NutritionManagement } from './NutritionManagement'
import { PostManagement } from './PostManagement'
import { UserManagement } from './UserManagement'

type AdminSection = 'users' | 'analytics' | 'posts' | 'nutrition' | 'challenges' | 'exercises' | 'notifications'

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>('users')
  const [showSidebar, setShowSidebar] = useState(false)
  const [prefilledNotificationUserId, setPrefilledNotificationUserId] = useState<string | null>(null)

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userRole')
    window.location.href = '/'
  }

  const navigateToNotifications = (userId: string) => {
    setPrefilledNotificationUserId(userId)
    setActiveSection('notifications')
  }

  return (
    <div className='admin-layout'>
      {/* Sidebar */}
      <aside className={`admin-sidebar ${showSidebar ? 'show' : ''}`}>
        <div className='admin-sidebar-header'>
          <h2>ADMIN</h2>
          <button className='close-sidebar' onClick={() => setShowSidebar(false)}>
            ×
          </button>
        </div>

        <nav className='admin-nav'>
          <button
            className={activeSection === 'users' ? 'active' : ''}
            onClick={() => {
              setActiveSection('users')
              setShowSidebar(false)
            }}
          >
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
              <circle cx='9' cy='7' r='4' />
              <path d='M23 21v-2a4 4 0 0 0-3-3.87' />
              <path d='M16 3.13a4 4 0 0 1 0 7.75' />
            </svg>
            Người Dùng
          </button>
          <button
            className={activeSection === 'exercises' ? 'active' : ''}
            onClick={() => {
              setActiveSection('exercises')
              setShowSidebar(false)
            }}
          >
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M14.4 14.4L9.6 9.6' />
              <path d='M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z' />
              <circle cx='7.5' cy='7.5' r='5.5' />
            </svg>
            Bài Tập
          </button>
          <button
            className={activeSection === 'nutrition' ? 'active' : ''}
            onClick={() => {
              setActiveSection('nutrition')
              setShowSidebar(false)
            }}
          >
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M18 8h1a4 4 0 0 1 0 8h-1' />
              <path d='M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z' />
              <line x1='6' y1='1' x2='6' y2='4' />
              <line x1='10' y1='1' x2='10' y2='4' />
              <line x1='14' y1='1' x2='14' y2='4' />
            </svg>
            Dinh Dưỡng
          </button>
          <button
            className={activeSection === 'posts' ? 'active' : ''}
            onClick={() => {
              setActiveSection('posts')
              setShowSidebar(false)
            }}
          >
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
              <polyline points='14 2 14 8 20 8' />
              <line x1='16' y1='13' x2='8' y2='13' />
              <line x1='16' y1='17' x2='8' y2='17' />
            </svg>
            Bài Đăng
          </button>
          <button
            className={activeSection === 'challenges' ? 'active' : ''}
            onClick={() => {
              setActiveSection('challenges')
              setShowSidebar(false)
            }}
          >
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <circle cx='12' cy='8' r='7' />
              <polyline points='8.21 13.89 7 23 12 20 17 23 15.79 13.88' />
            </svg>
            Thử Thách
          </button>
          <button
            className={activeSection === 'notifications' ? 'active' : ''}
            onClick={() => {
              setActiveSection('notifications')
              setShowSidebar(false)
            }}
          >
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' />
              <path d='M13.73 21a2 2 0 0 1-3.46 0' />
            </svg>
            Thông Báo
          </button>
          <button
            className={activeSection === 'analytics' ? 'active' : ''}
            onClick={() => {
              setActiveSection('analytics')
              setShowSidebar(false)
            }}
          >
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <line x1='18' y1='20' x2='18' y2='10' />
              <line x1='12' y1='20' x2='12' y2='4' />
              <line x1='6' y1='20' x2='6' y2='14' />
            </svg>
            Thống Kê & Báo Cáo
          </button>
        </nav>

        <button className='logout-btn' onClick={handleLogout}>
          Đăng Xuất
        </button>
      </aside>

      {/* Main Content */}
      <main className='admin-main'>
        <header className='admin-header'>
          <button className='menu-toggle' onClick={() => setShowSidebar(!showSidebar)}>
            ☰
          </button>
          <h1>
            {activeSection === 'users' && 'Người Dùng'}
            {activeSection === 'exercises' && 'Bài Tập'}
            {activeSection === 'nutrition' && 'Dinh Dưỡng'}
            {activeSection === 'posts' && 'Bài Đăng'}
            {activeSection === 'challenges' && 'Thử Thách'}
            {activeSection === 'notifications' && 'Thông Báo'}
            {activeSection === 'analytics' && 'Thống Kê & Báo Cáo'}
          </h1>
          <div className='admin-welcome'>
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
              <circle cx='12' cy='7' r='4' />
            </svg>
            <span>Xin chào, Admin</span>
          </div>
        </header>

        <div className='admin-content'>
          {activeSection === 'users' && <UserManagement onNavigateToNotifications={navigateToNotifications} />}
          {activeSection === 'exercises' && <ExerciseManagement />}
          {activeSection === 'nutrition' && <NutritionManagement />}
          {activeSection === 'posts' && <PostManagement />}
          {activeSection === 'challenges' && <ChallengeManagement />}
          {activeSection === 'notifications' && (
            <NotificationManagement prefilledUserId={prefilledNotificationUserId} />
          )}
          {activeSection === 'analytics' && <Analytics />}
        </div>
      </main>
    </div>
  )
}

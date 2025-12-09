import { useState } from 'react'
import './AdminDashboard.css'
import { Analytics } from './Analytics'
import { ChallengeManagement } from './ChallengeManagement'
import { ExerciseManagement } from './ExerciseManagement'
import { NutritionManagement } from './NutritionManagement'
import { PostManagement } from './PostManagement'
import { UserManagement } from './UserManagement'

type AdminSection = 'users' | 'analytics' | 'posts' | 'nutrition' | 'challenges' | 'exercises'

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>('users')
  const [showSidebar, setShowSidebar] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userRole')
    window.location.href = '/'
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${showSidebar ? 'show' : ''}`}>
        <div className="admin-sidebar-header">
          <h2>ADMIN</h2>
          <button className="close-sidebar" onClick={() => setShowSidebar(false)}>×</button>
        </div>

        <nav className="admin-nav">
          <button
            className={activeSection === 'users' ? 'active' : ''}
            onClick={() => { setActiveSection('users'); setShowSidebar(false) }}
          >
            Quản Lý Người Dùng
          </button>
          <button
            className={activeSection === 'exercises' ? 'active' : ''}
            onClick={() => { setActiveSection('exercises'); setShowSidebar(false) }}
          >
            Quản Lý Bài Tập
          </button>
          <button
            className={activeSection === 'nutrition' ? 'active' : ''}
            onClick={() => { setActiveSection('nutrition'); setShowSidebar(false) }}
          >
            Quản Lý Dinh Dưỡng
          </button>
          <button
            className={activeSection === 'posts' ? 'active' : ''}
            onClick={() => { setActiveSection('posts'); setShowSidebar(false) }}
          >
            Quản Lý Bài Đăng
          </button>
          <button
            className={activeSection === 'challenges' ? 'active' : ''}
            onClick={() => { setActiveSection('challenges'); setShowSidebar(false) }}
          >
            Quản Lý Thử Thách
          </button>
          <button
            className={activeSection === 'analytics' ? 'active' : ''}
            onClick={() => { setActiveSection('analytics'); setShowSidebar(false) }}
          >
            Thống Kê & Báo Cáo
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          Đăng Xuất
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <button className="menu-toggle" onClick={() => setShowSidebar(!showSidebar)}>
            ☰
          </button>
          <h1>
            {activeSection === 'users' && 'Quản Lý Người Dùng'}
            {activeSection === 'exercises' && 'Quản Lý Bài Tập'}
            {activeSection === 'nutrition' && 'Quản Lý Dinh Dưỡng'}
            {activeSection === 'posts' && 'Quản Lý Bài Đăng'}
            {activeSection === 'challenges' && 'Quản Lý Thử Thách'}
            {activeSection === 'analytics' && 'Thống Kê & Báo Cáo'}
          </h1>
        </header>

        <div className="admin-content">
          {activeSection === 'users' && <UserManagement />}
          {activeSection === 'exercises' && <ExerciseManagement />}
          {activeSection === 'nutrition' && <NutritionManagement />}
          {activeSection === 'posts' && <PostManagement />}
          {activeSection === 'challenges' && <ChallengeManagement />}
          {activeSection === 'analytics' && <Analytics />}
        </div>
      </main>
    </div>
  )
}

import { useState } from 'react'
import { UserManagement } from './UserManagement'
import { Analytics } from './Analytics'
import './AdminDashboard.css'

type AdminSection = 'users' | 'analytics' | 'posts'

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
            className={activeSection === 'analytics' ? 'active' : ''}
            onClick={() => { setActiveSection('analytics'); setShowSidebar(false) }}
          >
            Phân Tích
          </button>
          <button
            className={activeSection === 'posts' ? 'active' : ''}
            onClick={() => { setActiveSection('posts'); setShowSidebar(false) }}
          >
            Bài Viết
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
            {activeSection === 'analytics' && 'Phân Tích Thống Kê'}
            {activeSection === 'posts' && 'Quản Lý Bài Viết'}
          </h1>
        </header>

        <div className="admin-content">
          {activeSection === 'users' && <UserManagement />}
          {activeSection === 'analytics' && <Analytics />}
          {activeSection === 'posts' && <div className="coming-soon">Quản lý bài viết - Đang phát triển</div>}
        </div>
      </main>
    </div>
  )
}

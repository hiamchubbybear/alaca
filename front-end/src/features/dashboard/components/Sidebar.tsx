import { useState } from 'react'
import type { DashboardSection } from '../types'

type Props = {
  activeSection: DashboardSection
  onSelectSection: (section: DashboardSection) => void
  userName: string
  onProfileClick: () => void
  onLogout: () => void
}

const sections: { id: DashboardSection; label: string }[] = [
  { id: 'training', label: 'Training' },
  { id: 'nutrition', label: 'Nutrition Plans' },
  { id: 'progress', label: 'Your Progress' },
  { id: 'challenge', label: 'Challenge' },
  { id: 'social', label: 'Social' }
]

export function Sidebar({
  activeSection,
  onSelectSection,
  userName,
  onProfileClick,
  onLogout
}: Props) {
  const [showMenu, setShowMenu] = useState(false)
  const initials = userName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">Alaca</div>
        <p className="sidebar-tagline">Personal Fitness OS</p>
      </div>
      <ul className="sidebar-list">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              type="button"
              className={`sidebar-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => onSelectSection(section.id)}
            >
              {section.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="sidebar-user">
        <div className="sidebar-user-info" onClick={() => setShowMenu((open) => !open)}>
          <div className="sidebar-user-avatar">{initials}</div>
          <div>
            <p className="sidebar-user-name">{userName}</p>
            <span className="sidebar-user-role">Ready to train</span>
          </div>
        </div>
        <button
          type="button"
          className="sidebar-user-settings"
          onClick={() => setShowMenu((open) => !open)}
          aria-label="Open settings"
        >
          ⚙
        </button>
        {showMenu && (
          <div className="sidebar-user-menu">
            <button
              type="button"
              onClick={() => {
                onProfileClick()
                setShowMenu(false)
              }}
            >
              Profile
            </button>
            <button
              type="button"
              onClick={() => {
                onLogout()
                setShowMenu(false)
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

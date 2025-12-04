import { useState } from 'react'

export type MainSection = 'training' | 'nutrition' | 'progress' | 'challenge' | 'social'

const sectionContent: Record<MainSection, { title: string; subtitle: string }> = {
  training: {
    title: 'Training',
    subtitle: 'Here you will see your personalized workout plans and schedules.'
  },
  nutrition: {
    title: 'Nutrition Plans',
    subtitle: 'View and manage your meal plans and daily calorie targets.'
  },
  progress: {
    title: 'Your Progress',
    subtitle: 'Track your weight, BMI, and workout history over time.'
  },
  challenge: {
    title: 'Challenge',
    subtitle: 'Join fitness challenges to keep yourself motivated.'
  },
  social: {
    title: 'Social',
    subtitle: 'Connect with other users, share posts, and stay inspired.'
  }
}

const sections: MainSection[] = ['training', 'nutrition', 'progress', 'challenge', 'social']

type Props = {
  activeSection: MainSection
  onSelectSection: (section: MainSection) => void
  onProfile: () => void
  onLogout: () => void
  userName?: string
}

export function LoggedInLayout({
  activeSection,
  onSelectSection,
  onProfile,
  onLogout,
  userName = 'User'
}: Props) {
  const { title, subtitle } = sectionContent[activeSection]
  const [showMenu, setShowMenu] = useState(false)
  const initials = userName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <main className="main-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">Alaca</div>
          <p className="sidebar-tagline">Personal Fitness OS</p>
        </div>
        <ul className="sidebar-list">
          {sections.map((section) => (
            <li key={section}>
              <button
                type="button"
                className={`sidebar-item ${activeSection === section ? 'active' : ''}`}
                onClick={() => onSelectSection(section)}
              >
                {section === 'nutrition' ? 'Nutrition Plans' : section === 'progress' ? 'Your Progress' : section.charAt(0).toUpperCase() + section.slice(1)}
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
                  onProfile()
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
      <section className="main-content">
        <h1 className="main-content-title">{title}</h1>
        <p className="main-content-subtitle">{subtitle}</p>
      </section>
    </main>
  )
}


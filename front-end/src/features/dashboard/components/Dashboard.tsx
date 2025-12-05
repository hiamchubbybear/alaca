import { useState } from 'react'
import type { ProfileData } from '../../../shared/types/api'
import { ChallengePage } from '../../challenge/components/ChallengePage'
import { NutritionPage } from '../../nutrition/components/NutritionPage'
import { ProgressPage } from '../../progress/components/ProgressPage'
import { SocialPage } from '../../social/components/SocialPage'
import { TrainingPage } from '../../training/components/TrainingPage'
import type { DashboardSection } from '../types'
import { Sidebar } from './Sidebar'
import { ProfileModal, UserAvatar } from './UserAvatar'
// Mock update function
const updateProfileService = async (_data: any) => ({ success: true })

type Props = {
  userName: string
  userAvatar?: string
  profile: ProfileData | null
  onLogout: () => void
  onProfileUpdate: () => void
}

export function Dashboard({ userName, userAvatar, profile, onLogout, onProfileUpdate }: Props) {
  const [activeSection, setActiveSection] = useState<DashboardSection>('training')
  const [showProfileModal, setShowProfileModal] = useState(false)

  const handleProfileSave = async (data: Partial<ProfileData>) => {
    await updateProfileService(data)
    onProfileUpdate()
  }

  return (
    <div className="dashboard-container">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        userName={userName}
        onProfileClick={() => setShowProfileModal(true)}
        onLogout={onLogout}
      />

      <main className="dashboard-main">
        <div className="dashboard-header">
          <UserAvatar
            userName={userName}
            avatarUrl={userAvatar}
            onClick={() => setShowProfileModal(true)}
          />
        </div>

        <div className="dashboard-content">
          {activeSection === 'training' && <TrainingPage />}
          {activeSection === 'nutrition' && <NutritionPage />}
          {activeSection === 'progress' && <ProgressPage />}
          {activeSection === 'challenge' && <ChallengePage />}
          {activeSection === 'social' && <SocialPage />}
        </div>
      </main>

      <ProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={profile}
        onSave={handleProfileSave}
      />
    </div>
  )
}

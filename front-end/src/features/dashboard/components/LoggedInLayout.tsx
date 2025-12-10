import { useEffect, useState } from 'react'
import { getMyBmiRecords } from '../../../shared/api/bmiApi'
import { ChatWidget } from '../../chat/components/ChatWidget'
import { HealthMetricsSection } from '../../health/components/HealthMetricsSection'
import { loadHealthMetricsFromResponse } from '../../health/utils'
import { getProfile, type ProfileResponse } from '../../profile/api/profileApi'
import { ProfileSection } from '../../profile/components/ProfileSection'
import { SocialPage } from '../../social/components/SocialPage'
import { TrainingSection } from '../../training/components/TrainingSection'
import { getUnreadCount } from '../api/notificationApi'
import { type HealthMetrics, type MainSection } from '../types'
import { DashboardSidebar } from './DashboardSidebar'
import { NotificationPage } from './NotificationPage'

const sectionContent: Record<Exclude<MainSection, 'profile' | 'notification'>, { title: string; subtitle: string }> = {
  training: {
    title: 'Luyện Tập',
    subtitle: 'Xem các kế hoạch tập luyện và lịch trình được cá nhân hóa của bạn.'
  },
  nutrition: {
    title: 'Dinh Dưỡng',
    subtitle: 'Theo dõi bữa ăn, lượng calo và quản lý chế độ ăn uống của bạn.'
  },
  progress: {
    title: 'Tiến Độ',
    subtitle: 'Theo dõi hành trình tập luyện và các cột mốc quan trọng.'
  },
  challenge: {
    title: 'Thử Thách',
    subtitle: 'Tham gia các thử thách cộng đồng để giữ động lực.'
  },
  social: {
    title: 'Cộng Đồng',
    subtitle: 'Kết nối với bạn bè và chia sẻ thành tích của bạn.'
  },
  health: {
    title: 'Chỉ Số Sức Khoẻ',
    subtitle: 'Nhập cân nặng, chiều cao và mức vận động để lưu và tính BMI.'
  }
}

interface Props {
  activeSection: MainSection
  onSelectSection: (section: MainSection) => void
  onProfile: () => void
  onChangePassword: () => void
  onLogout: () => void
  userName?: string
}

export function LoggedInLayout({
  activeSection,
  onSelectSection,
  onProfile,
  onChangePassword,
  onLogout,
  userName = 'User'
}: Props) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null)
  const [healthNotice, setHealthNotice] = useState<string | null>(null)
  const [healthLoading, setHealthLoading] = useState(false)

  // Fetch notifications
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await getUnreadCount()
        if (typeof res.data === 'number') {
          setUnreadCount(res.data)
        }
      } catch (error) {
        // silent error
      }
    }

    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 60000) // Poll every 60 seconds
    return () => clearInterval(interval)
  }, [activeSection])

  const currentAvatarUrl = profile?.avatarUrl || ''

  // Initial Health Metrics Load
  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await getMyBmiRecords()
        if (!cancelled) {
          const metrics = loadHealthMetricsFromResponse(res)
          if (metrics) {
            setHealthMetrics(metrics)
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load health metrics on mount:', error)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  // Reload Health Metrics when entering Health section
  useEffect(() => {
    if (activeSection !== 'health') return
    ;(async () => {
      try {
        setHealthLoading(true)
        const res = await getMyBmiRecords()
        const metrics = loadHealthMetricsFromResponse(res)
        if (metrics) {
          setHealthMetrics(metrics)
        }
      } catch (error) {
        console.error('Failed to load health metrics:', error)
      } finally {
        setHealthLoading(false)
      }
    })()
  }, [activeSection])

  // Profile Load
  useEffect(() => {
    if (profile) return
    ;(async () => {
      try {
        const res = await getProfile()
        if (res.success && res.data) {
          setProfile(res.data)
        }
      } catch {}
    })()
  }, [profile])

  // Reload Profile when entering Profile section
  useEffect(() => {
    if (activeSection !== 'profile') return
    ;(async () => {
      try {
        const profileRes = await getProfile()
        if (profileRes.success && profileRes.data) {
          setProfile(profileRes.data)
        }
      } catch {}
    })()
  }, [activeSection, userName])

  const handleSelectSection = (section: MainSection) => {
    setHealthNotice(null)
    onSelectSection(section)
  }

  const { title, subtitle } = sectionContent[activeSection as keyof typeof sectionContent] || {
    title: '',
    subtitle: ''
  }

  return (
    <main className='main-layout'>
      <DashboardSidebar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        userName={userName}
        userAvatarUrl={currentAvatarUrl}
        healthMetrics={healthMetrics || undefined}
        unreadCount={unreadCount}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        onProfile={onProfile}
        onChangePassword={onChangePassword}
        onLogout={onLogout}
      />

      {showNotifications && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            left: '290px',
            width: '360px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 10000,
            border: '1px solid #eee',
            overflow: 'hidden'
          }}
        >
          <NotificationPage isOverlay onClose={() => setShowNotifications(false)} />
        </div>
      )}

      <section className={`main-content`}>
        {activeSection === 'profile' ? (
          <ProfileSection
            initialProfile={profile}
            userName={userName}
            onProfileUpdated={(updated) => setProfile(updated)}
          />
        ) : activeSection === 'health' ? (
          <HealthMetricsSection
            healthMetrics={healthMetrics}
            onMetricsUpdated={(metrics) => setHealthMetrics(metrics)}
            healthLoading={healthLoading}
            initialIsEditing={!!healthNotice}
            healthNotice={healthNotice}
          />
        ) : activeSection === 'training' ? (
          <TrainingSection
            healthMetrics={healthMetrics}
            setHealthMetrics={setHealthMetrics}
            onNavigateToHealth={() => onSelectSection('health')}
          />
        ) : (
          <>
            {activeSection === 'social' && <SocialPage />}
            {activeSection === 'notification' && <NotificationPage />}
            {activeSection !== 'social' && activeSection !== 'notification' && (
              <>
                <h1 className='main-content-title'>{title}</h1>
                <p className='main-content-subtitle'>{subtitle}</p>
              </>
            )}
          </>
        )}
      </section>
      <ChatWidget />
    </main>
  )
}

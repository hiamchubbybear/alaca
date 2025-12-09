import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { createBmiRecord, getMyBmiRecords, type PracticeLevel } from '../../../shared/api/bmiApi'
import { getExercises, type Exercise } from '../../../shared/api/exerciseApi'
import { uploadImage } from '../../../shared/services/cloudinaryService'
import { getProfile, updateProfile, type ProfileResponse } from '../../profile/api/profileApi'
import { SocialPage } from '../../social/components/SocialPage'

export type MainSection = 'training' | 'nutrition' | 'progress' | 'challenge' | 'social' | 'health' | 'profile'

const sectionContent: Record<Exclude<MainSection, 'profile'>, { title: string; subtitle: string }> = {
  training: {
    title: 'Luyện Tập',
    subtitle: 'Xem các kế hoạch tập luyện và lịch trình được cá nhân hóa của bạn.'
  },
  nutrition: {
    title: 'Dinh Dưỡng',
    subtitle: 'Quản lý kế hoạch ăn uống và mục tiêu calo hàng ngày.'
  },
  progress: {
    title: 'Tiến Độ',
    subtitle: 'Theo dõi cân nặng, BMI và lịch sử tập luyện theo thời gian.'
  },
  challenge: {
    title: 'Thử Thách',
    subtitle: 'Tham gia các thử thách thể hình để duy trì động lực.'
  },
  social: {
    title: 'Cộng Đồng',
    subtitle: 'Kết nối với người dùng khác, chia sẻ bài viết và truyền cảm hứng.'
  },
  health: {
    title: 'Chỉ Số Sức Khoẻ',
    subtitle: 'Nhập cân nặng, chiều cao và mức vận động để lưu và tính BMI.'
  }
}

type NavSection = Exclude<MainSection, 'profile'>

const sections: NavSection[] = ['training', 'nutrition', 'progress', 'challenge', 'social', 'health']

type HealthMetrics = {
  weightKg: number
  heightM: number
  activityFactor: number
  practiceLevel: PracticeLevel
  bmi?: number
  assessment?: string
  dailyCalories?: number
  recommendedSessions?: number
}

type Props = {
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
  const { title, subtitle } = activeSection === 'profile' ? { title: 'Hồ Sơ', subtitle: '' } : sectionContent[activeSection as NavSection]
  const [showMenu, setShowMenu] = useState(false)
  // Store profile data including avatarUrl for sidebar display
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [profileForm, setProfileForm] = useState({
    displayName: userName ?? 'User',
    avatarUrl: '',
    birthDate: '',
    gender: '',
    bio: '',
    facebook: '',
    instagram: '',
    twitter: ''
  })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [activeProfileTab, setActiveProfileTab] = useState<'info' | 'social'>('info')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [healthForm, setHealthForm] = useState<{
    weightKg: string
    heightM: string
    activityFactor: string
    practiceLevel: PracticeLevel
  }>({
    weightKg: '',
    heightM: '',
    activityFactor: '1.55',
    practiceLevel: 'MEDIUM'
  })
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null)
  const [healthSaving, setHealthSaving] = useState(false)
  const [healthError, setHealthError] = useState<string | null>(null)
  const [healthSuccess, setHealthSuccess] = useState<string | null>(null)
  const [healthNotice, setHealthNotice] = useState<string | null>(null)
  const [trainingLoading, setTrainingLoading] = useState(false)
  const [trainingError, setTrainingError] = useState<string | null>(null)
  const [sessionCards, setSessionCards] = useState<number[]>([])
  const [sessionItems, setSessionItems] = useState<Record<number, Array<{ name: string; muscle: string; calories: string }>>>({})
  const [exerciseLoading, setExerciseLoading] = useState(false)
  const [exerciseError, setExerciseError] = useState<string | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<'recommended' | 'library'>('recommended')
  const [sidebarTarget, setSidebarTarget] = useState<{ session: number; row: number } | null>(null)

  const recommendedSessionCount = useMemo(() => {
    if (trainingLoading || trainingError) return 0
    if (healthMetrics?.recommendedSessions) return healthMetrics.recommendedSessions
    if (!healthMetrics?.activityFactor) return 3
    const af = healthMetrics.activityFactor
    if (af < 1.3) return 2
    if (af < 1.5) return 3
    if (af < 1.65) return 4
    if (af < 1.8) return 5
    return 6
  }, [healthMetrics, trainingError, trainingLoading])

  // Sync session cards with recommended count
  useEffect(() => {
    if (activeSection !== 'training') return
    if (recommendedSessionCount <= 0) {
      setSessionCards([])
      setSessionItems({})
      return
    }
    setSessionCards((prev) => {
      if (prev.length === recommendedSessionCount) return prev
      const next = Array.from({ length: recommendedSessionCount }, (_, i) => i + 1)
      return next
    })
  }, [activeSection, recommendedSessionCount])

  // Ensure items map has entries for each card
  useEffect(() => {
    if (activeSection !== 'training') return
    setSessionItems((prev) => {
      let changed = false
      const next = { ...prev }
      sessionCards.forEach((order) => {
        if (!next[order]) {
          next[order] = [
            { name: '', muscle: '', calories: '' },
            { name: '', muscle: '', calories: '' },
            { name: '', muscle: '', calories: '' }
          ]
          changed = true
        }
      })
      return changed ? next : prev
    })
  }, [activeSection, sessionCards])
  // Get avatar URL from profile or form, fallback to empty string
  const currentAvatarUrl = profile?.avatarUrl || profileForm.avatarUrl || ''

  const initials = userName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  // Load saved health metrics to prefill form and sidebar summary
  useEffect(() => {
    const stored = localStorage.getItem('healthMetrics')
    if (!stored) return
    try {
      const parsed = JSON.parse(stored) as HealthMetrics
      setHealthMetrics(parsed)
      setHealthForm((prev) => ({
        ...prev,
        weightKg: parsed.weightKg ? parsed.weightKg.toString() : '',
        heightM: parsed.heightM ? parsed.heightM.toString() : '',
        activityFactor: parsed.activityFactor ? parsed.activityFactor.toString() : prev.activityFactor,
        practiceLevel: parsed.practiceLevel || prev.practiceLevel
      }))
    } catch {
      // ignore malformed cache
    }
  }, [])

  // Load profile data when component mounts to get avatar for sidebar
  useEffect(() => {
    if (profile) return // Already loaded

    ;(async () => {
      try {
        const res = await getProfile()
        if (res.success && res.data) {
          setProfile(res.data)
        }
      } catch {
        // Silently fail for initial load, error will show if user goes to profile page
      }
    })()
  }, [profile])

  // Load profile data when on profile page to populate form
  useEffect(() => {
    if (activeSection !== 'profile') return

    ;(async () => {
      try {
        setProfileLoading(true)
        setProfileError(null)
        const res = await getProfile()
        if (!res.success || !res.data) {
          setProfileError(res.message || 'Unable to load profile')
          return
        }
        const data = res.data
        setProfile(data) // Update profile state
        const avatarUrl = data.avatarUrl ?? ''
        setAvatarPreview(null) // Reset preview when loading from API
        setProfileForm((prev) => ({
          ...prev,
          displayName: data.displayName ?? userName ?? 'User',
          avatarUrl: avatarUrl,
          birthDate: data.birthDate ? data.birthDate.substring(0, 10) : '',
          gender: (data.gender as string) ?? '',
          bio: data.bio ?? ''
        }))
      } catch {
        setProfileError('Unable to load profile. Please try again.')
      } finally {
        setProfileLoading(false)
      }
    })()
  }, [activeSection, userName])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  // Fetch latest BMI record when user enters training page to sync session recommendations
  useEffect(() => {
    if (activeSection !== 'training') return
    let cancelled = false
    ;(async () => {
      try {
        setTrainingLoading(true)
        setTrainingError(null)
        const res = await getMyBmiRecords()
        if (!res.success || !res.data || res.data.length === 0) {
          if (!cancelled) setTrainingError('Chưa có dữ liệu sức khoẻ. Hãy cập nhật tại “Chỉ Số Sức Khoẻ”.')
          return
        }
        const current = res.data.find((r) => r.isCurrent || (r as any).IsCurrent) ?? res.data[0]
        const bmiValue = current.BMI ?? current.bmi
        const assessmentValue = current.Assessment ?? current.assessment
        const activityFactorValue = current.ActivityFactor ?? current.activityFactor
        const practiceLevelValue = (current.PracticeLevel ?? current.practiceLevel) as PracticeLevel
        const goalObj = (current.Goal ?? current.goal) as Record<string, unknown> | undefined
        const tdeeFromGoal = goalObj && typeof goalObj['tdee'] === 'number' ? (goalObj['tdee'] as number) : undefined
        const planObj = goalObj && (goalObj['plan'] as Record<string, unknown> | undefined)
        const sessionsPerWeek = planObj && typeof planObj['ExercisePerWeek'] === 'number'
          ? (planObj['ExercisePerWeek'] as number)
          : planObj && typeof planObj['exercisePerWeek'] === 'number'
            ? (planObj['exercisePerWeek'] as number)
            : undefined

        const nextMetrics: HealthMetrics = {
          weightKg: current.weightKg ?? (current as any).WeightKg ?? 0,
          heightM: current.heightCm ? current.heightCm / 100 : (current as any).HeightCm ? ((current as any).HeightCm as number) / 100 : 0,
          activityFactor: activityFactorValue ?? 0,
          practiceLevel: practiceLevelValue || 'MEDIUM',
          bmi: bmiValue,
          assessment: assessmentValue,
          dailyCalories: tdeeFromGoal,
          recommendedSessions: sessionsPerWeek
        }

        if (!cancelled) {
          setHealthMetrics(nextMetrics)
          localStorage.setItem('healthMetrics', JSON.stringify(nextMetrics))
        }
      } catch {
        if (!cancelled) setTrainingError('Không thể tải dữ liệu sức khoẻ.')
      } finally {
        if (!cancelled) setTrainingLoading(false)
      }
    })()

    // Load exercise library for selection
    ;(async () => {
      try {
        setExerciseLoading(true)
        setExerciseError(null)
        const res = await getExercises({ page: 1, pageSize: 50 })
        if (!res.success || !res.data) {
          setExerciseError(res.message || 'Không thể tải thư viện bài tập.')
          return
        }
        setExercises(res.data.exercises || [])
      } catch {
        setExerciseError('Không thể tải thư viện bài tập.')
      } finally {
        setExerciseLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [activeSection])

  const handleSelectSection = (section: MainSection) => {
    setHealthNotice(null)
    onSelectSection(section)
  }

  const recommendedExercises: Array<{ name: string; muscle: string; calories: string }> = [
    { name: 'Lunges', muscle: 'Legs', calories: '20' },
    { name: 'Push-ups', muscle: 'Chest', calories: '15' },
    { name: 'Bent-over Row', muscle: 'Back', calories: '18' },
    { name: 'Squat', muscle: 'Legs', calories: '22' },
    { name: 'Plank', muscle: 'Core', calories: '8' },
    { name: 'Mountain Climbers', muscle: 'Core', calories: '12' }
  ]

  const openSidebar = (session: number, row: number) => {
    setSidebarTarget({ session, row })
    setSidebarOpen(true)
    setSidebarTab('recommended')
    // lazy load exercises if not loaded
    if (!exercises.length && !exerciseLoading && !exerciseError) {
      ;(async () => {
        try {
          setExerciseLoading(true)
          const res = await getExercises({ page: 1, pageSize: 50 })
          if (res.success && res.data) {
            setExercises(res.data.exercises || [])
          } else if (!res.success) {
            setExerciseError(res.message || 'Không thể tải thư viện bài tập.')
          }
        } catch {
          setExerciseError('Không thể tải thư viện bài tập.')
        } finally {
          setExerciseLoading(false)
        }
      })()
    }
  }

  const selectExerciseToRow = (exercise: { name?: string; title?: string; muscle?: string; primaryMuscle?: string; calories?: string | number }) => {
    if (!sidebarTarget) return
    const { session, row } = sidebarTarget
    setSessionItems((prev) => {
      const next = { ...prev }
      const rows = next[session] ? [...next[session]] : []
      while (rows.length < row + 1) rows.push({ name: '', muscle: '', calories: '' })
      rows[row] = {
        name: exercise.name || exercise.title || '',
        muscle: exercise.muscle || exercise.primaryMuscle || '',
        calories: exercise.calories !== undefined ? String(exercise.calories) : rows[row]?.calories || ''
      }
      next[session] = rows
      return next
    })
    setSidebarOpen(false)
    setSidebarTarget(null)
  }
  const handleHealthChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'practiceLevel') {
      setHealthForm((prev) => ({ ...prev, practiceLevel: value as PracticeLevel }))
      return
    }
    setHealthForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Store the file for later upload
      setAvatarFile(file)

      // Create preview URL for immediate display
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setAvatarPreview(result)
        // Keep the preview URL temporarily, will be replaced with Cloudinary URL after upload
        setProfileForm((prev) => ({ ...prev, avatarUrl: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      setProfileSaving(true)
      setProfileError(null)
      setProfileMessage(null)

      let avatarUrlToSend = profileForm.avatarUrl

      // If there's a new file to upload, upload it to Cloudinary first
      if (avatarFile) {
        try {
          setUploadingAvatar(true)
          const uploadResult = await uploadImage(avatarFile)

          if (!uploadResult.success || !uploadResult.url) {
            setProfileError(uploadResult.error || 'Failed to upload avatar image')
            setUploadingAvatar(false)
            return
          }

          avatarUrlToSend = uploadResult.url
          setAvatarPreview(null) // Clear preview after successful upload
          setAvatarFile(null) // Clear file reference
        } catch (error) {
          setProfileError(error instanceof Error ? error.message : 'Failed to upload avatar image')
          setUploadingAvatar(false)
          return
        } finally {
          setUploadingAvatar(false)
        }
      } else {
        // If no new file, check if current avatarUrl is a base64 data URL
        // Base64 data URLs are too long and should not be sent to backend
        const isBase64Image = profileForm.avatarUrl.startsWith('data:image/')
        if (isBase64Image) {
          // Keep existing avatar URL if available, otherwise send empty string
          avatarUrlToSend = ''
        }
      }

      const body = {
        displayName: profileForm.displayName,
        avatarUrl: avatarUrlToSend,
        birthDate: profileForm.birthDate || new Date().toISOString(),
        gender: profileForm.gender || 'Other',
        bio: profileForm.bio
      }

      const res = await updateProfile(body)
      if (!res.success) {
        setProfileError(res.message || 'Failed to update profile')
        return
      }

      setProfileMessage('Profile updated successfully')
      if (res.data) {
        // Update profile state with new data including avatarUrl - this will update sidebar avatar
        setProfile(res.data)
        // Update form with the new avatar URL from response
        if (res.data.avatarUrl) {
          setProfileForm((prev) => ({ ...prev, avatarUrl: res.data!.avatarUrl! }))
        }
        // Clear avatar preview and file since upload is complete
        setAvatarPreview(null)
        setAvatarFile(null)
      }
    } catch {
      setProfileError('Failed to update profile. Please try again.')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleHealthSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setHealthError(null)
    setHealthSuccess(null)

    const weight = parseFloat(healthForm.weightKg)
    const height = parseFloat(healthForm.heightM)
    const activity = parseFloat(healthForm.activityFactor)

    if (Number.isNaN(weight) || Number.isNaN(height) || weight <= 0 || height <= 0) {
      setHealthError('Vui lòng nhập cân nặng và chiều cao hợp lệ.')
      return
    }
    if (Number.isNaN(activity) || activity <= 0) {
      setHealthError('Vui lòng chọn cường độ tập luyện hợp lệ.')
      return
    }

    try {
      setHealthSaving(true)
      const res = await createBmiRecord({
        weightKg: weight,
        heightCm: height * 100, // backend nhận cm
        practiceLevel: healthForm.practiceLevel,
        activityFactor: activity
      })

      if (!res.success) {
        setHealthError(res.message || 'Không thể lưu chỉ số sức khoẻ.')
        return
      }

      // Clear any notice that asked user to update health metrics
      setHealthNotice(null)

      const bmiValue = res.data?.bmi ?? res.data?.BMI
      const assessmentValue = res.data?.assessment ?? res.data?.Assessment
      const dailyCalories = res.data?.dailyCalories ?? res.data?.DailyCalories

      const nextMetrics: HealthMetrics = {
        weightKg: weight,
        heightM: height,
        activityFactor: activity,
        practiceLevel: healthForm.practiceLevel,
        bmi: bmiValue,
        assessment: assessmentValue,
        dailyCalories
      }

      setHealthMetrics(nextMetrics)
      localStorage.setItem('healthMetrics', JSON.stringify(nextMetrics))
      setHealthSuccess('Cập nhật thành công')
    } catch {
      setHealthError('Không thể lưu chỉ số sức khoẻ. Vui lòng thử lại.')
    } finally {
      setHealthSaving(false)
    }
  }

  return (
    <main className="main-layout">
      <aside className="sidebar">
        <ul className="sidebar-list">
          {sections.map((section) => (
            <li key={section}>
              <button
                type="button"
                className={`sidebar-item ${activeSection === section ? 'active' : ''}`}
                onClick={() => handleSelectSection(section)}
              >
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
              </button>
            </li>
          ))}
        </ul>
        <div className="sidebar-user">
          <div className="sidebar-user-info" onClick={() => setShowMenu((open) => !open)}>
            <div className="sidebar-user-avatar">
              {currentAvatarUrl ? (
                <img src={currentAvatarUrl} alt={userName} />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div>
              <p className="sidebar-user-name">{userName}</p>
              {(() => {
                const formattedBmi = healthMetrics?.bmi ? healthMetrics.bmi.toFixed(1) : '—'
                const formattedTdee = healthMetrics?.dailyCalories
                  ? Math.round(healthMetrics.dailyCalories).toLocaleString('vi-VN')
                  : '—'
                return (
                  <span className="sidebar-user-role">
                    BMI / TDEE<br />
                    {healthMetrics ? `${formattedBmi} / ${formattedTdee}` : 'Chưa có dữ liệu'}
                  </span>
                )
              })()}
            </div>
          </div>
          <button
            type="button"
            className="sidebar-user-icon sidebar-user-notification"
            aria-label="Notifications"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18H9C7.89543 18 7 17.1046 7 16V11C7 8.79086 8.79086 7 11 7H13C15.2091 7 17 8.79086 17 11V16C17 17.1046 16.1046 18 15 18Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 4C12.5523 4 13 4.44772 13 5C13 5.55228 12.5523 6 12 6C11.4477 6 11 5.55228 11 5C11 4.44772 11.4477 4 12 4Z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M10 18C10 19.1046 10.8954 20 12 20C13.1046 20 14 19.1046 14 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="sidebar-user-icon sidebar-user-settings"
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
                Hồ Sơ
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangePassword()
                  setShowMenu(false)
                }}
              >
                Đổi mật khẩu
              </button>
              <button
                type="button"
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
      <section className="main-content">
        {activeSection === 'profile' ? (
          <div className="profile-page">
            <h1 className="main-content-title">{title}</h1>
            {subtitle && <p className="main-content-subtitle">{subtitle}</p>}

            <div className="profile-layout">
              {/* Left: editable sections with tabbed content */}
              <form className="profile-form" onSubmit={handleProfileSubmit}>
                <div className="profile-tabs">
                  <button
                    type="button"
                    className={`profile-tab ${activeProfileTab === 'info' ? 'active' : ''}`}
                    onClick={() => setActiveProfileTab('info')}
                  >
                    Thông tin cá nhân
                  </button>
                  <button
                    type="button"
                    className={`profile-tab ${activeProfileTab === 'social' ? 'active' : ''}`}
                    onClick={() => setActiveProfileTab('social')}
                  >
                    Mạng xã hội
                  </button>
                </div>

                {activeProfileTab === 'info' && (
                  <>
                    <h2 className="profile-section-title">Thông tin cá nhân</h2>
                    <div className="profile-avatar-upload">
                      <div className="profile-avatar-preview">
                        {(avatarPreview || profileForm.avatarUrl) ? (
                          <img
                            src={avatarPreview || profileForm.avatarUrl}
                            alt={profileForm.displayName || userName}
                          />
                        ) : (
                          <span>{initials}</span>
                        )}
                        <button
                          type="button"
                          className="profile-avatar-upload-btn"
                          onClick={() => document.getElementById('avatarFileInput')?.click()}
                          aria-label="Upload avatar"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 15V3M12 3L8 7M12 3L16 7"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M2 17L2 19C2 20.1046 2.89543 21 4 21L20 21C21.1046 21 22 20.1046 22 19L22 17"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <input
                          id="avatarFileInput"
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleAvatarFileChange}
                        />
                      </div>
                    </div>
                    <div className="profile-grid">
                      <div className="profile-field">
                        <label htmlFor="displayName">Tên hiển thị</label>
                        <input
                          id="displayName"
                          name="displayName"
                          type="text"
                          value={profileForm.displayName}
                          onChange={handleProfileChange}
                          placeholder="Tên của bạn"
                        />
                      </div>
                    </div>

                    <div className="profile-grid">
                      <div className="profile-field">
                        <label htmlFor="birthDate">Ngày sinh</label>
                        <input
                          id="birthDate"
                          name="birthDate"
                          type="date"
                          value={profileForm.birthDate}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="profile-field">
                        <label htmlFor="gender">Giới tính</label>
                        <select
                          id="gender"
                          name="gender"
                          value={profileForm.gender}
                          onChange={handleProfileChange}
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="Male">Nam</option>
                          <option value="Female">Nữ</option>
                          <option value="Other">Khác</option>
                        </select>
                      </div>
                    </div>

                    <h2 className="profile-section-title">Về bạn</h2>
                    <div className="profile-field">
                      <label htmlFor="bio">Tiểu sử</label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={3}
                        value={profileForm.bio}
                        onChange={handleProfileChange}
                        placeholder="Hãy chia sẻ một chút về bản thân bạn"
                      />
                    </div>
                  </>
                )}

                {activeProfileTab === 'social' && (
                  <>
                    <h2 className="profile-section-title">Mạng xã hội</h2>
                    <div className="profile-grid">
                      <div className="profile-field">
                        <label htmlFor="facebook">Facebook</label>
                        <input
                          id="facebook"
                          name="facebook"
                          type="url"
                          value={profileForm.facebook}
                          onChange={handleProfileChange}
                          placeholder="https://facebook.com/your-profile"
                        />
                      </div>
                      <div className="profile-field">
                        <label htmlFor="instagram">Instagram</label>
                        <input
                          id="instagram"
                          name="instagram"
                          type="url"
                          value={profileForm.instagram}
                          onChange={handleProfileChange}
                          placeholder="https://instagram.com/your-handle"
                        />
                      </div>
                      <div className="profile-field">
                        <label htmlFor="twitter">Twitter / X</label>
                        <input
                          id="twitter"
                          name="twitter"
                          type="url"
                          value={profileForm.twitter}
                          onChange={handleProfileChange}
                          placeholder="https://x.com/your-handle"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="profile-actions">
                  <button type="submit" className="btn-primary" disabled={profileSaving || uploadingAvatar}>
                    {uploadingAvatar ? 'Đang tải ảnh lên...' : profileSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                  {profileLoading && <span className="profile-status">Đang tải hồ sơ...</span>}
                  {uploadingAvatar && <span className="profile-status">Đang tải avatar lên Cloudinary...</span>}
                  {profileMessage && <span className="profile-status success">{profileMessage}</span>}
                  {profileError && <span className="profile-status error">{profileError}</span>}
                </div>
              </form>

              {/* Right: live preview */}
              <aside className="profile-summary">
                <div className="profile-summary-header">
                  <div className="profile-summary-avatar">
                    {(avatarPreview || profileForm.avatarUrl) ? (
                      <img
                        src={avatarPreview || profileForm.avatarUrl}
                        alt={profileForm.displayName || userName}
                      />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="profile-summary-name">
                      {profileForm.displayName || userName}
                    </h3>
                    <p className="profile-summary-role">Người dùng Alaca · Tổng quan mạng xã hội</p>
                  </div>
                </div>

                <div className="profile-summary-section">
                  <h4>Thông tin cá nhân</h4>
                  <ul>
                    <li>
                      <span>Ngày sinh</span>
                      <strong>{profileForm.birthDate || 'Chưa thiết lập'}</strong>
                    </li>
                    <li>
                      <span>Giới tính</span>
                      <strong>{profileForm.gender || 'Chưa thiết lập'}</strong>
                    </li>
                  </ul>
                </div>

                <div className="profile-summary-section">
                  <h4>Mạng xã hội</h4>
                  <ul className="profile-summary-social">
                    <li className={!profileForm.facebook ? 'muted' : ''}>
                      <span>Facebook</span>
                      <strong>{profileForm.facebook || 'Chưa kết nối'}</strong>
                    </li>
                    <li className={!profileForm.instagram ? 'muted' : ''}>
                      <span>Instagram</span>
                      <strong>{profileForm.instagram || 'Chưa kết nối'}</strong>
                    </li>
                    <li className={!profileForm.twitter ? 'muted' : ''}>
                      <span>Twitter / X</span>
                      <strong>{profileForm.twitter || 'Chưa kết nối'}</strong>
                    </li>
                  </ul>
                </div>

                <div className="profile-summary-section">
                  <h4>Tiểu sử</h4>
                  <p className="profile-summary-bio">
                    {profileForm.bio || 'Bạn chưa thêm tiểu sử.'}
                  </p>
                </div>
              </aside>
            </div>
          </div>
        ) : activeSection === 'health' ? (
          <div className="health-metrics">
            <h1 className="main-content-title">Chỉ Số Sức Khoẻ</h1>
            <p className="main-content-subtitle">Nhập cân nặng, chiều cao và mức vận động để lưu vào hồ sơ.</p>
            {healthNotice && <p className="health-status notice">{healthNotice}</p>}

            <form className="health-form" onSubmit={handleHealthSubmit}>
              <div className="health-grid">
                <div className="health-field">
                  <label htmlFor="weightKg">Cân nặng (kg)</label>
                  <input
                    id="weightKg"
                    name="weightKg"
                    type="number"
                    min="1"
                    step="0.1"
                    value={healthForm.weightKg}
                    onChange={handleHealthChange}
                    required
                    placeholder="Ví dụ: 70"
                  />
                </div>

                <div className="health-field">
                  <label htmlFor="heightM">Chiều cao (m)</label>
                  <input
                    id="heightM"
                    name="heightM"
                    type="number"
                    min="0.5"
                    max="2.5"
                    step="0.01"
                    value={healthForm.heightM}
                    onChange={handleHealthChange}
                    required
                    placeholder="Ví dụ: 1.75"
                  />
                </div>

                <div className="health-field">
                  <label htmlFor="activityFactor">Cường độ tập luyện</label>
                  <select
                    id="activityFactor"
                    name="activityFactor"
                    value={healthForm.activityFactor}
                    onChange={handleHealthChange}
                  >
                    <option value="1.2">Ít vận động — 1.2</option>
                    <option value="1.375">Vận động nhẹ — 1.375</option>
                    <option value="1.55">Vận động vừa phải — 1.55</option>
                    <option value="1.725">Vận động nhiều — 1.725</option>
                    <option value="1.9">Vận động rất nhiều — 1.9</option>
                  </select>
                </div>

                <div className="health-field">
                  <label htmlFor="practiceLevel">Mức độ vận động</label>
                  <select
                    id="practiceLevel"
                    name="practiceLevel"
                    value={healthForm.practiceLevel}
                    onChange={handleHealthChange}
                  >
                    <option value="PRO">Pro</option>
                    <option value="HARD">Hard</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="EASY">Easy</option>
                    <option value="NEWBIE">Newbie</option>
                  </select>
                </div>
              </div>

              <div className="health-actions">
                <button type="submit" className="btn-primary" disabled={healthSaving}>
                  {healthSaving ? 'Đang lưu...' : 'Lưu & tính BMI'}
                </button>
                {healthError && <span className="health-status error">{healthError}</span>}
                {healthSuccess && <span className="health-status success">{healthSuccess}</span>}
              </div>
            </form>

            {healthMetrics && (
              <div className="health-result">
                <h3>Kết quả gần nhất</h3>
                <div className="health-result-grid">
                  <div className="health-result-item">
                    <span>BMI</span>
                    <strong>{healthMetrics.bmi ? healthMetrics.bmi.toFixed(2) : '—'}</strong>
                  </div>
                  <div className="health-result-item">
                    <span>Đánh giá</span>
                    <strong>{healthMetrics.assessment || '—'}</strong>
                  </div>
                  <div className="health-result-item">
                    <span>TDEE (kcal)</span>
                    <strong>{healthMetrics.dailyCalories ? `${Math.round(healthMetrics.dailyCalories)} kcal` : '—'}</strong>
                  </div>
                  <div className="health-result-item">
                    <span>Cường độ</span>
                    <strong>{healthMetrics.activityFactor}</strong>
                  </div>
                  <div className="health-result-item">
                    <span>Mức độ</span>
                    <strong>{healthMetrics.practiceLevel}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : activeSection === 'training' ? (
          <div className="training-page">
            <div className="training-header">
              <div>
                <h1 className="main-content-title">Luyện Tập</h1>
                <p className="main-content-subtitle">Kế hoạch gợi ý dựa trên TDEE và mức vận động của bạn.</p>
              </div>
              <div className="training-stat">
                <span>TDEE</span>
                <strong>
                  {trainingLoading
                    ? 'Đang tải...'
                    : trainingError
                      ? '—'
                      : healthMetrics?.dailyCalories
                        ? Math.round(healthMetrics.dailyCalories).toLocaleString('vi-VN')
                        : 'Chưa có'}
                </strong>
              </div>
            </div>

            {trainingError && (
              <div className="health-status error" style={{ margin: 0 }}>
                {trainingError}
              </div>
            )}

            <div className="training-recommend">
              <div className="training-recommend-text">
                <p className="label">Số buổi/tuần (Recommend)</p>
                <h3>
                  {(() => {
                    if (trainingLoading) return 'Đang tải...'
                    if (trainingError) return '—'
                    if (healthMetrics?.recommendedSessions) return `${healthMetrics.recommendedSessions} buổi`
                    if (!healthMetrics?.activityFactor) return '—'
                    const af = healthMetrics.activityFactor
                    if (af < 1.3) return '2 buổi'
                    if (af < 1.5) return '3 buổi'
                    if (af < 1.65) return '4 buổi'
                    if (af < 1.8) return '5 buổi'
                    return '6 buổi'
                  })()}
                </h3>
              </div>
            </div>

            {trainingLoading && <p className="muted">Đang tải dữ liệu...</p>}
            {trainingError && <p className="muted">Chưa có chỉ số sức khoẻ.</p>}

            {!trainingLoading && !trainingError && (
              <div className="workout-grid">
                {sessionCards.length === 0 && <p className="muted">Chưa có buổi tập nào.</p>}
                {sessionCards.map((order) => (
                  <div className="workout-card" key={`session-${order}`}>
                    <div className="workout-card-header">
                      <div>
                        <p className="workout-title">Buổi {order}</p>
                        <p className="workout-focus">Tuỳ chỉnh bài tập của bạn</p>
                      </div>
                      <button className="workout-menu-btn" type="button" aria-label={`Xem chi tiết buổi ${order}`}>
                        ⋮
                      </button>
                      <button
                        type="button"
                        className="workout-remove-btn"
                        onClick={() =>
                          setSessionCards((prev) => prev.filter((n) => n !== order))
                        }
                        aria-label={`Xoá buổi ${order}`}
                      >
                        ×
                      </button>
                    </div>
                    <div className="workout-meta table">
                      <div className="workout-row header">
                        <span>Tên bài tập</span>
                        <span>Nhóm cơ</span>
                        <span>Calories/1 set</span>
                        <span></span>
                      </div>
                      {(sessionItems[order] || []).map((item, idx) => (
                        <div className="workout-row" key={`session-${order}-row-${idx}`}>
                          <span>{item.name || 'Chưa có'}</span>
                          <span>{item.muscle || '---'}</span>
                          <span>{item.calories || '---'}</span>
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => openSidebar(order, idx)}
                            aria-label="Thay đổi bài tập"
                          >
                            ✎
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {sidebarOpen && sidebarTarget && (
              <div className="exercise-sidebar">
                <div className="exercise-sidebar-header">
                  <div>
                    <p className="sidebar-title">Buổi {sidebarTarget.session} · Dòng {sidebarTarget.row + 1}</p>
                    <p className="sidebar-subtitle">Chọn bài tập để thêm</p>
                  </div>
                  <button type="button" className="workout-remove-btn" onClick={() => setSidebarOpen(false)} aria-label="Đóng">
                    ×
                  </button>
                </div>
                <div className="exercise-tabs">
                  <button
                    type="button"
                    className={`exercise-tab ${sidebarTab === 'recommended' ? 'active' : ''}`}
                    onClick={() => setSidebarTab('recommended')}
                  >
                    Bài tập đề xuất
                  </button>
                  <button
                    type="button"
                    className={`exercise-tab ${sidebarTab === 'library' ? 'active' : ''}`}
                    onClick={() => setSidebarTab('library')}
                  >
                    Thư viện bài tập
                  </button>
                </div>

                <div className="exercise-list">
                  {sidebarTab === 'recommended' &&
                    recommendedExercises.map((ex) => (
                      <div className="exercise-item" key={`${ex.name}-${ex.muscle}`}>
                        <div>
                          <p className="exercise-title">{ex.name}</p>
                          <p className="exercise-meta">
                            {ex.muscle} · {ex.calories} cal/set
                          </p>
                        </div>
                        <button type="button" className="btn-primary small" onClick={() => selectExerciseToRow(ex)}>
                          +
                        </button>
                      </div>
                    ))}

                  {sidebarTab === 'library' && (
                    <>
                      {exerciseLoading && <p className="muted">Đang tải thư viện...</p>}
                      {exerciseError && <p className="muted">{exerciseError}</p>}
                      {!exerciseLoading &&
                        !exerciseError &&
                        exercises.map((ex) => (
                          <div className="exercise-item" key={ex.id}>
                            <div>
                              <p className="exercise-title">{ex.title}</p>
                              <p className="exercise-meta">
                                {(ex.primaryMuscle || '---')}{' '}
                                {ex.description ? `· ${ex.description.substring(0, 40)}...` : ''}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="btn-primary small"
                              onClick={() =>
                                selectExerciseToRow({
                                  name: ex.title,
                                  muscle: ex.primaryMuscle || '',
                                  calories: ''
                                })
                              }
                            >
                              +
                            </button>
                          </div>
                        ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {activeSection === 'social' && <SocialPage />}
            {activeSection !== 'social' && (
              <>
                <h1 className="main-content-title">{title}</h1>
                <p className="main-content-subtitle">{subtitle}</p>
              </>
            )}
          </>
        )}
      </section>
    </main>
  )
}

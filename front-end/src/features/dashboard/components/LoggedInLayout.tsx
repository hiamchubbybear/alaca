import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { createBmiRecord, getMyBmiRecords, type PracticeLevel } from '../../../shared/api/bmiApi'
import { getExerciseRecommendations, getExercises, type Exercise } from '../../../shared/api/exerciseApi'
import {
  createCustomWeeklySchedule,
  getMySchedule,
  type ScheduleResponse
} from '../../../shared/api/workoutScheduleApi'
import { uploadImage } from '../../../shared/services/cloudinaryService'
import { ChatWidget } from '../../chat/components/ChatWidget'
import { getProfile, updateProfile, type ProfileResponse } from '../../profile/api/profileApi'
import { SocialPage } from '../../social/components/SocialPage'
import { NotificationPage } from './NotificationPage'

export type MainSection =
  | 'training'
  | 'nutrition'
  | 'progress'
  | 'challenge'
  | 'social'
  | 'health'
  | 'profile'
  | 'notification'

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
  },
  notification: {
    title: 'Thông Báo',
    subtitle: 'Xem thông báo mới nhất từ hệ thống và quản trị viên.'
  }
}

type NavSection = Exclude<MainSection, 'profile'>

const sections: NavSection[] = ['training', 'nutrition', 'progress', 'challenge', 'social', 'health', 'notification']

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
  const { title, subtitle } =
    activeSection === 'profile' ? { title: 'Hồ Sơ', subtitle: '' } : sectionContent[activeSection as NavSection]
  const [showMenu, setShowMenu] = useState(false)

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
  const [isEditingHealth, setIsEditingHealth] = useState(false)
  const [healthLoading, setHealthLoading] = useState(false)
  const [trainingLoading, setTrainingLoading] = useState(false)
  const [trainingError, setTrainingError] = useState<string | null>(null)
  const [sessionCards, setSessionCards] = useState<number[]>([])
  const [sessionItems, setSessionItems] = useState<
    Record<number, Array<{ name: string; muscle: string; calories: string }>>
  >({})
  const [exerciseLoading, setExerciseLoading] = useState(false)
  const [exerciseError, setExerciseError] = useState<string | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [recommendedExercises, setRecommendedExercises] = useState<Exercise[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<'recommended' | 'library'>('recommended')
  const [sidebarTarget, setSidebarTarget] = useState<{ session: number; row: number } | null>(null)
  const [exerciseDetailModal, setExerciseDetailModal] = useState<Exercise | null>(null)
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

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

  useEffect(() => {
    if (activeSection !== 'training') return
    setSessionItems((prev) => {
      let changed = false
      const next = { ...prev }
      sessionCards.forEach((order) => {
        if (!next[order]) {
          next[order] = []
          changed = true
        }
      })
      return changed ? next : prev
    })
  }, [activeSection, sessionCards])

  const currentAvatarUrl = profile?.avatarUrl || profileForm.avatarUrl || ''

  const initials = userName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const loadHealthMetricsFromResponse = (res: any) => {
    if (res.success && res.data && res.data.length > 0) {
      const latest = res.data.sort((a: any, b: any) => {
        const dateA = a.recordedAt || a.RecordedAt || ''
        const dateB = b.recordedAt || b.RecordedAt || ''
        return new Date(dateB).getTime() - new Date(dateA).getTime()
      })[0]

      let dailyCalories: number | undefined = undefined
      let recommendedSessions: number | undefined = undefined
      const goal = latest.goal || latest.Goal
      if (goal && typeof goal === 'object') {
        const tdee = (goal as any).tdee || (goal as any).TDEE
        if (typeof tdee === 'number') {
          dailyCalories = tdee
        }

        const plan = (goal as any).plan || (goal as any).Plan
        if (plan && typeof plan === 'object') {
          const exercisePerWeek = plan.ExercisePerWeek || plan.exercisePerWeek
          if (typeof exercisePerWeek === 'number') {
            recommendedSessions = exercisePerWeek
          }
        }

        if (!recommendedSessions) {
          const sessions =
            (goal as any).recommendedSessions ||
            (goal as any).RecommendedSessions ||
            (goal as any).recommendedDays ||
            (goal as any).RecommendedDays
          if (typeof sessions === 'number') {
            recommendedSessions = sessions
          }
        }
      }

      const metrics: HealthMetrics = {
        weightKg: latest.weightKg || 0,
        heightM: latest.heightCm ? latest.heightCm / 100 : 0,
        activityFactor: latest.activityFactor || latest.ActivityFactor || 1.55,
        practiceLevel: (latest.practiceLevel || latest.PracticeLevel || 'MEDIUM') as PracticeLevel,
        bmi: latest.bmi || latest.BMI,
        assessment: latest.assessment || latest.Assessment,
        dailyCalories: dailyCalories,
        recommendedSessions: recommendedSessions
      }

      setHealthMetrics(metrics)
      return metrics
    }
    return null
  }

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await getMyBmiRecords()
        if (!cancelled) {
          loadHealthMetricsFromResponse(res)
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

  useEffect(() => {
    if (activeSection !== 'health') return
    ;(async () => {
      try {
        setHealthLoading(true)
        setHealthError(null)
        const res = await getMyBmiRecords()

        const metrics = loadHealthMetricsFromResponse(res)

        if (metrics) {
          setHealthForm({
            weightKg: metrics.weightKg ? metrics.weightKg.toString() : '',
            heightM: metrics.heightM ? metrics.heightM.toString() : '',
            activityFactor: metrics.activityFactor ? metrics.activityFactor.toString() : '1.55',
            practiceLevel: metrics.practiceLevel || 'MEDIUM'
          })
          setIsEditingHealth(false)
        } else {
          setIsEditingHealth(true)
        }
      } catch (error) {
        console.error('Failed to load health metrics:', error)

        setIsEditingHealth(true)
      } finally {
        setHealthLoading(false)
      }
    })()
  }, [activeSection])

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
        setProfile(data)
        const avatarUrl = data.avatarUrl ?? ''
        setAvatarPreview(null)
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

  useEffect(() => {
    if (activeSection !== 'training') return
    ;(async () => {
      try {
        if (!healthMetrics || !healthMetrics.bmi) {
          const bmiRes = await getMyBmiRecords()
          if (!bmiRes.success || !bmiRes.data || bmiRes.data.length === 0) {
            setHealthNotice('Vui lòng nhập chỉ số sức khoẻ trước khi sử dụng tính năng Tập luyện.')
            onSelectSection('health')
            setIsEditingHealth(true)
            return
          }

          const metrics = loadHealthMetricsFromResponse(bmiRes)
          if (!metrics || !metrics.bmi) {
            setHealthNotice('Vui lòng nhập chỉ số sức khoẻ trước khi sử dụng tính năng Tập luyện.')
            onSelectSection('health')
            setIsEditingHealth(true)
            return
          }
        }

        setTrainingLoading(true)

        const [bmiRes, scheduleRes] = await Promise.all([getMyBmiRecords(), getMySchedule()])

        if (bmiRes.success && bmiRes.data && bmiRes.data.length > 0) {
          const latest = bmiRes.data.sort(
            (a, b) =>
              new Date(b.recordedAt || b.RecordedAt || 0).getTime() -
              new Date(a.recordedAt || a.RecordedAt || 0).getTime()
          )[0]

          let dailyCalories: number | undefined = undefined
          let recommendedSessions: number | undefined = undefined
          const goal = latest.goal || latest.Goal
          if (goal && typeof goal === 'object') {
            const tdee = (goal as any).tdee || (goal as any).TDEE
            if (typeof tdee === 'number') {
              dailyCalories = tdee
            }

            const plan = (goal as any).plan || (goal as any).Plan
            if (plan && typeof plan === 'object') {
              const exercisePerWeek = plan.ExercisePerWeek || plan.exercisePerWeek
              if (typeof exercisePerWeek === 'number') {
                recommendedSessions = exercisePerWeek
              }
            }

            if (!recommendedSessions) {
              const sessions =
                (goal as any).recommendedSessions ||
                (goal as any).RecommendedSessions ||
                (goal as any).recommendedDays ||
                (goal as any).RecommendedDays
              if (typeof sessions === 'number') {
                recommendedSessions = sessions
              }
            }
          }

          setHealthMetrics({
            weightKg: latest.weightKg || 0,
            heightM: latest.heightCm ? latest.heightCm / 100 : 0,
            activityFactor: latest.activityFactor || 1.2,
            practiceLevel: latest.practiceLevel || 'MEDIUM',
            bmi: latest.bmi,
            assessment: latest.assessment,

            dailyCalories: dailyCalories
          })
        }

        if (scheduleRes.success && scheduleRes.data && scheduleRes.data.length > 0) {
          const schedules = scheduleRes.data as ScheduleResponse[]

          const sessionNums = Array.from(new Set(schedules.map((s) => s.sessionNumber))).sort((a, b) => a - b)
          setSessionCards(sessionNums)

          setSessionItems((prev) => {
            const next = { ...prev }
            schedules.forEach((s) => {
              const rowItems = s.exercises.map((ex) => ({
                name: ex.exerciseTitle,
                muscle: '',
                calories: ''
              }))

              next[s.sessionNumber] = rowItems
            })
            return next
          })
        }

        setTrainingLoading(false)
      } catch (error) {
        console.error('Failed to load training data', error)
        setTrainingError('Failed to load training data')
        setTrainingLoading(false)
      }
    })()
  }, [activeSection])

  useEffect(() => {
    if (activeSection !== 'training') return
    ;(async () => {
      try {
        setExerciseLoading(true)
        setExerciseError(null)
        const res = await getExercises(1, 50)
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
    ;(async () => {
      try {
        const response = await getExerciseRecommendations()
        if (response.data?.exercises) {
          setRecommendedExercises(response.data.exercises)
        }
      } catch (error) {
        console.error('Failed to load recommended exercises:', error)
      } finally {
      }
    })()
  }, [activeSection])

  const handleSelectSection = async (section: MainSection) => {
    setHealthNotice(null)

    if (section === 'training') {
      if (!healthMetrics || !healthMetrics.bmi) {
        try {
          const res = await getMyBmiRecords()
          if (res.success && res.data && res.data.length > 0) {
            const metrics = loadHealthMetricsFromResponse(res)
            if (metrics && metrics.bmi) {
              onSelectSection(section)
              return
            }
          }
        } catch (error) {
          console.error('Failed to check health metrics:', error)
        }

        setHealthNotice('Vui lòng nhập chỉ số sức khoẻ trước khi sử dụng tính năng Tập luyện.')
        onSelectSection('health')
        setIsEditingHealth(true)
        return
      }
    }

    onSelectSection(section)
  }

  const openSidebar = (session: number, row: number) => {
    setSidebarTarget({ session, row })
    setSidebarOpen(true)
    setSidebarTab('recommended')

    if (!exercises.length && !exerciseLoading && !exerciseError) {
      ;(async () => {
        try {
          setExerciseLoading(true)
          const res = await getExercises(1, 50)
          if (res.data?.exercises) {
            setExercises(res.data.exercises || [])
          } else {
            setExerciseError('Không thể tải thư viện bài tập.')
          }
        } catch {
          setExerciseError('Không thể tải thư viện bài tập.')
        } finally {
          setExerciseLoading(false)
        }
      })()
    }
  }

  const convertToEmbedUrl = (url: string | null | undefined): string | null => {
    if (!url) return null

    if (url.includes('/embed/')) {
      return url
    }

    let videoId: string | null = null

    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    if (watchMatch) {
      videoId = watchMatch[1]
    }

    const vMatch = url.match(/youtube\.com\/v\/([^&\n?#]+)/)
    if (vMatch) {
      videoId = vMatch[1]
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`
    }

    return null
  }

  const selectExerciseToRow = (exercise: {
    name?: string
    title?: string
    muscle?: string
    primaryMuscle?: string
    calories?: string | number
  }) => {
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

  const handleSaveSchedule = async () => {
    try {
      setSavingSchedule(true)
      setSaveError(null)
      setSaveSuccess(null)

      const sessions = sessionCards
        .map((sessionNumber) => {
          const sessionExerciseRequests = (sessionItems[sessionNumber] || [])
            .filter((item) => item.name)
            .map((item) => {
              const exercise = [...recommendedExercises, ...exercises].find((ex) => ex.title === item.name)

              return {
                exerciseId: exercise?.id || '',
                sets: 3,
                reps: 10,
                restSeconds: 60,
                notes: ''
              }
            })
            .filter((ex) => ex.exerciseId)

          return {
            sessionNumber,
            sessionName: `Buổi ${sessionNumber}`,
            exercises: sessionExerciseRequests
          }
        })
        .filter((session) => session.exercises.length > 0)

      if (sessions.length === 0) {
        setSaveError('Vui lòng thêm ít nhất một bài tập vào lịch tập!')
        return
      }

      const response = await createCustomWeeklySchedule({
        weekNumber: 1,
        sessions
      })

      if (response.success || response.data) {
        setSaveSuccess('Đã lưu lịch tập thành công!')

        setTimeout(() => setSaveSuccess(null), 3000)
      } else {
        setSaveError(response.message || 'Không thể lưu lịch tập')
      }
    } catch (error) {
      console.error('Save schedule error:', error)
      setSaveError('Đã xảy ra lỗi khi lưu lịch tập')
    } finally {
      setSavingSchedule(false)
    }
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
      setAvatarFile(file)

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setAvatarPreview(result)

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
          setAvatarPreview(null)
          setAvatarFile(null)
        } catch (error) {
          setProfileError(error instanceof Error ? error.message : 'Failed to upload avatar image')
          setUploadingAvatar(false)
          return
        } finally {
          setUploadingAvatar(false)
        }
      } else {
        const isBase64Image = profileForm.avatarUrl.startsWith('data:image/')
        if (isBase64Image) {
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
        setProfile(res.data)

        if (res.data.avatarUrl) {
          setProfileForm((prev) => ({ ...prev, avatarUrl: res.data!.avatarUrl! }))
        }

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
        heightCm: height * 100,
        practiceLevel: healthForm.practiceLevel,
        activityFactor: activity
      })

      if (!res.success) {
        setHealthError(res.message || 'Không thể lưu chỉ số sức khoẻ.')
        return
      }

      setHealthNotice(null)

      try {
        const bmiRecordsRes = await getMyBmiRecords()
        if (bmiRecordsRes.success && bmiRecordsRes.data && bmiRecordsRes.data.length > 0) {
          const latest = bmiRecordsRes.data.sort((a, b) => {
            const dateA = a.recordedAt || a.RecordedAt || ''
            const dateB = b.recordedAt || b.RecordedAt || ''
            return new Date(dateB).getTime() - new Date(dateA).getTime()
          })[0]

          let dailyCalories: number | undefined = undefined
          let recommendedSessions: number | undefined = undefined
          const goal = latest.goal || latest.Goal
          if (goal && typeof goal === 'object') {
            const tdee = (goal as any).tdee || (goal as any).TDEE
            if (typeof tdee === 'number') {
              dailyCalories = tdee
            }

            const plan = (goal as any).plan || (goal as any).Plan
            if (plan && typeof plan === 'object') {
              const exercisePerWeek = plan.ExercisePerWeek || plan.exercisePerWeek
              if (typeof exercisePerWeek === 'number') {
                recommendedSessions = exercisePerWeek
              }
            }

            if (!recommendedSessions) {
              const sessions =
                (goal as any).recommendedSessions ||
                (goal as any).RecommendedSessions ||
                (goal as any).recommendedDays ||
                (goal as any).RecommendedDays
              if (typeof sessions === 'number') {
                recommendedSessions = sessions
              }
            }
          }

          const nextMetrics: HealthMetrics = {
            weightKg: latest.weightKg || weight,
            heightM: latest.heightCm ? latest.heightCm / 100 : height,
            activityFactor: latest.activityFactor || latest.ActivityFactor || activity,
            practiceLevel: (latest.practiceLevel || latest.PracticeLevel || healthForm.practiceLevel) as PracticeLevel,
            bmi: latest.bmi || latest.BMI || res.data?.bmi || res.data?.BMI,
            assessment: latest.assessment || latest.Assessment || res.data?.assessment || res.data?.Assessment,
            dailyCalories: dailyCalories || res.data?.dailyCalories || res.data?.DailyCalories,
            recommendedSessions: recommendedSessions
          }

          setHealthMetrics(nextMetrics)
          localStorage.setItem('healthMetrics', JSON.stringify(nextMetrics))
        } else {
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
        }
      } catch (error) {
        console.error('Failed to reload BMI records after save:', error)

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
      }

      setHealthSuccess('Cập nhật thành công')
      setIsEditingHealth(false)

      if (activeSection === 'training') {
        try {
          const refreshRes = await getMyBmiRecords()
          if (refreshRes.success && refreshRes.data && refreshRes.data.length > 0) {
            const latest = refreshRes.data.sort((a, b) => {
              const dateA = a.recordedAt || a.RecordedAt || ''
              const dateB = b.recordedAt || b.RecordedAt || ''
              return new Date(dateB).getTime() - new Date(dateA).getTime()
            })[0]

            let dailyCalories: number | undefined = undefined
            let recommendedSessions: number | undefined = undefined
            const goal = latest.goal || latest.Goal
            if (goal && typeof goal === 'object') {
              const tdee = (goal as any).tdee || (goal as any).TDEE
              if (typeof tdee === 'number') {
                dailyCalories = tdee
              }

              const plan = (goal as any).plan || (goal as any).Plan
              if (plan && typeof plan === 'object') {
                const exercisePerWeek = plan.ExercisePerWeek || plan.exercisePerWeek
                if (typeof exercisePerWeek === 'number') {
                  recommendedSessions = exercisePerWeek
                }
              }

              if (!recommendedSessions) {
                const sessions =
                  (goal as any).recommendedSessions ||
                  (goal as any).RecommendedSessions ||
                  (goal as any).recommendedDays ||
                  (goal as any).RecommendedDays
                if (typeof sessions === 'number') {
                  recommendedSessions = sessions
                }
              }
            }

            setHealthMetrics({
              weightKg: latest.weightKg || 0,
              heightM: latest.heightCm ? latest.heightCm / 100 : 0,
              activityFactor: latest.activityFactor || latest.ActivityFactor || 1.55,
              practiceLevel: (latest.practiceLevel || latest.PracticeLevel || 'MEDIUM') as PracticeLevel,
              bmi: latest.bmi || latest.BMI,
              assessment: latest.assessment || latest.Assessment,
              dailyCalories: dailyCalories,
              recommendedSessions: recommendedSessions
            })
          }
        } catch (error) {
          console.error('Failed to refresh training data:', error)
        }
      }

      setTimeout(() => setHealthSuccess(null), 3000)
    } catch {
      setHealthError('Không thể lưu chỉ số sức khoẻ. Vui lòng thử lại.')
    } finally {
      setHealthSaving(false)
    }
  }

  return (
    <main className='main-layout'>
      <aside className='sidebar'>
        <ul className='sidebar-list'>
          {sections.map((section) => {
            const getSectionIcon = () => {
              switch (section) {
                case 'training':
                  return (
                    <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path
                        d='M20.57 14.86L22 13.43L20.57 12L17 15.57L8.43 7L12 3.43L10.57 2L9.14 3.43L7.71 2L5.57 4.14L4.14 2.71L2.71 4.14L4.14 5.57L2 7.71L3.43 9.14L7 5.57L15.57 14L12 17.57L13.43 19L14.86 17.57L16.29 19L18.43 16.86L19.86 18.29L21.29 16.86L19.86 15.43L20.57 14.86Z'
                        fill='currentColor'
                      />
                    </svg>
                  )
                case 'nutrition':
                  return (
                    <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path
                        d='M8.1 13.34L11 16.24L18.07 9.17L20.59 11.69C21.37 12.47 21.37 13.72 20.59 14.5L13.93 21.16C13.15 21.94 11.9 21.94 11.12 21.16L8.1 18.14C7.32 17.36 7.32 16.11 8.1 15.33L8.1 13.34ZM4.83 2.69L8.1 5.96L6.68 7.38L3.41 4.11C2.63 3.33 2.63 2.08 3.41 1.3C4.19 0.52 5.44 0.52 6.22 1.3L9.49 4.57L10.9 3.16L7.63 -0.11C6.85 -0.89 5.6 -0.89 4.82 -0.11C4.04 0.67 4.04 1.92 4.82 2.7L4.83 2.69Z'
                        fill='currentColor'
                      />
                    </svg>
                  )
                case 'progress':
                  return (
                    <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path d='M13 2L3 14H12L11 22L21 10H12L13 2Z' fill='currentColor' />
                    </svg>
                  )
                case 'challenge':
                  return (
                    <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path
                        d='M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z'
                        fill='currentColor'
                      />
                    </svg>
                  )
                case 'health':
                  return (
                    <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path
                        d='M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z'
                        fill='currentColor'
                      />
                    </svg>
                  )
                case 'social':
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
              <li key={section}>
                <button
                  type='button'
                  className={`sidebar-item ${activeSection === section ? 'active' : ''}`}
                  onClick={() => handleSelectSection(section)}
                >
                  <span className='sidebar-item-icon'>{getSectionIcon()}</span>
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
            )
          })}
        </ul>
        <div className='sidebar-user'>
          <div className='sidebar-user-info' onClick={() => setShowMenu((open) => !open)}>
            <div className='sidebar-user-avatar'>
              {currentAvatarUrl ? <img src={currentAvatarUrl} alt={userName} /> : <span>{initials}</span>}
            </div>
            <div>
              <p className='sidebar-user-name'>{userName}</p>
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
          <button type='button' className='sidebar-user-icon sidebar-user-notification' aria-label='Notifications'>
            <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M15 18H9C7.89543 18 7 17.1046 7 16V11C7 8.79086 8.79086 7 11 7H13C15.2091 7 17 8.79086 17 11V16C17 17.1046 16.1046 18 15 18Z'
                stroke='currentColor'
                strokeWidth='1.8'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M12 4C12.5523 4 13 4.44772 13 5C13 5.55228 12.5523 6 12 6C11.4477 6 11 5.55228 11 5C11 4.44772 11.4477 4 12 4Z'
                stroke='currentColor'
                strokeWidth='1.8'
              />
              <path
                d='M10 18C10 19.1046 10.8954 20 12 20C13.1046 20 14 19.1046 14 18'
                stroke='currentColor'
                strokeWidth='1.8'
                strokeLinecap='round'
              />
            </svg>
          </button>
          <button
            type='button'
            className='sidebar-user-icon sidebar-user-settings'
            onClick={() => setShowMenu((open) => !open)}
            aria-label='Open settings'
          >
            ⚙
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
      <section className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {activeSection === 'profile' ? (
          <div className='profile-page'>
            <h1 className='main-content-title'>{title}</h1>
            {subtitle && <p className='main-content-subtitle'>{subtitle}</p>}

            <div className='profile-layout'>
              {/* Left: editable sections with tabbed content */}
              <form className='profile-form' onSubmit={handleProfileSubmit}>
                <div className='profile-tabs'>
                  <button
                    type='button'
                    className={`profile-tab ${activeProfileTab === 'info' ? 'active' : ''}`}
                    onClick={() => setActiveProfileTab('info')}
                  >
                    Thông tin cá nhân
                  </button>
                  <button
                    type='button'
                    className={`profile-tab ${activeProfileTab === 'social' ? 'active' : ''}`}
                    onClick={() => setActiveProfileTab('social')}
                  >
                    Mạng xã hội
                  </button>
                </div>

                {activeProfileTab === 'info' && (
                  <>
                    <h2 className='profile-section-title'>Thông tin cá nhân</h2>
                    <div className='profile-avatar-upload'>
                      <div className='profile-avatar-preview'>
                        {avatarPreview || profileForm.avatarUrl ? (
                          <img src={avatarPreview || profileForm.avatarUrl} alt={profileForm.displayName || userName} />
                        ) : (
                          <span>{initials}</span>
                        )}
                        <button
                          type='button'
                          className='profile-avatar-upload-btn'
                          onClick={() => document.getElementById('avatarFileInput')?.click()}
                          aria-label='Upload avatar'
                        >
                          <svg
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                          >
                            <path
                              d='M12 15V3M12 3L8 7M12 3L16 7'
                              stroke='currentColor'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            />
                            <path
                              d='M2 17L2 19C2 20.1046 2.89543 21 4 21L20 21C21.1046 21 22 20.1046 22 19L22 17'
                              stroke='currentColor'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            />
                          </svg>
                        </button>
                        <input
                          id='avatarFileInput'
                          type='file'
                          accept='image/*'
                          style={{ display: 'none' }}
                          onChange={handleAvatarFileChange}
                        />
                      </div>
                    </div>
                    <div className='profile-grid'>
                      <div className='profile-field'>
                        <label htmlFor='displayName'>Tên hiển thị</label>
                        <input
                          id='displayName'
                          name='displayName'
                          type='text'
                          value={profileForm.displayName}
                          onChange={handleProfileChange}
                          placeholder='Tên của bạn'
                        />
                      </div>
                    </div>

                    <div className='profile-grid'>
                      <div className='profile-field'>
                        <label htmlFor='birthDate'>Ngày sinh</label>
                        <input
                          id='birthDate'
                          name='birthDate'
                          type='date'
                          value={profileForm.birthDate}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className='profile-field'>
                        <label htmlFor='gender'>Giới tính</label>
                        <select id='gender' name='gender' value={profileForm.gender} onChange={handleProfileChange}>
                          <option value=''>Chọn giới tính</option>
                          <option value='Male'>Nam</option>
                          <option value='Female'>Nữ</option>
                          <option value='Other'>Khác</option>
                        </select>
                      </div>
                    </div>

                    <h2 className='profile-section-title'>Về bạn</h2>
                    <div className='profile-field'>
                      <label htmlFor='bio'>Tiểu sử</label>
                      <textarea
                        id='bio'
                        name='bio'
                        rows={3}
                        value={profileForm.bio}
                        onChange={handleProfileChange}
                        placeholder='Hãy chia sẻ một chút về bản thân bạn'
                      />
                    </div>
                  </>
                )}

                {activeProfileTab === 'social' && (
                  <>
                    <h2 className='profile-section-title'>Mạng xã hội</h2>
                    <div className='profile-grid'>
                      <div className='profile-field'>
                        <label htmlFor='facebook'>Facebook</label>
                        <input
                          id='facebook'
                          name='facebook'
                          type='url'
                          value={profileForm.facebook}
                          onChange={handleProfileChange}
                          placeholder='https://facebook.com/your-profile'
                        />
                      </div>
                      <div className='profile-field'>
                        <label htmlFor='instagram'>Instagram</label>
                        <input
                          id='instagram'
                          name='instagram'
                          type='url'
                          value={profileForm.instagram}
                          onChange={handleProfileChange}
                          placeholder='https://instagram.com/your-handle'
                        />
                      </div>
                      <div className='profile-field'>
                        <label htmlFor='twitter'>Twitter / X</label>
                        <input
                          id='twitter'
                          name='twitter'
                          type='url'
                          value={profileForm.twitter}
                          onChange={handleProfileChange}
                          placeholder='https://x.com/your-handle'
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className='profile-actions'>
                  <button type='submit' className='btn-primary' disabled={profileSaving || uploadingAvatar}>
                    {uploadingAvatar ? 'Đang tải ảnh lên...' : profileSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                  {profileLoading && <span className='profile-status'>Đang tải hồ sơ...</span>}
                  {uploadingAvatar && <span className='profile-status'>Đang tải avatar lên Cloudinary...</span>}
                  {profileMessage && <span className='profile-status success'>{profileMessage}</span>}
                  {profileError && <span className='profile-status error'>{profileError}</span>}
                </div>
              </form>

              {/* Right: live preview */}
              <aside className='profile-summary'>
                <div className='profile-summary-header'>
                  <div className='profile-summary-avatar'>
                    {avatarPreview || profileForm.avatarUrl ? (
                      <img src={avatarPreview || profileForm.avatarUrl} alt={profileForm.displayName || userName} />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <div>
                    <h3 className='profile-summary-name'>{profileForm.displayName || userName}</h3>
                    <p className='profile-summary-role'>Người dùng Alaca · Tổng quan mạng xã hội</p>
                  </div>
                </div>

                <div className='profile-summary-section'>
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

                <div className='profile-summary-section'>
                  <h4>Mạng xã hội</h4>
                  <ul className='profile-summary-social'>
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

                <div className='profile-summary-section'>
                  <h4>Tiểu sử</h4>
                  <p className='profile-summary-bio'>{profileForm.bio || 'Bạn chưa thêm tiểu sử.'}</p>
                </div>
              </aside>
            </div>
          </div>
        ) : activeSection === 'health' ? (
          <div className='health-metrics'>
            <h1 className='main-content-title'>Chỉ Số Sức Khoẻ</h1>
            <p className='main-content-subtitle'>
              {isEditingHealth
                ? 'Nhập cân nặng, chiều cao và mức vận động để lưu vào hồ sơ.'
                : 'Xem và quản lý chỉ số sức khoẻ của bạn.'}
            </p>
            {healthNotice && <p className='health-status notice'>{healthNotice}</p>}

            {healthLoading ? (
              <p className='muted'>Đang tải dữ liệu...</p>
            ) : isEditingHealth ? (
              <form className='health-form' onSubmit={handleHealthSubmit}>
                <div className='health-grid'>
                  <div className='health-field'>
                    <label htmlFor='weightKg'>Cân nặng (kg)</label>
                    <input
                      id='weightKg'
                      name='weightKg'
                      type='number'
                      min='1'
                      step='0.1'
                      value={healthForm.weightKg}
                      onChange={handleHealthChange}
                      required
                      placeholder='Ví dụ: 70'
                    />
                  </div>

                  <div className='health-field'>
                    <label htmlFor='heightM'>Chiều cao (m)</label>
                    <input
                      id='heightM'
                      name='heightM'
                      type='number'
                      min='0.5'
                      max='2.5'
                      step='0.01'
                      value={healthForm.heightM}
                      onChange={handleHealthChange}
                      required
                      placeholder='Ví dụ: 1.75'
                    />
                  </div>

                  <div className='health-field'>
                    <label htmlFor='activityFactor'>Cường độ tập luyện</label>
                    <select
                      id='activityFactor'
                      name='activityFactor'
                      value={healthForm.activityFactor}
                      onChange={handleHealthChange}
                    >
                      <option value='1.2'>Ít vận động</option>
                      <option value='1.375'>Vận động nhẹ</option>
                      <option value='1.55'>Vận động vừa phải</option>
                      <option value='1.725'>Vận động nhiều</option>
                      <option value='1.9'>Vận động rất nhiều</option>
                    </select>
                  </div>

                  <div className='health-field'>
                    <label htmlFor='practiceLevel'>Mức độ vận động</label>
                    <select
                      id='practiceLevel'
                      name='practiceLevel'
                      value={healthForm.practiceLevel}
                      onChange={handleHealthChange}
                    >
                      <option value='PRO'>Chuyên nghiệp</option>
                      <option value='HARD'>Cao cấp</option>
                      <option value='MEDIUM'>Trung cấp</option>
                      <option value='EASY'>Dễ</option>
                      <option value='NEWBIE'>Bắt đầu</option>
                    </select>
                  </div>
                </div>

                <div className='health-actions'>
                  <button type='submit' className='btn-primary' disabled={healthSaving}>
                    {healthSaving ? 'Đang lưu...' : 'Lưu'}
                  </button>
                  <button
                    type='button'
                    className='btn-secondary'
                    onClick={() => {
                      setIsEditingHealth(false)
                      setHealthError(null)
                      setHealthSuccess(null)

                      if (healthMetrics) {
                        setHealthForm({
                          weightKg: healthMetrics.weightKg ? healthMetrics.weightKg.toString() : '',
                          heightM: healthMetrics.heightM ? healthMetrics.heightM.toString() : '',
                          activityFactor: healthMetrics.activityFactor
                            ? healthMetrics.activityFactor.toString()
                            : '1.55',
                          practiceLevel: healthMetrics.practiceLevel || 'MEDIUM'
                        })
                      }
                    }}
                    disabled={healthSaving}
                  >
                    Hủy
                  </button>
                  {healthError && <span className='health-status error'>{healthError}</span>}
                  {healthSuccess && <span className='health-status success'>{healthSuccess}</span>}
                </div>
              </form>
            ) : (
              <>
                {healthMetrics ? (
                  <div className='health-result'>
                    <h3>Chỉ số sức khoẻ của bạn</h3>
                    <div className='health-result-grid'>
                      <div className='health-result-item'>
                        <span>Cân nặng</span>
                        <strong>{healthMetrics.weightKg ? `${healthMetrics.weightKg} kg` : '—'}</strong>
                      </div>
                      <div className='health-result-item'>
                        <span>Chiều cao</span>
                        <strong>{healthMetrics.heightM ? `${healthMetrics.heightM} m` : '—'}</strong>
                      </div>
                      <div className='health-result-item'>
                        <span>BMI</span>
                        <strong>{healthMetrics.bmi ? healthMetrics.bmi.toFixed(2) : '—'}</strong>
                      </div>
                      <div className='health-result-item'>
                        <span>Đánh giá</span>
                        <strong>{healthMetrics.assessment || '—'}</strong>
                      </div>
                      <div className='health-result-item'>
                        <span>TDEE (kcal)</span>
                        <strong>
                          {healthMetrics.dailyCalories ? `${Math.round(healthMetrics.dailyCalories)} kcal` : '—'}
                        </strong>
                      </div>
                      <div className='health-result-item'>
                        <span>Cường độ</span>
                        <strong>{healthMetrics.activityFactor}</strong>
                      </div>
                      <div className='health-result-item'>
                        <span>Mức độ</span>
                        <strong>{healthMetrics.practiceLevel}</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className='muted'>Bạn chưa có dữ liệu chỉ số sức khoẻ. Hãy nhập thông tin để bắt đầu.</p>
                )}
                <div className='health-actions'>
                  <button type='button' className='btn-primary' onClick={() => setIsEditingHealth(true)}>
                    Chỉnh sửa
                  </button>
                </div>
              </>
            )}
          </div>
        ) : activeSection === 'training' ? (
          <div className='training-page'>
            <div className='training-header'>
              <div>
                <h1 className='main-content-title'>Luyện Tập</h1>
                <p className='main-content-subtitle'>Kế hoạch gợi ý dựa trên TDEE và mức vận động của bạn.</p>
              </div>
              <div className='training-stat'>
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
              <div className='health-status error' style={{ margin: 0 }}>
                {trainingError}
              </div>
            )}

            <div className='training-recommend'>
              <div className='training-recommend-text'>
                <p className='label'>Số buổi/tuần (Recommend)</p>
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

            {trainingLoading && <p className='muted'>Đang tải dữ liệu...</p>}
            {trainingError && <p className='muted'>Chưa có chỉ số sức khoẻ.</p>}

            {!trainingLoading && !trainingError && (
              <div className='workout-grid'>
                {sessionCards.length === 0 && <p className='muted'>Chưa có buổi tập nào.</p>}
                {sessionCards.map((order) => (
                  <div className='workout-card' key={`session-${order}`}>
                    <div className='workout-card-header'>
                      <div>
                        <p className='workout-title'>Buổi {order}</p>
                        <p className='workout-focus'>Tuỳ chỉnh bài tập của bạn</p>
                      </div>

                      <button
                        type='button'
                        className='workout-remove-btn'
                        onClick={() => setSessionCards((prev) => prev.filter((n) => n !== order))}
                        aria-label={`Xoá buổi ${order}`}
                      >
                        ×
                      </button>
                    </div>
                    <div className='workout-meta table'>
                      <div className='workout-row header'>
                        <span>Tên bài tập</span>
                        <span>Nhóm cơ</span>
                        <span>Calories/1 set</span>
                        <span></span>
                      </div>
                      {(sessionItems[order] || []).map((item, idx) => (
                        <div className='workout-row' key={`session-${order}-row-${idx}`}>
                          <span>{item.name || 'Chưa có'}</span>
                          <span>{item.muscle || '---'}</span>
                          <span>{item.calories || '---'}</span>
                          <div className='row-actions'>
                            <button
                              type='button'
                              className='btn-action btn-detail'
                              onClick={() => {
                                const exercise = [...recommendedExercises, ...exercises].find(
                                  (ex) => ex.title === item.name
                                )
                                if (exercise) {
                                  setExerciseDetailModal(exercise)
                                }
                              }}
                              aria-label='Xem chi tiết'
                              title='Xem chi tiết'
                            >
                              <svg
                                width='16'
                                height='16'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                              >
                                <path
                                  d='M12 4C7 4 2.73 7.11 1 11.5C2.73 15.89 7 19 12 19C17 19 21.27 15.89 23 11.5C21.27 7.11 17 4 12 4ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z'
                                  fill='currentColor'
                                />
                              </svg>
                            </button>
                            <button
                              type='button'
                              className='btn-action btn-edit'
                              onClick={() => openSidebar(order, idx)}
                              aria-label='Thay đổi bài tập'
                              title='Chỉnh sửa'
                            >
                              <svg
                                width='16'
                                height='16'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                              >
                                <path
                                  d='M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.12 5.13L18.87 8.88L20.71 7.04Z'
                                  fill='currentColor'
                                />
                              </svg>
                            </button>
                            <button
                              type='button'
                              className='btn-action btn-delete'
                              onClick={() => {
                                setSessionItems((prev) => {
                                  const next = { ...prev }
                                  const sessionExercises = [...(next[order] || [])]
                                  sessionExercises.splice(idx, 1)
                                  if (sessionExercises.length === 0) {
                                    delete next[order]
                                  } else {
                                    next[order] = sessionExercises
                                  }
                                  return next
                                })
                              }}
                              aria-label='Xóa bài tập'
                              title='Xóa bài tập'
                            >
                              <svg
                                width='16'
                                height='16'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                              >
                                <path
                                  d='M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9C18 7.9 17.1 7 16 7H8C6.9 7 6 7.9 6 9V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z'
                                  fill='currentColor'
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className='workout-row add-exercise-row'>
                        <button
                          type='button'
                          className='btn-add-exercise'
                          onClick={() => {
                            setSessionItems((prev) => ({
                              ...prev,
                              [order]: [...(prev[order] || []), { name: '', muscle: '', calories: '' }]
                            }))

                            const newIdx = (sessionItems[order] || []).length
                            openSidebar(order, newIdx)
                          }}
                        >
                          <span>+ Thêm bài tập</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            {!trainingLoading && !trainingError && (
              <div className='workout-actions'>
                <button
                  type='button'
                  className='btn-add-session'
                  onClick={() => {
                    const nextSessionNumber = sessionCards.length > 0 ? Math.max(...sessionCards) + 1 : 1
                    setSessionCards((prev) => [...prev, nextSessionNumber])
                  }}
                >
                  Thêm buổi tập
                </button>

                {sessionCards.length > 0 && (
                  <button
                    type='button'
                    className='btn-save-schedule'
                    onClick={handleSaveSchedule}
                    disabled={savingSchedule}
                  >
                    {savingSchedule ? 'Đang lưu...' : 'Lưu lịch tập'}
                  </button>
                )}
              </div>
            )}

            {/* Save Status Messages */}
            {saveSuccess && <div className='status-message success'>{saveSuccess}</div>}
            {saveError && <div className='status-message error'>{saveError}</div>}

            {sidebarOpen && sidebarTarget && (
              <div className='exercise-sidebar'>
                <div className='exercise-sidebar-header'>
                  <div>
                    <p className='sidebar-title'>
                      Buổi {sidebarTarget.session} · Dòng {sidebarTarget.row + 1}
                    </p>
                    <p className='sidebar-subtitle'>Chọn bài tập để thêm</p>
                  </div>
                  <button
                    type='button'
                    className='workout-remove-btn'
                    onClick={() => setSidebarOpen(false)}
                    aria-label='Đóng'
                  >
                    ×
                  </button>
                </div>
                <div className='exercise-tabs'>
                  <button
                    type='button'
                    className={`exercise-tab ${sidebarTab === 'recommended' ? 'active' : ''}`}
                    onClick={() => setSidebarTab('recommended')}
                  >
                    Bài tập đề xuất
                  </button>
                  <button
                    type='button'
                    className={`exercise-tab ${sidebarTab === 'library' ? 'active' : ''}`}
                    onClick={() => setSidebarTab('library')}
                  >
                    Thư viện bài tập
                  </button>
                </div>

                <div className='exercise-list'>
                  {sidebarTab === 'recommended' &&
                    recommendedExercises.map((ex) => (
                      <div
                        className='exercise-item clickable'
                        key={ex.id}
                        onClick={() => setExerciseDetailModal(ex)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div>
                          <p className='exercise-title'>{ex.title}</p>
                          <p className='exercise-meta'>
                            {ex.primaryMuscle} · {ex.caloriesBurnedPerSet} cal/set
                          </p>
                        </div>
                        <button
                          type='button'
                          className='btn-primary small'
                          onClick={(e) => {
                            e.stopPropagation()
                            selectExerciseToRow({
                              name: ex.title,
                              muscle: ex.primaryMuscle,
                              calories: ex.caloriesBurnedPerSet
                            })
                          }}
                        >
                          +
                        </button>
                      </div>
                    ))}

                  {sidebarTab === 'library' && (
                    <>
                      {exerciseLoading && <p className='muted'>Đang tải thư viện...</p>}
                      {exerciseError && <p className='muted'>{exerciseError}</p>}
                      {!exerciseLoading &&
                        !exerciseError &&
                        exercises.map((ex) => (
                          <div
                            className='exercise-item clickable'
                            key={ex.id}
                            onClick={() => setExerciseDetailModal(ex)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div>
                              <p className='exercise-title'>{ex.title}</p>
                              <p className='exercise-meta'>
                                {ex.primaryMuscle || '---'} ·{' '}
                                {ex.caloriesBurnedPerSet || (ex as any).CaloriesBurnedPerSet || 0} cal/set
                              </p>
                            </div>
                            <button
                              type='button'
                              className='btn-primary small'
                              onClick={(e) => {
                                e.stopPropagation()
                                const calories = ex.caloriesBurnedPerSet || (ex as any).CaloriesBurnedPerSet || 0
                                selectExerciseToRow({
                                  name: ex.title,
                                  muscle: ex.primaryMuscle || '',
                                  calories: calories.toString()
                                })
                              }}
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

      {/* Exercise Detail Modal */}
      {exerciseDetailModal && (
        <div className='modal-overlay' onClick={() => setExerciseDetailModal(null)}>
          <div className='modal-content exercise-detail-modal' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>{exerciseDetailModal.title}</h2>
              <button type='button' className='modal-close' onClick={() => setExerciseDetailModal(null)}>
                ×
              </button>
            </div>
            <div className='modal-body'>
              <div className='exercise-detail-section'>
                <h3>Thông tin cơ bản</h3>
                <div className='exercise-info-grid'>
                  <div className='info-item'>
                    <span className='info-label'>Nhóm cơ chính:</span>
                    <span className='info-value'>{exerciseDetailModal.primaryMuscle}</span>
                  </div>
                  {exerciseDetailModal.secondaryMuscles && (
                    <div className='info-item'>
                      <span className='info-label'>Nhóm cơ phụ:</span>
                      <span className='info-value'>
                        {Array.isArray(exerciseDetailModal.secondaryMuscles)
                          ? exerciseDetailModal.secondaryMuscles.join(', ')
                          : exerciseDetailModal.secondaryMuscles}
                      </span>
                    </div>
                  )}
                  <div className='info-item'>
                    <span className='info-label'>Độ khó:</span>
                    <span className='info-value'>{exerciseDetailModal.difficulty || 'Trung bình'}</span>
                  </div>
                  <div className='info-item'>
                    <span className='info-label'>Thiết bị:</span>
                    <span className='info-value'>{exerciseDetailModal.equipment || 'Không cần'}</span>
                  </div>
                  <div className='info-item'>
                    <span className='info-label'>Calories/set:</span>
                    <span className='info-value'>{exerciseDetailModal.caloriesBurnedPerSet || 15}</span>
                  </div>
                  <div className='info-item'>
                    <span className='info-label'>Sets đề xuất:</span>
                    <span className='info-value'>{exerciseDetailModal.recommendedSets || 3}</span>
                  </div>
                  <div className='info-item'>
                    <span className='info-label'>Reps đề xuất:</span>
                    <span className='info-value'>{exerciseDetailModal.recommendedReps || 10}</span>
                  </div>
                  <div className='info-item'>
                    <span className='info-label'>Thời gian nghỉ:</span>
                    <span className='info-value'>{exerciseDetailModal.restSeconds || 60}s</span>
                  </div>
                </div>
              </div>

              {exerciseDetailModal.description && (
                <div className='exercise-detail-section'>
                  <h3>Mô tả</h3>
                  <p>{exerciseDetailModal.description}</p>
                </div>
              )}

              {(() => {
                const embedUrl = convertToEmbedUrl(exerciseDetailModal.videoUrl)
                return embedUrl ? (
                  <div className='exercise-detail-section'>
                    <h3>Video hướng dẫn</h3>
                    <div className='video-container'>
                      <iframe
                        width='100%'
                        height='315'
                        src={embedUrl}
                        title={exerciseDetailModal.title}
                        frameBorder='0'
                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                ) : exerciseDetailModal.videoUrl ? (
                  <div className='exercise-detail-section'>
                    <h3>Video hướng dẫn</h3>
                    <p className='muted'>URL video không hợp lệ hoặc không phải YouTube.</p>
                    <a
                      href={exerciseDetailModal.videoUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='btn-primary'
                    >
                      Mở video trong tab mới
                    </a>
                  </div>
                ) : null
              })()}

              {exerciseDetailModal.images &&
                Array.isArray(exerciseDetailModal.images) &&
                exerciseDetailModal.images.length > 0 && (
                  <div className='exercise-detail-section'>
                    <h3>Hình ảnh</h3>
                    <div className='exercise-images'>
                      {exerciseDetailModal.images.map((img, idx) => (
                        <img key={idx} src={img} alt={`${exerciseDetailModal.title} ${idx + 1}`} />
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

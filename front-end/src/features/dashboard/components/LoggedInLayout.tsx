import { useEffect, useState, type FormEvent } from 'react'
import { uploadImage } from '../../../shared/services/cloudinaryService'
import { getProfile, updateProfile, type ProfileResponse } from '../../profile/api/profileApi'
import { SocialPage } from '../../social/components/SocialPage'

export type MainSection = 'training' | 'nutrition' | 'progress' | 'challenge' | 'social' | 'profile'

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
  }
}

type NavSection = Exclude<MainSection, 'profile'>

const sections: NavSection[] = ['training', 'nutrition', 'progress', 'challenge', 'social']

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
  // Get avatar URL from profile or form, fallback to empty string
  const currentAvatarUrl = profile?.avatarUrl || profileForm.avatarUrl || ''

  const initials = userName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

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

  return (
    <main className="main-layout">
      <aside className="sidebar">
        <ul className="sidebar-list">
          {sections.map((section) => (
            <li key={section}>
              <button
                type="button"
                className={`sidebar-item ${activeSection === section ? 'active' : ''}`}
                onClick={() => onSelectSection(section)}
              >
                {section === 'nutrition' ? 'Dinh Dưỡng' : section === 'progress' ? 'Tiến Độ' : section === 'training' ? 'Luyện Tập' : section === 'challenge' ? 'Thử Thách' : section === 'social' ? 'Cộng Đồng' : 'Thông Báo'}
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
              <span className="sidebar-user-role">Sẵn sàng luyện tập</span>
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

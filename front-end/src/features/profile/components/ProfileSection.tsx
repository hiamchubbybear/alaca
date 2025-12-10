import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { uploadImage } from '../../../shared/services/cloudinaryService'
import { getProfile, updateProfile, type ProfileResponse } from '../api/profileApi'
import { ProfileSocialTab } from './ProfileSocialTab'

interface ProfileSectionProps {
  initialProfile: ProfileResponse | null
  onProfileUpdated: (profile: ProfileResponse) => void
  userName?: string
}

export function ProfileSection({ initialProfile, onProfileUpdated, userName = 'User' }: ProfileSectionProps) {
  const [profile, setProfile] = useState<ProfileResponse | null>(initialProfile)
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    email: '',
    avatarUrl: '',
    birthDate: '',
    gender: 'Male',
    bio: '',
    facebook: '',
    instagram: '',
    twitter: ''
  })
  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'social'>('info')

  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Sync profile when initialProfile changes or when profile state updates
  useEffect(() => {
    if (profile) {
      setProfileForm({
        displayName: profile.displayName || displayNameRef(profile, userName),
        email: profile.email || '',
        avatarUrl: profile.avatarUrl || '',
        birthDate: profile.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : '',
        gender: profile.gender || 'Male',
        bio: profile.bio || '',
        facebook: profile.socialLinks?.facebook || '',
        instagram: profile.socialLinks?.instagram || '',
        twitter: profile.socialLinks?.twitter || ''
      })
    } else {
      setProfileForm((prev) => ({ ...prev, displayName: userName }))
    }
  }, [profile, userName])

  // Helper to safely get display name
  const displayNameRef = (p: ProfileResponse, defaultName: string) => p.displayName || defaultName

  // Fetch profile if missing (optional, mostly handled by parent, but good for self-containment)
  useEffect(() => {
    if (!profile) {
      const fetchProfile = async () => {
        try {
          const res = await getProfile()
          if (res.success && res.data) {
            setProfile(res.data)
            onProfileUpdated(res.data)
          }
        } catch (error) {
          console.error(error)
        }
      }
      fetchProfile()
    }
  }, [])

  const handleProfileChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
        setProfileForm((prev) => ({ ...prev, avatarUrl: reader.result as string }))
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
            throw new Error(uploadResult.error || 'Failed to upload avatar')
          }
          avatarUrlToSend = uploadResult.url
          setAvatarPreview(null)
          setAvatarFile(null)
        } catch (error: any) {
          setProfileError(error.message)
          setUploadingAvatar(false)
          return
        } finally {
          setUploadingAvatar(false)
        }
      } else if (profileForm.avatarUrl.startsWith('data:image/')) {
        // Clear if it's still base64 preview and no file (shouldn't happen with logic above but safe to handle)
        avatarUrlToSend = ''
      }

      const body = {
        displayName: profileForm.displayName,
        avatarUrl: avatarUrlToSend,
        birthDate: profileForm.birthDate || new Date().toISOString(),
        gender: profileForm.gender || 'Other',
        bio: profileForm.bio,
        socialLinks: {
          facebook: profileForm.facebook,
          instagram: profileForm.instagram,
          twitter: profileForm.twitter
        }
      }

      const res = await updateProfile(body)
      if (!res.success) {
        setProfileError(res.message || 'Failed to update profile')
        return
      }

      setProfileMessage('Cập nhật hồ sơ thành công')
      if (res.data) {
        setProfile(res.data)
        onProfileUpdated(res.data)
        if (res.data.avatarUrl) {
          setProfileForm((prev) => ({ ...prev, avatarUrl: res.data!.avatarUrl! }))
        }
      }
    } catch {
      setProfileError('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setProfileSaving(false)
    }
  }

  const initials = (profileForm.displayName || userName)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className='profile-page'>
      <div className='profile-layout'>
        <div className='profile-main'>
          <div className='profile-form'>
            <div className='profile-tabs'>
              <button
                type='button'
                className={`profile-tab ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                Thông tin cá nhân
              </button>
              <button
                type='button'
                className={`profile-tab ${activeTab === 'social' ? 'active' : ''}`}
                onClick={() => setActiveTab('social')}
              >
                Mạng xã hội
              </button>
            </div>

            {activeTab === 'info' && (
              <>
                <h3 className='profile-section-title'>Ảnh đại diện</h3>
                <div className='profile-avatar-upload'>
                  <div className='profile-avatar-preview'>
                    {avatarPreview || profileForm.avatarUrl ? (
                      <img src={avatarPreview || profileForm.avatarUrl} alt='Avatar' />
                    ) : (
                      <span>{initials}</span>
                    )}
                    <label className='profile-avatar-upload-btn'>
                      <input type='file' accept='image/*' hidden onChange={handleAvatarFileChange} />
                      <svg
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                        <polyline points='17 8 12 3 7 8' />
                        <line x1='12' y1='3' x2='12' y2='15' />
                      </svg>
                    </label>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit}>
                  <h3 className='profile-section-title'>Thông tin cơ bản</h3>
                  <div className='profile-grid'>
                    <div className='profile-field'>
                      <label htmlFor='displayName'>Tên hiển thị</label>
                      <input
                        id='displayName'
                        name='displayName'
                        type='text'
                        value={profileForm.displayName}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                    <div className='profile-field'>
                      <label htmlFor='email'>Email</label>
                      <input
                        id='email'
                        name='email'
                        type='email'
                        value={profileForm.email}
                        disabled
                        className='muted-input'
                      />
                    </div>
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
                        <option value='Male'>Nam</option>
                        <option value='Female'>Nữ</option>
                        <option value='Other'>Khác</option>
                      </select>
                    </div>
                  </div>

                  <h3 className='profile-section-title'>Tiểu sử</h3>
                  <div className='profile-field'>
                    <textarea
                      name='bio'
                      value={profileForm.bio}
                      onChange={handleProfileChange}
                      rows={4}
                      placeholder='Chia sẻ đôi chút về bản thân...'
                    />
                  </div>

                  <div className='profile-actions'>
                    <button type='submit' className='btn-primary' disabled={profileSaving || uploadingAvatar}>
                      {profileSaving || uploadingAvatar ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                    {profileMessage && <span className='profile-status success'>{profileMessage}</span>}
                    {profileError && <span className='profile-status error'>{profileError}</span>}
                  </div>
                </form>
              </>
            )}

            {activeTab === 'social' && <ProfileSocialTab currentUser={profile} />}
          </div>
        </div>

        <aside className='profile-sidebar'>
          <div className='profile-summary-card'>
            <div className='profile-summary-header'>
              <div className='profile-summary-avatar'>
                {avatarPreview || profileForm.avatarUrl ? (
                  <img src={avatarPreview || profileForm.avatarUrl} alt='Avatar' />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div>
                <h3 className='profile-summary-name'>{profileForm.displayName || userName}</h3>
                <p className='profile-summary-role'>Thành viên FitLife</p>
              </div>
            </div>

            <div className='profile-summary-section'>
              <h4>Mạng xã hội</h4>
              <div className='profile-grid' style={{ gridTemplateColumns: '1fr', gap: '1rem' }}>
                <div className='profile-field'>
                  <label style={{ fontSize: '0.85rem' }}>Facebook</label>
                  <input
                    name='facebook'
                    value={profileForm.facebook}
                    onChange={handleProfileChange}
                    placeholder='Username'
                    style={{ padding: '0.5rem' }}
                  />
                </div>
                <div className='profile-field'>
                  <label style={{ fontSize: '0.85rem' }}>Instagram</label>
                  <input
                    name='instagram'
                    value={profileForm.instagram}
                    onChange={handleProfileChange}
                    placeholder='Username'
                    style={{ padding: '0.5rem' }}
                  />
                </div>
                <div className='profile-field'>
                  <label style={{ fontSize: '0.85rem' }}>Twitter</label>
                  <input
                    name='twitter'
                    value={profileForm.twitter}
                    onChange={handleProfileChange}
                    placeholder='Username'
                    style={{ padding: '0.5rem' }}
                  />
                </div>
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
                  <strong>
                    {profileForm.gender === 'Male' ? 'Nam' : profileForm.gender === 'Female' ? 'Nữ' : 'Khác'}
                  </strong>
                </li>
              </ul>
            </div>
            <div className='profile-summary-section'>
              <h4>Tiểu sử</h4>
              <p className='profile-summary-bio'>{profileForm.bio || 'Chưa có tiểu sử'}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

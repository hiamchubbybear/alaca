import { useEffect, useState } from 'react'
import type { ProfileData } from '../../../shared/types/api'

type Props = {
  open: boolean
  onClose: () => void
  profile: ProfileData | null
  onSave: (data: Partial<ProfileData>) => Promise<void>
}

export function UserAvatar({ userName, avatarUrl, onClick }: { userName: string; avatarUrl?: string; onClick: () => void }) {
  const initials = userName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <button type="button" className="user-avatar-button" onClick={onClick} aria-label="User profile">
      {avatarUrl ? (
        <img src={avatarUrl} alt={userName} className="user-avatar-image" />
      ) : (
        <div className="user-avatar-initials">{initials}</div>
      )}
    </button>
  )
}

export function ProfileModal({ open, onClose, profile, onSave }: Props) {
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '')
      setAvatarUrl(profile.avatarUrl || '')
      setBirthDate(profile.birthDate || '')
      setGender(profile.gender || '')
      setBio(profile.bio || '')
    }
  }, [profile])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      setLoading(true)
      await onSave({
        displayName,
        avatarUrl: avatarUrl || undefined,
        birthDate: birthDate || undefined,
        gender: gender || undefined,
        bio: bio || undefined
      })
      onClose()
    } catch {
      setError('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div
        className="auth-modal"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div className="auth-modal-header">
          <h2>Edit Profile</h2>
          <button type="button" className="auth-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <p className="auth-modal-subtitle">Update your personal information</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label htmlFor="profile-name">Display Name</label>
            <input
              id="profile-name"
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          <div className="auth-form-group">
            <label htmlFor="profile-avatar">Avatar URL</label>
            <input
              id="profile-avatar"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </div>
          <div className="auth-form-group">
            <label htmlFor="profile-birthdate">Birth Date</label>
            <input
              id="profile-birthdate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>
          <div className="auth-form-group">
            <label htmlFor="profile-gender">Gender</label>
            <select
              id="profile-gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="auth-form-group">
            <label htmlFor="profile-bio">Bio</label>
            <textarea
              id="profile-bio"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
          </div>
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
        {error && <p className="auth-error">{error}</p>}
      </div>
    </div>
  )
}

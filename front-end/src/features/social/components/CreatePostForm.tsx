import { useState, type FormEvent } from 'react'
import { uploadImage } from '../../../shared/services/cloudinaryService'
import type { ProfileResponse } from '../../profile/api/profileApi'
import { createPost } from '../api/postApi'
import { getUserInitials } from '../utils/userUtils'
import './CreatePostForm.css'

type Props = {
  currentUser: ProfileResponse | null
  onPostCreated: () => void
}

export function CreatePostForm({ currentUser, onPostCreated }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    media: ''
  })
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Kích thước ảnh phải nhỏ hơn 10MB')
      return
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)

    // Auto upload after selection
    handleImageUpload(file)
  }

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true)
      const result = await uploadImage(file)
      if (result.success && result.url) {
        setNewPost((prev) => ({ ...prev, media: result.url! }))
        // Clean up preview URL after upload
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview)
        }
      } else {
        alert(result.error || 'Tải ảnh lên thất bại')
        setImagePreview(null)
      }
    } catch (error) {
      console.error('Failed to upload image:', error)
      alert('Tải ảnh lên thất bại. Vui lòng thử lại.')
      setImagePreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleCreatePost = async (e: FormEvent) => {
    e.preventDefault()
    if (!newPost.content.trim() && !newPost.media) return

    try {
      const res = await createPost({
        title: newPost.title || 'Không có tiêu đề',
        content: newPost.content,
        media: newPost.media
      })

      if (res.success && res.data) {
        setNewPost({ title: '', content: '', media: '' })
        setImagePreview(null)
        setShowForm(false)
        onPostCreated()
      }
    } catch (error) {
      console.error('Failed to create post:', error)
    }
  }

  return (
    <div className="create-post-card">
      <div className="create-post-header">
        <div className="create-post-avatar">
          {currentUser?.avatarUrl ? (
            <img src={currentUser.avatarUrl} alt={currentUser.displayName || 'User'} />
          ) : (
            <span>{getUserInitials(currentUser?.displayName || 'User')}</span>
          )}
        </div>
        <button
          type="button"
          className="create-post-input"
          onClick={() => setShowForm(!showForm)}
        >
          Bạn đang nghĩ gì?
        </button>
      </div>
      {showForm && (
        <form className="create-post-form" onSubmit={handleCreatePost}>
          <input
            type="text"
            placeholder="Tiêu đề (tùy chọn)"
            value={newPost.title}
            onChange={(e) => setNewPost((prev) => ({ ...prev, title: e.target.value }))}
            className="post-title-input"
          />
          <textarea
            placeholder="Bạn đang nghĩ gì?"
            value={newPost.content}
            onChange={(e) => setNewPost((prev) => ({ ...prev, content: e.target.value }))}
            className="post-content-input"
            rows={4}
          />
          {(imagePreview || newPost.media) && (
            <div className="post-media-preview">
              <img src={imagePreview || newPost.media} alt="Preview" />
              <button
                type="button"
                onClick={() => {
                  setNewPost((prev) => ({ ...prev, media: '' }))
                  if (imagePreview) {
                    URL.revokeObjectURL(imagePreview)
                    setImagePreview(null)
                  }
                }}
                className="remove-media-btn"
              >
                ×
              </button>
              {uploading && (
                <div className="upload-progress">
                  <div className="upload-progress-bar"></div>
                  <span>Đang tải lên...</span>
                </div>
              )}
            </div>
          )}
          <div className="create-post-actions">
            <label className="upload-media-btn">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              {uploading ? 'Đang tải...' : '📷 Hình ảnh'}
            </label>
            <button type="submit" className="post-submit-btn" disabled={uploading}>
              Đăng Bài
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

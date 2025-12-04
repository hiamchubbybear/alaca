import { useState, type FormEvent } from 'react'
import { createPost, type CreatePostRequest } from '../api/postApi'
import { uploadImage } from '../../../shared/services/cloudinaryService'
import { getUserInitials } from '../utils/userUtils'
import type { ProfileResponse } from '../../profile/api/profileApi'
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const result = await uploadImage(file)
      if (result.success && result.url) {
        setNewPost((prev) => ({ ...prev, media: result.url! }))
      }
    } catch (error) {
      console.error('Failed to upload image:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleCreatePost = async (e: FormEvent) => {
    e.preventDefault()
    if (!newPost.content.trim() && !newPost.media) return

    try {
      const res = await createPost({
        title: newPost.title || 'Untitled',
        content: newPost.content,
        media: newPost.media
      })

      if (res.success && res.data) {
        setNewPost({ title: '', content: '', media: '' })
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
          What's on your mind?
        </button>
      </div>
      {showForm && (
        <form className="create-post-form" onSubmit={handleCreatePost}>
          <input
            type="text"
            placeholder="Title (optional)"
            value={newPost.title}
            onChange={(e) => setNewPost((prev) => ({ ...prev, title: e.target.value }))}
            className="post-title-input"
          />
          <textarea
            placeholder="What's on your mind?"
            value={newPost.content}
            onChange={(e) => setNewPost((prev) => ({ ...prev, content: e.target.value }))}
            className="post-content-input"
            rows={4}
          />
          {newPost.media && (
            <div className="post-media-preview">
              <img src={newPost.media} alt="Preview" />
              <button
                type="button"
                onClick={() => setNewPost((prev) => ({ ...prev, media: '' }))}
                className="remove-media-btn"
              >
                ×
              </button>
            </div>
          )}
          <div className="create-post-actions">
            <label className="upload-media-btn">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              {uploading ? 'Uploading...' : '📷 Photo'}
            </label>
            <button type="submit" className="post-submit-btn" disabled={uploading}>
              Post
            </button>
          </div>
        </form>
      )}
    </div>
  )
}


import type { ProfileResponse } from '../../profile/api/profileApi'
import type { Post } from '../types/post.types'
import { formatTimeAgo } from '../utils/formatTime'
import { getUserInitials } from '../utils/userUtils'
import './PostCard.css'

type Props = {
  post: Post
  currentUser: ProfileResponse | null
  onUpvote: (postId: string) => void
  onDownvote: (postId: string) => void
  onDelete: (postId: string) => void
}

export function PostCard({ post, currentUser, onUpvote, onDownvote, onDelete }: Props) {
  const upvoteCount = post.upvoteCount ?? 0
  const downvoteCount = post.downvoteCount ?? 0
  const userVote = post.userVote ?? null

  const authorName = post.username || 'User'
  const authorAvatar = post.avatarUrl
  const authorInitials = getUserInitials(authorName)


  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author">
          <div className="post-avatar">
            {authorAvatar ? (
              <img src={authorAvatar} alt={authorName} />
            ) : (
              <span>{authorInitials}</span>
            )}
          </div>
          <div className="post-author-info">
            <div className="post-author-name">{authorName}</div>
            <div className="post-time">{formatTimeAgo(post.createdAt)}</div>
          </div>
        </div>
        {currentUser && post.profileId === currentUser.id && (
          <button
            type="button"
            className="post-menu-btn"
            onClick={() => onDelete(post.postId)}
            title="Xóa bài viết"
          >
            ⋮
          </button>
        )}
      </div>
      {post.title && <div className="post-title">{post.title}</div>}
      {post.content && <div className="post-content">{post.content}</div>}
      {post.media && (
        <div className="post-media">
          <img src={post.media} alt="Post media" />
        </div>
      )}
      <div className="post-vote-section">
        <div className="post-vote-stats">
          <span className="vote-count upvote-count">▲ {upvoteCount}</span>
          <span className="vote-count downvote-count">▼ {downvoteCount}</span>
        </div>
        <div className="post-vote-actions">
          <button
            type="button"
            className={`vote-btn upvote-btn ${userVote === 'upvote' ? 'active' : ''}`}
            onClick={() => onUpvote(post.postId)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 15l-6-6-6 6" />
            </svg>
            Upvote
          </button>
          <button
            type="button"
            className={`vote-btn downvote-btn ${userVote === 'downvote' ? 'active' : ''}`}
            onClick={() => onDownvote(post.postId)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
            Downvote
          </button>
        </div>
      </div>
    </div>
  )
}

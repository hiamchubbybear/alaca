import { useState } from 'react'
import { deletePost, likePost } from '../api/postApi'
import { formatTimeAgo } from '../utils/formatTime'
import type { Post } from '../types/post.types'
import type { ProfileResponse } from '../../profile/api/profileApi'
import { CommentSection } from './CommentSection'
import './PostCard.css'

type Props = {
  post: Post
  currentUser: ProfileResponse | null
  isLiked: boolean
  onLike: (postId: string) => void
  onDelete: (postId: string) => void
  onCommentAdded: () => void
}

export function PostCard({ post, currentUser, isLiked, onLike, onDelete, onCommentAdded }: Props) {
  const [showComments, setShowComments] = useState(false)

  const handleShare = async () => {
    const shareText = `${post.title || 'Check out this post'}\n${post.content || ''}`
    const shareUrl = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || 'Post',
          text: shareText,
          url: shareUrl
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
        alert('Link copied to clipboard!')
      } catch (error) {
        console.error('Failed to copy:', error)
      }
    }
  }

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author">
          <div className="post-avatar">
            <span>U</span>
          </div>
          <div className="post-author-info">
            <div className="post-author-name">User</div>
            <div className="post-time">{formatTimeAgo(post.createdAt)}</div>
          </div>
        </div>
        {currentUser && post.profileId === currentUser.id && (
          <button
            type="button"
            className="post-menu-btn"
            onClick={() => onDelete(post.postId)}
            title="Delete post"
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
      <div className="post-stats">
        <span className="post-likes">{post.likeCount} likes</span>
        <span className="post-comments">{post.commentCount} comments</span>
      </div>
      <div className="post-actions">
        <button
          type="button"
          className={`post-action-btn like-btn ${isLiked ? 'liked' : ''}`}
          onClick={() => onLike(post.postId)}
        >
          <svg
            className="like-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isLiked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          Like
        </button>
        <button
          type="button"
          className={`post-action-btn comment-btn ${showComments ? 'active' : ''}`}
          onClick={() => setShowComments(!showComments)}
        >
          💬 Comment
        </button>
        <button type="button" className="post-action-btn share-btn" onClick={handleShare}>
          🔗 Share
        </button>
      </div>
      <CommentSection
        postId={post.postId}
        isOpen={showComments}
        onCommentAdded={onCommentAdded}
      />
    </div>
  )
}


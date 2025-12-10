import { useEffect, useState } from 'react'
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
  onEdit?: (post: Post) => void
  onDelete: (postId: string) => void
}

export function PostCard({ post, currentUser, onUpvote, onDownvote, onEdit, onDelete }: Props) {
  const upvoteCount = post.upvoteCount ?? 0
  const downvoteCount = post.downvoteCount ?? 0
  const userVote = post.userVote ?? null

  const [showMenu, setShowMenu] = useState(false)

  const authorName = post.username || 'User'
  const authorAvatar = post.avatarUrl
  const authorInitials = getUserInitials(authorName)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu && !(event.target as Element).closest('.post-menu-container')) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const handleCopyLink = () => {
    const link = `${window.location.origin}/post/${post.postId}`
    navigator.clipboard
      .writeText(link)
      .then(() => {
        alert('Đã sao chép liên kết')
        setShowMenu(false)
      })
      .catch(() => alert('Không thể sao chép liên kết'))
  }

  const handlePinPost = () => {
    alert('Tính năng Ghim bài viết đang phát triển')
    setShowMenu(false)
  }

  const handlePrivacyChange = () => {
    alert('Tính năng thay đổi quyền riêng tư đang phát triển')
    setShowMenu(false)
  }

  // Icons
  const Icons = {
    Menu: (
      <svg
        width='20'
        height='20'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <circle cx='12' cy='12' r='1' />
        <circle cx='12' cy='5' r='1' />
        <circle cx='12' cy='19' r='1' />
      </svg>
    ),
    Pin: (
      <svg
        width='18'
        height='18'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <line x1='12' y1='17' x2='12' y2='22'></line>
        <path d='M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z'></path>
      </svg>
    ),
    Lock: (
      <svg
        width='18'
        height='18'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <rect x='3' y='11' width='18' height='11' rx='2' ry='2'></rect>
        <path d='M7 11V7a5 5 0 0 1 10 0v4'></path>
      </svg>
    ),
    Link: (
      <svg
        width='18'
        height='18'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'></path>
        <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'></path>
      </svg>
    ),
    Edit: (
      <svg
        width='18'
        height='18'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'></path>
        <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'></path>
      </svg>
    ),
    Trash: (
      <svg
        width='18'
        height='18'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <polyline points='3 6 5 6 21 6'></polyline>
        <path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'></path>
      </svg>
    )
  }

  return (
    <div className='post-card'>
      <div className='post-header'>
        <div className='post-author'>
          <div className='post-avatar'>
            {authorAvatar ? <img src={authorAvatar} alt={authorName} /> : <span>{authorInitials}</span>}
          </div>
          <div className='post-author-info'>
            <div className='post-author-name'>{authorName}</div>
            <div className='post-time'>{formatTimeAgo(post.createdAt)}</div>
          </div>
        </div>

        {currentUser && post.profileId === currentUser.id && (
          <div className='post-menu-container' style={{ position: 'relative' }}>
            <button
              type='button'
              className='post-menu-trigger-btn'
              onClick={() => setShowMenu(!showMenu)}
              title='Tùy chọn'
            >
              {Icons.Menu}
            </button>

            {showMenu && (
              <div className='post-menu-dropdown'>
                <button className='post-menu-item' onClick={handlePinPost}>
                  {Icons.Pin} <span>Ghim bài viết</span>
                </button>
                <button className='post-menu-item' onClick={handlePrivacyChange}>
                  {Icons.Lock} <span>Chỉnh sửa quyền riêng tư</span>
                </button>
                <div className='menu-divider'></div>
                <button className='post-menu-item' onClick={handleCopyLink}>
                  {Icons.Link} <span>Sao chép liên kết</span>
                </button>
                {onEdit && (
                  <button
                    className='post-menu-item'
                    onClick={() => {
                      setShowMenu(false)
                      onEdit(post)
                    }}
                  >
                    {Icons.Edit} <span>Chỉnh sửa bài viết</span>
                  </button>
                )}
                <div className='menu-divider'></div>
                <button
                  className='post-menu-item delete'
                  onClick={() => {
                    setShowMenu(false)
                    onDelete(post.postId)
                  }}
                >
                  {Icons.Trash} <span>Xóa bài viết</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {post.title && <div className='post-title'>{post.title}</div>}
      {post.content && <div className='post-content'>{post.content}</div>}
      {post.media && (
        <div className='post-media'>
          <img src={post.media} alt='Post media' />
        </div>
      )}
      <div className='post-vote-section'>
        <div className='post-vote-stats'>
          <span className='vote-count upvote-count'>▲ {upvoteCount}</span>
          <span className='vote-count downvote-count'>▼ {downvoteCount}</span>
        </div>
        <div className='post-vote-actions'>
          <button
            type='button'
            className={`vote-btn upvote-btn ${userVote === 'upvote' ? 'active' : ''}`}
            onClick={() => onUpvote(post.postId)}
          >
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M18 15l-6-6-6 6' />
            </svg>
            Upvote
          </button>
          <button
            type='button'
            className={`vote-btn downvote-btn ${userVote === 'downvote' ? 'active' : ''}`}
            onClick={() => onDownvote(post.postId)}
          >
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M6 9l6 6 6-6' />
            </svg>
            Downvote
          </button>
        </div>
      </div>
    </div>
  )
}

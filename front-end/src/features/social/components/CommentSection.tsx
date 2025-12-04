import { useState, useEffect } from 'react'
import { getComments, createComment, type Comment } from '../api/postApi'
import { formatTimeAgo } from '../utils/formatTime'
import './CommentSection.css'

type Props = {
  postId: string
  isOpen: boolean
  onCommentAdded: () => void
}

export function CommentSection({ postId, isOpen, onCommentAdded }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [commentInput, setCommentInput] = useState('')
  const [posting, setPosting] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && comments.length === 0) {
      loadComments()
    }
  }, [isOpen, postId])

  const loadComments = async () => {
    try {
      setLoading(true)
      const res = await getComments(postId)
      if (res.success && res.data) {
        setComments(res.data)
      }
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = commentInput.trim()
    if (!content) return

    setPosting(true)
    try {
      const res = await createComment(postId, { content })
      if (res.success && res.data) {
        setComments((prev) => [...prev, res.data!])
        setCommentInput('')
        onCommentAdded()
      }
    } catch (error) {
      console.error('Failed to create comment:', error)
    } finally {
      setPosting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="post-comments-section">
      <div className="comments-list">
        {loading ? (
          <div className="loading-comments">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="no-comments">No comments yet. Be the first to comment!</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-content">{comment.content}</div>
              <div className="comment-time">{formatTimeAgo(comment.createdAt)}</div>
            </div>
          ))
        )}
      </div>
      <form className="comment-input-container" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Write a comment..."
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          className="comment-input"
        />
        <button
          type="submit"
          className="comment-submit-btn"
          disabled={!commentInput.trim() || posting}
        >
          {posting ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  )
}


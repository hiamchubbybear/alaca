import { useEffect, useState } from 'react'
import { deletePost, getMyPosts } from '../../social/api/postApi'
import { PostCard } from '../../social/components/PostCard'
import { useVote } from '../../social/hooks/useVote'
import type { Post } from '../../social/types/post.types' // Ensure this path is correct or alias
import { type ProfileResponse } from '../api/profileApi'

interface Props {
  currentUser: ProfileResponse | null
}

export function ProfileSocialTab({ currentUser }: Props) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const updatePost = (postId: string, updater: (post: Post) => Post) => {
    setPosts((prev) => prev.map((p) => (p.postId === postId ? updater(p) : p)))
  }

  const { handleUpvote, handleDownvote } = useVote(posts, updatePost)

  const loadMyPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getMyPosts()
      if (res.success && res.data) {
        // Map userVoteType from backend to userVote for frontend
        const mappedPosts = res.data.map((post: Post) => ({
          ...post,
          userVote: post.userVoteType ? (post.userVoteType.toLowerCase() as 'upvote' | 'downvote') : null
        }))
        setPosts(mappedPosts)
      } else {
        setError(res.message || 'Failed to load posts')
      }
    } catch (err: any) {
      console.error('Failed to load my posts:', err)
      setError(err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMyPosts()
  }, [])

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return

    try {
      const res = await deletePost(postId)
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p.postId !== postId))
      } else {
        alert('Failed to delete post: ' + res.message)
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('Error deleting post')
    }
  }

  const handleEditPost = (post: Post) => {
    // TODO: Implement actual edit modal or form
    alert(`Tính năng chỉnh sửa đang được phát triển. (Post ID: ${post.postId})`)
  }

  return (
    <div className='profile-social-tab'>
      {error && (
        <div className='status-message error'>
          Error: {error}
          <button
            onClick={loadMyPosts}
            style={{
              marginLeft: '1rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {loading && posts.length === 0 ? (
        <p className='muted'>Đang tải bài viết...</p>
      ) : posts.length === 0 && !error ? (
        <p className='muted'>Chưa có bài viết nào.</p>
      ) : (
        <div className='posts-feed' style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {posts.map((post) => (
            <PostCard
              key={post.postId}
              post={post}
              currentUser={currentUser}
              onUpvote={handleUpvote}
              onDownvote={handleDownvote}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
            />
          ))}
        </div>
      )}
    </div>
  )
}

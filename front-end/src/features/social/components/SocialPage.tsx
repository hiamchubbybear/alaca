import { useEffect, useState } from 'react'
import { getProfile, type ProfileResponse } from '../../profile/api/profileApi'
import { deletePost } from '../api/postApi'
import { usePosts } from '../hooks/usePosts'
import { useVote } from '../hooks/useVote'
import { CreatePostForm } from './CreatePostForm'
import { PostCard } from './PostCard'
import './SocialPage.css'

export function SocialPage() {
  const [currentUser, setCurrentUser] = useState<ProfileResponse | null>(null)
  const { posts, loading, error, pageNumber, hasMore, loadPosts, updatePost, removePost } = usePosts()
  const { handleUpvote, handleDownvote } = useVote(posts, updatePost)

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const res = await getProfile()
      if (res.success && res.data) {
        setCurrentUser(res.data)
      }
    } catch (error) {
      console.error('Failed to load user profile:', error)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return

    try {
      const res = await deletePost(postId)
      if (res.success) {
        removePost(postId)
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }

  const handlePostCreated = () => {
    loadPosts(1)
  }

  return (
    <div className="social-page">
      <div className="social-container">
        <CreatePostForm currentUser={currentUser} onPostCreated={handlePostCreated} />

        {error && (
          <div className="error-message" style={{
            padding: '1rem',
            background: '#fee',
            color: '#c33',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            Error: {error}
            <button
              onClick={() => loadPosts(1)}
              style={{
                marginLeft: '1rem',
                padding: '0.5rem 1rem',
                background: '#c33',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}
        {loading && posts.length === 0 ? (
          <div className="loading-posts">Loading posts...</div>
        ) : posts.length === 0 && !error ? (
          <div className="no-posts">No posts yet. Be the first to post!</div>
        ) : (
          <div className="posts-feed">
            {posts.map((post) => (
              <PostCard
                key={post.postId}
                post={post}
                currentUser={currentUser}
                onUpvote={handleUpvote}
                onDownvote={handleDownvote}
                onDelete={handleDeletePost}
              />
            ))}
            {hasMore && (
              <button
                type="button"
                className="load-more-btn"
                onClick={() => loadPosts(pageNumber + 1)}
              >
                Load More
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

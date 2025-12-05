import { useEffect, useState, useMemo } from 'react'
import { getProfile, type ProfileResponse } from '../../profile/api/profileApi'
import { deletePost } from '../api/postApi'
import { useVote } from '../hooks/useVote'
import { usePosts } from '../hooks/usePosts'
import { CreatePostForm } from './CreatePostForm'
import { PostCard } from './PostCard'
import type { Post } from '../types/post.types'
import './SocialPage.css'

export function SocialPage() {
  const [currentUser, setCurrentUser] = useState<ProfileResponse | null>(null)
  const [profileCache, setProfileCache] = useState<Map<string, { displayName: string; avatarUrl?: string }>>(new Map())
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
    if (!confirm('Are you sure you want to delete this post?')) return

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

  // Enrich posts with author info
  const enrichedPosts = useMemo(() => {
    return posts.map((post) => {
      const authorInfo = profileCache.get(post.profileId)
      return {
        ...post,
        authorName: authorInfo?.displayName || 'User',
        authorAvatar: authorInfo?.avatarUrl,
        upvoteCount: post.upvoteCount ?? 0,
        downvoteCount: post.downvoteCount ?? 0
      }
    })
  }, [posts, profileCache])

  // Fetch profile info for posts that don't have it
  useEffect(() => {
    if (posts.length === 0 || !currentUser) return

    const missingProfileIds = posts
      .filter((post) => !profileCache.has(post.profileId))
      .map((post) => post.profileId)

    if (missingProfileIds.length === 0) return

    setProfileCache((prev) => {
      const newMap = new Map(prev)
      missingProfileIds.forEach((profileId) => {
        // Use currentUser if profileId matches
        if (currentUser.id === profileId) {
          newMap.set(profileId, {
            displayName: currentUser.displayName,
            avatarUrl: currentUser.avatarUrl
          })
        } else {
          // Default for other users (would need API call in real app)
          // For now, we'll show "User" until we have an API endpoint
          newMap.set(profileId, {
            displayName: 'User'
          })
        }
      })
      return newMap
    })
  }, [posts, currentUser])

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
            {enrichedPosts.map((post) => (
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

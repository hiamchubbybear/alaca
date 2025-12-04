import { useState } from 'react'
import { likePost } from '../api/postApi'
import type { Post } from '../types/post.types'

export function usePostInteractions(
  posts: Post[],
  updatePost: (postId: string, updater: (post: Post) => Post) => void
) {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())

  const handleLike = async (postId: string) => {
    const isLiked = likedPosts.has(postId)
    const post = posts.find((p) => p.postId === postId)
    if (!post) return

    // Optimistic update
    setLikedPosts((prev) => {
      const newSet = new Set(prev)
      if (isLiked) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })

    updatePost(postId, (p) => ({
      ...p,
      likeCount: isLiked ? p.likeCount - 1 : p.likeCount + 1
    }))

    try {
      const res = await likePost(postId)
      if (res.success && res.data) {
        updatePost(postId, (p) => ({
          ...p,
          likeCount: res.data!.likeCount
        }))
        if (!res.data.liked) {
          setLikedPosts((prev) => {
            const newSet = new Set(prev)
            newSet.delete(postId)
            return newSet
          })
        } else {
          setLikedPosts((prev) => new Set(prev).add(postId))
        }
      }
    } catch (error) {
      console.error('Failed to like post:', error)
      // Revert optimistic update
      setLikedPosts((prev) => {
        const newSet = new Set(prev)
        if (isLiked) {
          newSet.add(postId)
        } else {
          newSet.delete(postId)
        }
        return newSet
      })
      updatePost(postId, (p) => ({
        ...p,
        likeCount: post.likeCount
      }))
    }
  }

  return {
    likedPosts,
    handleLike
  }
}


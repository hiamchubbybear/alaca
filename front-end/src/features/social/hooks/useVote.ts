import { useState } from 'react'
import type { Post } from '../types/post.types'

export function useVote(posts: Post[], updatePost: (postId: string, updater: (post: Post) => Post) => void) {
  const [votedPosts, setVotedPosts] = useState<Map<string, 'upvote' | 'downvote'>>(new Map())

  const handleUpvote = async (postId: string) => {
    const post = posts.find((p) => p.postId === postId)
    if (!post) return

    const currentVote = votedPosts.get(postId)
    const isUpvoted = currentVote === 'upvote'
    const isDownvoted = currentVote === 'downvote'

    // Optimistic update
    const newVote = isUpvoted ? null : 'upvote'
    setVotedPosts((prev) => {
      const newMap = new Map(prev)
      if (isUpvoted) {
        newMap.delete(postId)
      } else {
        newMap.set(postId, 'upvote')
        if (isDownvoted) {
          // Remove downvote
        }
      }
      return newMap
    })

    updatePost(postId, (p) => {
      const currentUpvotes = p.upvoteCount ?? 0
      const currentDownvotes = p.downvoteCount ?? 0

      let newUpvotes = currentUpvotes
      let newDownvotes = currentDownvotes

      if (isUpvoted) {
        // Remove upvote
        newUpvotes = Math.max(0, currentUpvotes - 1)
      } else {
        // Add upvote
        newUpvotes = currentUpvotes + 1
        if (isDownvoted) {
          // Remove downvote
          newDownvotes = Math.max(0, currentDownvotes - 1)
        }
      }

      return {
        ...p,
        upvoteCount: newUpvotes,
        downvoteCount: newDownvotes,
        userVote: newVote
      }
    })

    // Call API to upvote/downvote/remove
    try {
      const { upvotePost, removeVote } = await import('../api/postApi')

      if (isUpvoted) {
        // Remove upvote
        await removeVote(postId)
      } else {
        // Add upvote (or switch from downvote)
        await upvotePost(postId)
      }
    } catch (error) {
      console.error('Failed to upvote:', error)
      // Revert optimistic update on error
      setVotedPosts((prev) => {
        const newMap = new Map(prev)
        if (currentVote) {
          newMap.set(postId, currentVote)
        } else {
          newMap.delete(postId)
        }
        return newMap
      })

      updatePost(postId, () => post)
    }
  }

  const handleDownvote = async (postId: string) => {
    const post = posts.find((p) => p.postId === postId)
    if (!post) return

    const currentVote = votedPosts.get(postId)
    const isUpvoted = currentVote === 'upvote'
    const isDownvoted = currentVote === 'downvote'

    // Optimistic update
    const newVote = isDownvoted ? null : 'downvote'
    setVotedPosts((prev) => {
      const newMap = new Map(prev)
      if (isDownvoted) {
        newMap.delete(postId)
      } else {
        newMap.set(postId, 'downvote')
        if (isUpvoted) {
          // Remove upvote
        }
      }
      return newMap
    })

    updatePost(postId, (p) => {
      const currentUpvotes = p.upvoteCount ?? 0
      const currentDownvotes = p.downvoteCount ?? 0

      let newUpvotes = currentUpvotes
      let newDownvotes = currentDownvotes

      if (isDownvoted) {
        // Remove downvote
        newDownvotes = Math.max(0, currentDownvotes - 1)
      } else {
        // Add downvote
        newDownvotes = currentDownvotes + 1
        if (isUpvoted) {
          // Remove upvote
          newUpvotes = Math.max(0, currentUpvotes - 1)
        }
      }

      return {
        ...p,
        upvoteCount: newUpvotes,
        downvoteCount: newDownvotes,
        userVote: newVote
      }
    })

    // Call API to upvote/downvote/remove
    try {
      const { downvotePost, removeVote } = await import('../api/postApi')

      if (isDownvoted) {
        // Remove downvote
        await removeVote(postId)
      } else {
        // Add downvote (or switch from upvote)
        await downvotePost(postId)
      }
    } catch (error) {
      console.error('Failed to downvote:', error)
      // Revert optimistic update on error
      setVotedPosts((prev) => {
        const newMap = new Map(prev)
        if (currentVote) {
          newMap.set(postId, currentVote)
        } else {
          newMap.delete(postId)
        }
        return newMap
      })

      updatePost(postId, () => post)
    }
  }

  return {
    votedPosts,
    handleUpvote,
    handleDownvote
  }
}

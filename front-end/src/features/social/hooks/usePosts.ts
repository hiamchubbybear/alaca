import { useEffect, useState } from 'react'
import { getAllPosts } from '../api/postApi'
import type { Post } from '../types/post.types'

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const loadPosts = async (page: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      const res = await getAllPosts(page, 10)
      console.log('Posts API response:', res)

      if (res.success && res.data) {
        const data = res.data as any
        const postsArray = Array.isArray(data) ? data : []
        const hasNext = data?.hasNext ?? data?.hasNextPage ?? false

        if (page === 1) {
          setPosts(postsArray)
        } else {
          setPosts((prev) => [...prev, ...postsArray])
        }
        setHasMore(hasNext)
        setPageNumber(page)
      } else {
        const errorMsg = res.message || 'Failed to load posts'
        setError(errorMsg)
        setPosts([])
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Failed to load posts:', error)
      setError(errorMsg)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts(1)
  }, [])

  const updatePost = (postId: string, updater: (post: Post) => Post) => {
    setPosts((prev) => prev.map((p) => (p.postId === postId ? updater(p) : p)))
  }

  const addPost = (post: Post) => {
    setPosts((prev) => [post, ...prev])
  }

  const removePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.postId !== postId))
  }

  return {
    posts,
    loading,
    error,
    pageNumber,
    hasMore,
    loadPosts,
    updatePost,
    addPost,
    removePost
  }
}

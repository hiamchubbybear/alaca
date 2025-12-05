export interface Post {
  postId: string
  profileId: string
  title: string
  content: string
  media: string | null
  likeCount: number
  commentCount: number
  createdAt: string
  updatedAt: string
  // Author info (optional, will be populated from profile)
  authorName?: string
  authorAvatar?: string
  // Vote info
  upvoteCount?: number
  downvoteCount?: number
  userVote?: 'upvote' | 'downvote' | null
}

export interface CreatePostRequest {
  title: string
  content: string
  media: string
}

export interface CreatePostResponse {
  postId: string
  profileId: string
  title: string
  content: string
  media: string
  likeCount: number
  commentCount: number
  createdAt: string
  updatedAt: string
}

export interface PaginatedPosts extends Array<Post> {
  currentPage?: number
  totalPages?: number
  pageSize?: number
  totalCount?: number
  hasPrevious?: boolean
  hasNext?: boolean
}

export interface Comment {
  id: string
  postId: string
  userId: string
  content: string
  createdAt: string
}

export interface CreateCommentRequest {
  content: string
}


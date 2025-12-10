export interface Post {
  postId: string
  profileId: string
  userId: string
  username: string // From backend: Username
  avatarUrl: string | null // From backend: AvatarUrl
  title: string
  content: string
  media: string | null
  likeCount: number // Deprecated
  upvoteCount: number // From backend: UpvoteCount
  downvoteCount: number // From backend: DownvoteCount
  commentCount: number
  createdAt: string
  updatedAt: string
  userVoteType?: string | null // "Upvote", "Downvote", or null from backend
  // Vote info (will be added by frontend)
  userVote?: 'upvote' | 'downvote' | null
}

export interface CreatePostRequest {
  title: string
  content: string
  media: string
}

export interface UpdatePostRequest {
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
  // Add update response type fields if needed, usually same as CreatePostResponse or Post
}

export interface UpdatePostResponse {
  postId: string
  title: string
  content: string
  media: string
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

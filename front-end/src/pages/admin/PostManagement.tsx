import { useEffect, useState } from 'react'
import { ConfirmModal } from './ConfirmModal'
import { deletePost as deletePostApi, getAllPosts, hidePost as hidePostApi, showPost as showPostApi } from './postApi'
import './PostManagement.css'

interface Post {
  postId: string
  profileId: string
  userId: string
  username: string
  avatarUrl?: string
  title?: string
  content: string
  media?: string
  upvoteCount?: number
  downvoteCount?: number
  createdAt: string
  updatedAt: string
  isHidden?: boolean
  status?: string // Accept, Pending, Reject
}

interface ConfirmState {
  isOpen: boolean
  title: string
  message: string
  type: 'danger' | 'warning' | 'info'
  onConfirm: () => void
}

export function PostManagement() {
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [confirmModal, setConfirmModal] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {}
  })
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [viewingPost, setViewingPost] = useState<Post | null>(null)
  const pageSize = 20

  useEffect(() => {
    loadPosts()
  }, [page])

  useEffect(() => {
    filterPosts()
  }, [posts, searchTerm, statusFilter])

  const loadPosts = async () => {
    setLoading(true)
    try {
      const res = await getAllPosts(page, pageSize)
      if (res.success && res.data) {
        const postsData = Array.isArray(res.data) ? res.data : []
        setPosts(postsData)
        setTotal(postsData.length)
      }
    } catch (error) {
      console.error('Failed to load posts:', error)
      showSuccess('Lỗi khi tải danh sách bài viết')
    } finally {
      setLoading(false)
    }
  }

  const filterPosts = () => {
    let filtered = posts

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'hidden') {
        filtered = filtered.filter((post) => post.isHidden === true)
      } else if (statusFilter === 'visible') {
        filtered = filtered.filter((post) => !post.isHidden)
      } else {
        filtered = filtered.filter((post) => post.status === statusFilter)
      }
    }

    setFilteredPosts(filtered)
  }

  const handleDelete = async (postId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa Bài Viết',
      message: 'Bạn có chắc muốn xóa bài viết này? Hành động không thể hoàn tác!',
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await deletePostApi(postId)
          if (res.success) {
            showSuccess('Đã xóa bài viết thành công')
            loadPosts()
          } else {
            showSuccess('Lỗi: ' + res.message)
          }
        } catch (error) {
          showSuccess('Lỗi khi xóa bài viết')
        }
        setConfirmModal({ ...confirmModal, isOpen: false })
      }
    })
  }

  const handleHide = async (postId: string) => {
    try {
      const res = await hidePostApi(postId)
      if (res.success) {
        showSuccess('Đã ẩn bài viết')
        loadPosts()
      }
    } catch (error) {
      showSuccess('Lỗi khi ẩn bài viết')
    }
  }

  const handleShow = async (postId: string) => {
    try {
      const res = await showPostApi(postId)
      if (res.success) {
        showSuccess('Đã hiện bài viết')
        loadPosts()
      }
    } catch (error) {
      showSuccess('Lỗi khi hiện bài viết')
    }
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  if (loading) {
    return <div className='loading'>Đang tải...</div>
  }

  return (
    <div className='post-management'>
      {successMessage && <div className='success-toast'>{successMessage}</div>}

      {/* Header Stats */}
      <div className='stats-bar'>
        <div className='stat-item'>
          <div className='stat-value'>{total}</div>
          <div className='stat-label'>Tổng bài viết</div>
        </div>
        <div className='stat-item'>
          <div className='stat-value'>{posts.filter((p) => p.isHidden).length}</div>
          <div className='stat-label'>Đã ẩn</div>
        </div>
        <div className='stat-item'>
          <div className='stat-value'>{posts.reduce((sum, p) => sum + (p.upvoteCount || 0), 0)}</div>
          <div className='stat-label'>Tổng upvotes</div>
        </div>
        <div className='stat-item'>
          <div className='stat-value'>{posts.reduce((sum, p) => sum + (p.downvoteCount || 0), 0)}</div>
          <div className='stat-label'>Tổng downvotes</div>
        </div>
        <div className='stat-item'>
          <div className='stat-value'>{posts.filter((p) => p.media).length}</div>
          <div className='stat-label'>Có hình ảnh</div>
        </div>
      </div>

      {/* Controls */}
      <div className='controls-bar'>
        <div className='search-box'>
          <input
            type='text'
            placeholder='Tìm kiếm bài viết...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className='filter-group'>
          <label>Trạng thái:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value='all'>Tất cả</option>
            <option value='visible'>Đang hiển thị</option>
            <option value='hidden'>Đã ẩn</option>
            <option value='Accept'>Đã duyệt</option>
            <option value='Pending'>Chờ duyệt</option>
            <option value='Reject'>Đã từ chối</option>
          </select>
        </div>

        <div className='results-count'>
          Hiển thị {filteredPosts.length} / {total} bài viết
        </div>
      </div>

      {/* Posts Grid */}
      <div className='posts-grid'>
        {filteredPosts.length === 0 ? (
          <div className='empty-state'>
            <p>Chưa có bài viết nào.</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.postId} className='post-card'>
              <div className='post-header'>
                <div className='post-author'>
                  <strong>{post.username || 'Unknown'}</strong>
                  <span className='post-date'>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                {post.isHidden && <span className='badge-hidden'>Đã ẩn</span>}
              </div>

              <div className='post-content'>
                {post.title && <h4>{post.title}</h4>}
                <p>
                  {post.content.substring(0, 150)}
                  {post.content.length > 150 ? '...' : ''}
                </p>
                {post.media && (
                  <div className='post-image-container'>
                    <img src={post.media} alt='Post' className='post-image' />
                  </div>
                )}
              </div>

              <div className='post-stats'>
                <span>
                  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M18 15l-6-6-6 6' />
                  </svg>
                  {post.upvoteCount || 0}
                </span>
                <span>
                  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M6 9l6 6 6-6' />
                  </svg>
                  {post.downvoteCount || 0}
                </span>
              </div>

              <div className='post-actions'>
                <button className='btn-view' onClick={() => setViewingPost(post)}>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
                    <circle cx='12' cy='12' r='3' />
                  </svg>
                  Xem
                </button>
                {post.isHidden ? (
                  <button className='btn-success' onClick={() => handleShow(post.postId)}>
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                      <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
                      <circle cx='12' cy='12' r='3' />
                    </svg>
                    Hiện
                  </button>
                ) : (
                  <button className='btn-warning' onClick={() => handleHide(post.postId)}>
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                      <path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' />
                      <line x1='1' y1='1' x2='23' y2='23' />
                    </svg>
                    Ẩn
                  </button>
                )}
                <button className='btn-delete' onClick={() => handleDelete(post.postId)}>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <polyline points='3 6 5 6 21 6' />
                    <path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
                  </svg>
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className='pagination'>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          ← Trước
        </button>
        <span>
          Trang {page} / {Math.ceil(total / pageSize) || 1}
        </span>
        <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / pageSize)}>
          Sau →
        </button>
      </div>

      {/* View Post Modal */}
      {viewingPost && (
        <div className='modal-overlay' onClick={() => setViewingPost(null)}>
          <div className='modal-content post-modal' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h3>Chi Tiết Bài Viết</h3>
              <button className='close-btn' onClick={() => setViewingPost(null)}>
                ×
              </button>
            </div>
            <div className='modal-body'>
              <div className='post-detail'>
                <p>
                  <strong>Người đăng:</strong> {viewingPost.username}
                </p>
                <p>
                  <strong>Ngày đăng:</strong> {new Date(viewingPost.createdAt).toLocaleString('vi-VN')}
                </p>
                {viewingPost.title && (
                  <p>
                    <strong>Tiêu đề:</strong> {viewingPost.title}
                  </p>
                )}
                {viewingPost.isHidden && (
                  <p>
                    <strong>Trạng thái:</strong> <span className='badge-hidden'>Đã ẩn</span>
                  </p>
                )}
                <p>
                  <strong>Nội dung:</strong>
                </p>
                <p className='post-full-content'>{viewingPost.content}</p>
                {viewingPost.media && <img src={viewingPost.media} alt='Post' className='post-full-image' />}
                <div className='post-stats'>
                  <span>
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                      <path d='M18 15l-6-6-6 6' />
                    </svg>
                    {viewingPost.upvoteCount || 0} upvotes
                  </span>
                  <span>
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                      <path d='M6 9l6 6 6-6' />
                    </svg>
                    {viewingPost.downvoteCount || 0} downvotes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  )
}

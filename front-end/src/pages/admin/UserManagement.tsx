import { useEffect, useState } from 'react'
import { banUser, deleteUser, getAllUsers, unbanUser } from './adminApi'
import { ConfirmModal } from './ConfirmModal'
import './UserManagement.css'

interface User {
  id: string
  username: string
  email: string
  role: string
  createdAt: string
  phoneNumber?: string
}

interface ConfirmState {
  isOpen: boolean
  title: string
  message: string
  type: 'danger' | 'warning' | 'info'
  onConfirm: () => void
}

interface UserManagementProps {
  onNavigateToNotifications?: (userId: string) => void
}

export function UserManagement({ onNavigateToNotifications }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'Admin' | 'User'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [dropdownTimeout, setDropdownTimeout] = useState<number | null>(null)
  const [confirmModal, setConfirmModal] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {}
  })
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const pageSize = 20

  useEffect(() => {
    loadUsers()
  }, [page])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, sortBy])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await getAllUsers(page, pageSize)
      if (res.success && res.data) {
        setUsers(res.data.users || [])
        setTotal(res.data.total || 0)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    // Sort by createdAt
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB
    })

    setFilteredUsers(filtered)
  }

  const handleDropdownEnter = (userId: string) => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout)
      setDropdownTimeout(null)
    }
    setActiveDropdown(userId)
  }

  const handleDropdownLeave = () => {
    const timeout = setTimeout(() => {
      setActiveDropdown(null)
    }, 300) // 300ms delay before closing
    setDropdownTimeout(timeout)
  }

  const handleDelete = async (userId: string, username: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa Người Dùng',
      message: `Bạn có chắc muốn xóa người dùng "${username}"? Hành động này không thể hoàn tác!`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await deleteUser(userId)
          if (res.success) {
            setSuccessMessage('Đã xóa người dùng thành công')
            setTimeout(() => setSuccessMessage(null), 3000)
            loadUsers()
          } else {
            setSuccessMessage('Lỗi: ' + res.message)
            setTimeout(() => setSuccessMessage(null), 3000)
          }
        } catch (error) {
          setSuccessMessage('Lỗi khi xóa người dùng')
          setTimeout(() => setSuccessMessage(null), 3000)
        }
        setConfirmModal({ ...confirmModal, isOpen: false })
        setActiveDropdown(null)
      }
    })
  }

  const handleBan = async (userId: string, username: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Cấm Người Dùng',
      message: `Bạn có chắc muốn cấm người dùng "${username}"?`,
      type: 'warning',
      onConfirm: async () => {
        try {
          const res = await banUser(userId)
          if (res.success) {
            setSuccessMessage('Đã cấm người dùng thành công')
            setTimeout(() => setSuccessMessage(null), 3000)
            loadUsers()
          } else {
            setSuccessMessage('Lỗi: ' + res.message)
            setTimeout(() => setSuccessMessage(null), 3000)
          }
        } catch (error) {
          setSuccessMessage('Lỗi khi cấm người dùng')
          setTimeout(() => setSuccessMessage(null), 3000)
        }
        setConfirmModal({ ...confirmModal, isOpen: false })
        setActiveDropdown(null)
      }
    })
  }

  const handleUnban = async (userId: string, username: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Bỏ Cấm Người Dùng',
      message: `Bạn có chắc muốn bỏ cấm người dùng "${username}"?`,
      type: 'info',
      onConfirm: async () => {
        try {
          const res = await unbanUser(userId)
          if (res.success) {
            setSuccessMessage('Đã bỏ cấm người dùng thành công')
            setTimeout(() => setSuccessMessage(null), 3000)
            loadUsers()
          } else {
            setSuccessMessage('Lỗi: ' + res.message)
            setTimeout(() => setSuccessMessage(null), 3000)
          }
        } catch (error) {
          setSuccessMessage('Lỗi khi bỏ cấm người dùng')
          setTimeout(() => setSuccessMessage(null), 3000)
        }
        setConfirmModal({ ...confirmModal, isOpen: false })
        setActiveDropdown(null)
      }
    })
  }

  if (loading) {
    return <div className='loading'>Đang tải...</div>
  }

  return (
    <div className='user-management'>
      {/* Success Message */}
      {successMessage && <div className='success-toast'>{successMessage}</div>}

      {/* Search and Filter Bar */}
      <div className='controls-bar'>
        <div className='search-box'>
          <input
            type='text'
            placeholder='Tìm kiếm theo tên hoặc email...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className='filter-group'>
          <label>Lọc theo role:</label>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)}>
            <option value='all'>Tất cả</option>
            <option value='Admin'>Admin</option>
            <option value='User'>User</option>
          </select>
        </div>

        <div className='filter-group'>
          <label>Sắp xếp:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value='newest'>Mới nhất</option>
            <option value='oldest'>Cũ nhất</option>
          </select>
        </div>

        <div className='results-count'>
          Hiển thị {filteredUsers.length} / {total} users
        </div>
      </div>

      {/* Users Table */}
      <div className='table-container'>
        <table className='user-table'>
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Avatar</th>
              <th>Thông Tin User</th>
              <th>Role / Trạng Thái</th>
              <th>Ngày Tạo</th>
              <th style={{ textAlign: 'right' }}>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              const initial = user.username.charAt(0).toUpperCase()
              const avatarColor = user.role === 'Admin' ? '#667eea' : user.role === 'Banned' ? '#f56565' : '#48bb78'

              return (
                <tr key={user.id}>
                  <td>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: avatarColor,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '18px'
                      }}
                    >
                      {initial}
                    </div>
                  </td>
                  <td>
                    <div className='user-info-cell'>
                      <div className='user-name' onClick={() => setEditingUser(user)}>
                        {user.username}
                      </div>
                      <div className='user-email'>{user.email}</div>
                    </div>
                  </td>
                  <td>
                    <div className='badges-container'>
                      <span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
                      {user.role === 'Banned' ? (
                        <span className='status-badge banned'>Banned</span>
                      ) : (
                        <span className='status-badge active'>Active</span>
                      )}
                    </div>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className='row-actions'>
                      <button className='icon-btn view' title='Xem chi tiết' onClick={() => setEditingUser(user)}>
                        <svg
                          width='20'
                          height='20'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                          ></path>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                          ></path>
                        </svg>
                      </button>
                      <div
                        className='actions-dropdown'
                        onMouseEnter={() => handleDropdownEnter(user.id)}
                        onMouseLeave={handleDropdownLeave}
                      >
                        <button className='actions-trigger'>
                          <svg
                            width='20'
                            height='20'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                            xmlns='http://www.w3.org/2000/svg'
                          >
                            <path d='M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z'></path>
                          </svg>
                        </button>
                        {activeDropdown === user.id && (
                          <div className='dropdown-menu'>
                            <button
                              className='dropdown-item view'
                              onClick={() => {
                                if (onNavigateToNotifications) {
                                  onNavigateToNotifications(user.id)
                                } else {
                                  navigator.clipboard.writeText(user.id)
                                  setSuccessMessage('Đã sao chép User ID: ' + user.id)
                                  setTimeout(() => setSuccessMessage(null), 3000)
                                }
                              }}
                            >
                              <svg
                                width='16'
                                height='16'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                                xmlns='http://www.w3.org/2000/svg'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth='2'
                                  d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'
                                ></path>
                              </svg>
                              Gửi Thông Báo
                            </button>
                            <button className='dropdown-item view' onClick={() => setEditingUser(user)}>
                              <svg
                                width='16'
                                height='16'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                                xmlns='http://www.w3.org/2000/svg'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth='2'
                                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                                ></path>
                              </svg>
                              Xem Chi Tiết
                            </button>
                            {user.role === 'Banned' ? (
                              <button
                                className='dropdown-item unban'
                                onClick={() => handleUnban(user.id, user.username)}
                              >
                                <svg
                                  width='16'
                                  height='16'
                                  fill='none'
                                  stroke='currentColor'
                                  viewBox='0 0 24 24'
                                  xmlns='http://www.w3.org/2000/svg'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth='2'
                                    d='M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z'
                                  ></path>
                                </svg>
                                Bỏ Cấm
                              </button>
                            ) : (
                              <button
                                className='dropdown-item ban'
                                onClick={() => handleBan(user.id, user.username)}
                                disabled={user.role === 'Admin'}
                              >
                                <svg
                                  width='16'
                                  height='16'
                                  fill='none'
                                  stroke='currentColor'
                                  viewBox='0 0 24 24'
                                  xmlns='http://www.w3.org/2000/svg'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth='2'
                                    d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
                                  ></path>
                                </svg>
                                Cấm User
                              </button>
                            )}
                            <button
                              className='dropdown-item delete'
                              onClick={() => handleDelete(user.id, user.username)}
                              disabled={user.role === 'Admin'}
                            >
                              <svg
                                width='16'
                                height='16'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                                xmlns='http://www.w3.org/2000/svg'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth='2'
                                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                                ></path>
                              </svg>
                              Xóa User
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className='pagination'>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          <svg
            width='16'
            height='16'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 19l-7-7 7-7'></path>
          </svg>{' '}
          Trước
        </button>
        <span>
          Trang {page} / {Math.ceil(total / pageSize)}
        </span>
        <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / pageSize)}>
          Sau{' '}
          <svg
            width='16'
            height='16'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7'></path>
          </svg>
        </button>
      </div>

      {/* User Detail Modal */}
      {editingUser && (
        <div className='modal-overlay' onClick={() => setEditingUser(null)}>
          <div className='modal-content' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h3>Chi tiết người dùng</h3>
              <button className='close-btn' onClick={() => setEditingUser(null)}>
                <svg
                  width='24'
                  height='24'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12'></path>
                </svg>
              </button>
            </div>
            <div className='modal-body'>
              <div className='detail-row'>
                <span className='label'>ID:</span>
                <span className='value'>{editingUser.id}</span>
              </div>
              <div className='detail-row'>
                <span className='label'>Username:</span>
                <span className='value'>{editingUser.username}</span>
              </div>
              <div className='detail-row'>
                <span className='label'>Email:</span>
                <span className='value'>{editingUser.email}</span>
              </div>
              <div className='detail-row'>
                <span className='label'>Role:</span>
                <span className='value'>
                  <span className={`role-badge ${editingUser.role.toLowerCase()}`}>{editingUser.role}</span>
                </span>
              </div>
              <div className='detail-row'>
                <span className='label'>Số điện thoại:</span>
                <span className='value'>{editingUser.phoneNumber || 'Chưa có'}</span>
              </div>
              <div className='detail-row'>
                <span className='label'>Ngày tạo:</span>
                <span className='value'>{new Date(editingUser.createdAt).toLocaleString('vi-VN')}</span>
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

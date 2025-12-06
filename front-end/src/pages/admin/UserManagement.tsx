import { useEffect, useState } from 'react'
import { banUser, deleteUser, getAllUsers } from './adminApi'
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

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'Admin' | 'User'>('all')
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
  }, [users, searchTerm, roleFilter])

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
    return <div className="loading">Đang tải...</div>
  }

  return (
    <div className="user-management">
      {/* Success Message */}
      {successMessage && (
        <div className="success-toast">
          {successMessage}
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="controls-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Lọc theo role:</label>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)}>
            <option value="all">Tất cả</option>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>
        </div>

        <div className="results-count">
          Hiển thị {filteredUsers.length} / {total} users
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Ngày Tạo</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div
                    className="actions-dropdown"
                    onMouseEnter={() => handleDropdownEnter(user.id)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <button className="actions-trigger">
                      ⋮
                    </button>
                    {activeDropdown === user.id && (
                      <div className="dropdown-menu">
                        <button
                          className="dropdown-item view"
                          onClick={() => setEditingUser(user)}
                        >
                          Xem Chi Tiết
                        </button>
                        {user.role === 'Banned' ? (
                          <button
                            className="dropdown-item unban"
                            onClick={() => handleUnban(user.id, user.username)}
                          >
                            Bỏ Cấm
                          </button>
                        ) : (
                          <button
                            className="dropdown-item ban"
                            onClick={() => handleBan(user.id, user.username)}
                            disabled={user.role === 'Admin'}
                          >
                            Cấm User
                          </button>
                        )}
                        <button
                          className="dropdown-item delete"
                          onClick={() => handleDelete(user.id, user.username)}
                          disabled={user.role === 'Admin'}
                        >
                          Xóa User
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          ← Trước
        </button>
        <span>Trang {page} / {Math.ceil(total / pageSize)}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page >= Math.ceil(total / pageSize)}
        >
          Sau →
        </button>
      </div>

      {/* User Detail Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết người dùng</h3>
              <button className="close-btn" onClick={() => setEditingUser(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="label">ID:</span>
                <span className="value">{editingUser.id}</span>
              </div>
              <div className="detail-row">
                <span className="label">Username:</span>
                <span className="value">{editingUser.username}</span>
              </div>
              <div className="detail-row">
                <span className="label">Email:</span>
                <span className="value">{editingUser.email}</span>
              </div>
              <div className="detail-row">
                <span className="label">Role:</span>
                <span className="value">
                  <span className={`role-badge ${editingUser.role.toLowerCase()}`}>
                    {editingUser.role}
                  </span>
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Số điện thoại:</span>
                <span className="value">{editingUser.phoneNumber || 'Chưa có'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Ngày tạo:</span>
                <span className="value">{new Date(editingUser.createdAt).toLocaleString('vi-VN')}</span>
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

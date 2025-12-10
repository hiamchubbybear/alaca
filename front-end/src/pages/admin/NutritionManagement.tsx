import { useEffect, useState } from 'react'
import { ConfirmModal } from './ConfirmModal'
import {
  createFood,
  deleteFood as deleteFoodApi,
  deletePlan as deletePlanApi,
  getAllFoods,
  getMyNutritionPlans,
  updateFood
} from './nutritionApi'
import './NutritionManagement.css'

interface FoodItem {
  id: string
  name: string
  caloriesKcal: number
  proteinG: number
  carbsG: number
  fatG: number
  servingSize: string
  servingAmount: number
  category?: string
  createdAt: string
}

interface NutritionPlan {
  id: string
  title: string
  description?: string
  ownerUserId: string
  visibility: string
  createdAt: string
}

interface ConfirmState {
  isOpen: boolean
  title: string
  message: string
  type: 'danger' | 'warning' | 'info'
  onConfirm: () => void
}

export function NutritionManagement() {
  const [activeTab, setActiveTab] = useState<'foods' | 'plans'>('foods')

  // Food States
  const [foods, setFoods] = useState<FoodItem[]>([])
  const [filteredFoods, setFilteredFoods] = useState<FoodItem[]>([])
  const [foodSearchTerm, setFoodSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Plan States
  const [plans, setPlans] = useState<NutritionPlan[]>([])
  const [filteredPlans, setFilteredPlans] = useState<NutritionPlan[]>([])
  const [planSearchTerm, setPlanSearchTerm] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all')

  // Common
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [confirmModal, setConfirmModal] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {}
  })
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  // Form
  const [formData, setFormData] = useState({
    name: '',
    caloriesKcal: '',
    proteinG: '',
    carbsG: '',
    fatG: '',
    servingSize: '',
    servingAmount: '',
    category: ''
  })

  const pageSize = 20

  useEffect(() => {
    if (activeTab === 'foods') {
      loadFoods()
    } else {
      loadPlans()
    }
  }, [page, activeTab, categoryFilter])

  useEffect(() => {
    if (activeTab === 'foods') {
      filterFoods()
    } else {
      filterPlans()
    }
  }, [foods, foodSearchTerm, plans, planSearchTerm, visibilityFilter])

  const loadFoods = async () => {
    setLoading(true)
    try {
      const res = await getAllFoods(page, pageSize, categoryFilter === 'all' ? undefined : categoryFilter)
      if (res.success && res.data) {
        setFoods(res.data.foodItems || [])
        setTotal(res.data.total || 0)
      }
    } catch (error) {
      console.error('Failed to load foods:', error)
      showSuccess('Lỗi khi tải danh sách món ăn')
    } finally {
      setLoading(false)
    }
  }

  const loadPlans = async () => {
    setLoading(true)
    try {
      const res = await getMyNutritionPlans(page, pageSize)
      if (res.success && res.data) {
        setPlans(res.data || [])
        setTotal(res.data.length || 0)
      }
    } catch (error) {
      console.error('Failed to load plans:', error)
      showSuccess('Lỗi khi tải danh sách kế hoạch')
    } finally {
      setLoading(false)
    }
  }

  const filterFoods = () => {
    let filtered = foods
    if (foodSearchTerm) {
      filtered = filtered.filter((food) => food.name.toLowerCase().includes(foodSearchTerm.toLowerCase()))
    }
    setFilteredFoods(filtered)
  }

  const filterPlans = () => {
    let filtered = plans
    if (planSearchTerm) {
      filtered = filtered.filter((plan) => plan.title.toLowerCase().includes(planSearchTerm.toLowerCase()))
    }
    if (visibilityFilter !== 'all') {
      filtered = filtered.filter((plan) => plan.visibility === visibilityFilter)
    }
    setFilteredPlans(filtered)
  }

  const handleDeleteFood = async (foodId: string, foodName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa Món Ăn',
      message: `Bạn có chắc muốn xóa món ăn "${foodName}"? Hành động này không thể hoàn tác!`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await deleteFoodApi(foodId)
          if (res.success) {
            showSuccess('Đã xóa món ăn thành công')
            loadFoods()
          } else {
            showSuccess('Lỗi: ' + res.message)
          }
        } catch (error) {
          showSuccess('Lỗi khi xóa món ăn')
        }
        setConfirmModal({ ...confirmModal, isOpen: false })
        setActiveDropdown(null)
      }
    })
  }

  const handleDeletePlan = async (planId: string, planTitle: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa Kế Hoạch',
      message: `Bạn có chắc muốn xóa kế hoạch "${planTitle}"?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await deletePlanApi(planId)
          if (res.success) {
            showSuccess('Đã xóa kế hoạch thành công')
            loadPlans()
          } else {
            showSuccess('Lỗi: ' + res.message)
          }
        } catch (error) {
          showSuccess('Lỗi khi xóa kế hoạch')
        }
        setConfirmModal({ ...confirmModal, isOpen: false })
        setActiveDropdown(null)
      }
    })
  }

  const handleSaveFood = async () => {
    try {
      const data = {
        name: formData.name,
        caloriesKcal: parseInt(formData.caloriesKcal),
        proteinG: parseFloat(formData.proteinG),
        carbsG: parseFloat(formData.carbsG),
        fatG: parseFloat(formData.fatG),
        servingSize: formData.servingSize,
        servingAmount: parseInt(formData.servingAmount),
        category: formData.category
      }

      if (editingItem) {
        const res = await updateFood(editingItem.id, data)
        if (res.success) {
          showSuccess('Đã cập nhật món ăn thành công')
        }
      } else {
        const res = await createFood(data)
        if (res.success) {
          showSuccess('Đã thêm món ăn thành công')
        }
      }

      setIsCreating(false)
      setEditingItem(null)
      resetForm()
      loadFoods()
    } catch (error) {
      showSuccess('Lỗi khi lưu món ăn')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      caloriesKcal: '',
      proteinG: '',
      carbsG: '',
      fatG: '',
      servingSize: '',
      servingAmount: '',
      category: ''
    })
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  if (loading) {
    return <div className='loading'>Đang tải...</div>
  }

  return (
    <div className='nutrition-management'>
      {successMessage && <div className='success-toast'>{successMessage}</div>}

      {/* Tabs */}
      <div className='tab-navigation'>
        <button
          className={`tab-btn ${activeTab === 'foods' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('foods')
            setPage(1)
          }}
        >
          Quản Lý Thực Phẩm
        </button>
        <button
          className={`tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('plans')
            setPage(1)
          }}
        >
          Quản Lý Kế Hoạch
        </button>
      </div>

      {/* Food Tab */}
      {activeTab === 'foods' && (
        <>
          <div className='controls-bar'>
            <div className='search-box'>
              <input
                type='text'
                placeholder='Tìm kiếm món ăn...'
                value={foodSearchTerm}
                onChange={(e) => setFoodSearchTerm(e.target.value)}
              />
            </div>

            <div className='filter-group'>
              <label>Danh mục:</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value='all'>Tất cả</option>
                <option value='protein'>Protein</option>
                <option value='carbs'>Carbs</option>
                <option value='vegetables'>Rau củ</option>
                <option value='fruits'>Trái cây</option>
                <option value='dairy'>Sữa & Chế phẩm</option>
              </select>
            </div>

            <button
              className='btn-create'
              onClick={() => {
                setIsCreating(true)
                resetForm()
              }}
            >
              + Thêm Món Ăn
            </button>

            <div className='results-count'>
              Hiển thị {filteredFoods.length} / {total} món
            </div>
          </div>

          {/* Form */}
          {(isCreating || editingItem) && (
            <div className='create-form'>
              <h3>{editingItem ? 'Sửa Món Ăn' : 'Thêm Món Ăn Mới'}</h3>
              <div className='form-grid'>
                <input
                  type='text'
                  placeholder='Tên món ăn'
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                  type='number'
                  placeholder='Calories (kcal)'
                  value={formData.caloriesKcal}
                  onChange={(e) => setFormData({ ...formData, caloriesKcal: e.target.value })}
                />
                <input
                  type='number'
                  placeholder='Protein (g)'
                  step='0.1'
                  value={formData.proteinG}
                  onChange={(e) => setFormData({ ...formData, proteinG: e.target.value })}
                />
                <input
                  type='number'
                  placeholder='Carbs (g)'
                  step='0.1'
                  value={formData.carbsG}
                  onChange={(e) => setFormData({ ...formData, carbsG: e.target.value })}
                />
                <input
                  type='number'
                  placeholder='Fat (g)'
                  step='0.1'
                  value={formData.fatG}
                  onChange={(e) => setFormData({ ...formData, fatG: e.target.value })}
                />
                <input
                  type='text'
                  placeholder='Định lượng (vd: 100g)'
                  value={formData.servingSize}
                  onChange={(e) => setFormData({ ...formData, servingSize: e.target.value })}
                />
                <input
                  type='number'
                  placeholder='Khối lượng'
                  value={formData.servingAmount}
                  onChange={(e) => setFormData({ ...formData, servingAmount: e.target.value })}
                />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value=''>Chọn danh mục</option>
                  <option value='protein'>Protein</option>
                  <option value='carbs'>Carbs</option>
                  <option value='vegetables'>Rau củ</option>
                  <option value='fruits'>Trái cây</option>
                  <option value='dairy'>Sữa & Chế phẩm</option>
                </select>
              </div>
              <div className='form-actions'>
                <button className='btn-primary' onClick={handleSaveFood}>
                  Lưu
                </button>
                <button
                  className='btn-secondary'
                  onClick={() => {
                    setEditingItem(null)
                    setIsCreating(false)
                    resetForm()
                  }}
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className='table-container'>
            <table className='nutrition-table'>
              <thead>
                <tr>
                  <th>Tên Món Ăn</th>
                  <th>Calories</th>
                  <th>Protein</th>
                  <th>Carbs</th>
                  <th>Fat</th>
                  <th>Định lượng</th>
                  <th>Danh mục</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredFoods.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                      Chưa có dữ liệu món ăn. Nhấn "Thêm Món Ăn" để tạo mới.
                    </td>
                  </tr>
                ) : (
                  filteredFoods.map((food) => (
                    <tr key={food.id}>
                      <td className='food-name'>{food.name}</td>
                      <td>{food.caloriesKcal} kcal</td>
                      <td>{food.proteinG}g</td>
                      <td>{food.carbsG}g</td>
                      <td>{food.fatG}g</td>
                      <td>{food.servingSize}</td>
                      <td>
                        <span className={`category-badge ${food.category}`}>{food.category}</span>
                      </td>
                      <td>
                        <div
                          className='actions-dropdown'
                          onMouseEnter={() => setActiveDropdown(food.id)}
                          onMouseLeave={() => setActiveDropdown(null)}
                        >
                          <button className='actions-trigger'>⋮</button>
                          {activeDropdown === food.id && (
                            <div className='dropdown-menu'>
                              <button
                                className='dropdown-item edit'
                                onClick={() => {
                                  setEditingItem(food)
                                  setFormData({
                                    name: food.name,
                                    caloriesKcal: food.caloriesKcal.toString(),
                                    proteinG: food.proteinG.toString(),
                                    carbsG: food.carbsG.toString(),
                                    fatG: food.fatG.toString(),
                                    servingSize: food.servingSize,
                                    servingAmount: food.servingAmount.toString(),
                                    category: food.category || ''
                                  })
                                }}
                              >
                                Sửa
                              </button>
                              <button
                                className='dropdown-item delete'
                                onClick={() => handleDeleteFood(food.id, food.name)}
                              >
                                Xóa
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <>
          <div className='controls-bar'>
            <div className='search-box'>
              <input
                type='text'
                placeholder='Tìm kiếm kế hoạch...'
                value={planSearchTerm}
                onChange={(e) => setPlanSearchTerm(e.target.value)}
              />
            </div>

            <div className='filter-group'>
              <label>Trạng thái:</label>
              <select value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value)}>
                <option value='all'>Tất cả</option>
                <option value='public'>Công khai</option>
                <option value='private'>Riêng tư</option>
              </select>
            </div>

            <div className='results-count'>
              Hiển thị {filteredPlans.length} / {total} kế hoạch
            </div>
          </div>

          <div className='plans-grid'>
            {filteredPlans.length === 0 ? (
              <div className='empty-state'>
                <p>Chưa có kế hoạch dinh dưỡng nào.</p>
              </div>
            ) : (
              filteredPlans.map((plan) => (
                <div key={plan.id} className='plan-card'>
                  <div className='plan-header'>
                    <h4>{plan.title}</h4>
                    <span className={`visibility-badge ${plan.visibility}`}>
                      {plan.visibility === 'public' ? 'Công khai' : 'Riêng tư'}
                    </span>
                  </div>
                  <p className='plan-description'>{plan.description || 'Không có mô tả'}</p>
                  <div className='plan-actions'>
                    <button className='btn-view'>Xem Chi Tiết</button>
                    <button className='btn-delete' onClick={() => handleDeletePlan(plan.id, plan.title)}>
                      Xóa
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

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

import { useEffect, useState } from 'react'
import {
  addItemToPlan,
  createNutritionPlan,
  createWeeklyNutritionPlan,
  generateDailyMealPlan,
  getFoodItems,
  getMyNutritionPlans,
  markItemCompleted,
  removeItemFromPlan,
  searchFoodItems,
  updateNutritionPlanItem
} from '../api/nutritionApi'
import type { FoodItem, NutritionPlan, NutritionPlanItem } from '../types'
import './NutritionSection.css'

const DAILY_CALORIE_LIMIT = 2500 // Example limit

type MealTab = 'morning' | 'lunch' | 'dinner' | 'summary'

// SVG Icons
const DiceIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
    <rect x='3' y='3' width='18' height='18' rx='2' ry='2' />
    <circle cx='8.5' cy='8.5' r='1' />
    <circle cx='15.5' cy='15.5' r='1' />
    <circle cx='8.5' cy='15.5' r='1' />
    <circle cx='15.5' cy='8.5' r='1' />
    <circle cx='12' cy='12' r='1' />
  </svg>
)

const EditIcon = () => (
  <svg
    width='16'
    height='16'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' />
    <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' />
  </svg>
)

const TrashIcon = () => (
  <svg
    width='16'
    height='16'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <polyline points='3 6 5 6 21 6' />
    <path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
  </svg>
)

const PlateIcon = () => (
  <svg width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
    <circle cx='12' cy='12' r='10' />
    <path d='M12 6v6l4 2' />
  </svg>
)

const CalendarIcon = () => (
  <svg width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
    <rect x='3' y='4' width='18' height='18' rx='2' ry='2' />
    <line x1='16' y1='2' x2='16' y2='6' />
    <line x1='8' y1='2' x2='8' y2='6' />
    <line x1='3' y1='10' x2='21' y2='10' />
  </svg>
)

const MoreVerticalIcon = () => (
  <svg
    width='20'
    height='20'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <circle cx='12' cy='12' r='1' />
    <circle cx='12' cy='5' r='1' />
    <circle cx='12' cy='19' r='1' />
  </svg>
)

const CheckIcon = () => (
  <svg
    width='16'
    height='16'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <polyline points='20 6 9 17 4 12' />
  </svg>
)

const AlertTriangleIcon = () => (
  <svg
    width='20'
    height='20'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' />
    <line x1='12' y1='9' x2='12' y2='13' />
    <line x1='12' y1='17' x2='12.01' y2='17' />
  </svg>
)

export function NutritionSection() {
  // Calendar State
  const [currentDate] = useState(new Date())
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const initialDate = `${year}-${month}-${day}`
    console.log('📅 Initial Date State:', { today: today.toString(), initialDate })
    return initialDate
  })
  const [showDayDetail, setShowDayDetail] = useState(false)
  const [activeTab, setActiveTab] = useState<MealTab>('morning')

  // Data State
  const [plans, setPlans] = useState<NutritionPlan[]>([])
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<NutritionPlanItem | null>(null)

  // Search State
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeMealType, setActiveMealType] = useState<string>('Breakfast')
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)

  // Food Detail Tab State
  const [foodDetailTab, setFoodDetailTab] = useState<'image' | 'nutrition'>('image')

  // New UI States
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    type: 'alert' | 'confirm'
    title: string
    message: string
    onConfirm?: () => void
  }>({ isOpen: false, type: 'alert', title: '', message: '' })

  // Custom Alert/Confirm Helpers
  const showAlert = (title: string, message: string) => {
    setModalState({ isOpen: true, type: 'alert', title, message })
  }

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModalState({ isOpen: true, type: 'confirm', title, message, onConfirm })
  }

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }))
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdownId(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Generate Week Days
  const getWeekDays = (baseDate: Date) => {
    const days = []
    const startOfWeek = new Date(baseDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // adjuster
    startOfWeek.setDate(diff)

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek)
      d.setDate(startOfWeek.getDate() + i)
      days.push(d)
    }
    return days
  }

  const weekDays = getWeekDays(currentDate)
  const currentMonth = weekDays[0].toLocaleString('default', { month: 'long' })
  const currentYear = weekDays[0].getFullYear()

  // Load Initial Data
  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const res = await getMyNutritionPlans(1, 100)
      if (res.success && res.data) {
        setPlans(res.data.plans)
      }
    } catch (error) {
      console.error('Failed to load plans')
    }
  }

  const loadFood = async (query: string = '') => {
    try {
      setLoading(true)
      const res = query ? await searchFoodItems(query) : await getFoodItems()

      if (res.success && res.data) {
        setFoodItems(res.data.foodItems)
      }
    } catch {
      setFoodItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (showSearch) loadFood(searchQuery)
  }, [showSearch, searchQuery])

  // Current Plan Helpers
  const currentPlan =
    plans.find((p) => p.items.some((i) => i.date?.startsWith(selectedDateStr))) ||
    plans.find((p) => p.startDate?.startsWith(selectedDateStr))

  const getMealTypeForTab = (tab: MealTab): string => {
    switch (tab) {
      case 'morning':
        return 'Breakfast'
      case 'lunch':
        return 'Lunch'
      case 'dinner':
        return 'Dinner'
      default:
        return ''
    }
  }

  const getItemsForMeal = (mealType: string) => {
    return (
      currentPlan?.items.filter(
        (i) => i.mealTime === mealType && (i.date ? i.date.startsWith(selectedDateStr) : true)
      ) || []
    )
  }

  const getSnackItems = () => {
    return (
      currentPlan?.items.filter(
        (i) => i.mealTime === 'Snack' && (i.date ? i.date.startsWith(selectedDateStr) : true)
      ) || []
    )
  }

  const calculateTotalCalories = () => {
    if (!currentPlan?.items) return 0
    return currentPlan.items
      .filter((i) => (i.date ? i.date.startsWith(selectedDateStr) : true))
      .reduce((acc, item) => {
        return acc + (item.foodItem?.caloriesKcal || 0) * (item.servingCount || 1)
      }, 0)
  }

  // Get calories target from plan or fallback to default
  const caloriesTarget = currentPlan?.caloriesTargetKcal || DAILY_CALORIE_LIMIT
  const totalCalories = calculateTotalCalories()
  const isOverLimit = totalCalories > caloriesTarget

  // Check if date is in the past
  const isPastDate = (dateStr: string) => {
    // Get today's date in YYYY-MM-DD format (local timezone)
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const todayStr = `${year}-${month}-${day}`

    // Simple string comparison (YYYY-MM-DD format)
    return dateStr < todayStr
  }

  // Actions
  const handleAddFoodClick = (mealType: string) => {
    setActiveMealType(mealType)
    setShowSearch(true)
    setSearchQuery('')
  }

  const handleAddFood = async (food: FoodItem) => {
    // If updating existing item
    if (updatingItemId) {
      await handleUpdateItem(updatingItemId, food.id)
      setUpdatingItemId(null)
      return
    }

    const executeAdd = async () => {
      // Keep native prompt for now as custom input modal requires more work
      // If user wants full custom UI, we'd need a new Modal type 'input'
      const qtyStr = prompt(`Nhập số lượng cho ${food.name}:`, '1')
      if (qtyStr === null) return
      const servingCount = parseFloat(qtyStr) || 1

      let targetPlanId = currentPlan?.id

      if (!targetPlanId) {
        // Create plan on the fly
        try {
          const res = await createNutritionPlan({
            title: `Daily Log ${selectedDateStr}`,
            startDate: selectedDateStr,
            endDate: selectedDateStr,
            visibility: 'private',
            caloriesTargetKcal: 2000
          })
          if (res.success && res.data) {
            targetPlanId = res.data.id
            setPlans((prev) => [res.data!, ...prev])
          } else {
            return
          }
        } catch {
          showAlert('Lỗi', 'Failed to create daily plan')
          return
        }
      }

      if (targetPlanId) {
        try {
          console.log('Sending date:', selectedDateStr)
          await addItemToPlan(targetPlanId, {
            date: selectedDateStr,
            mealTime: activeMealType,
            foodItemId: food.id,
            servingCount: servingCount
          })
          loadPlans()
          setShowSearch(false)
          setSearchQuery('')
        } catch (error: any) {
          showAlert('Lỗi', error.message || 'Failed to add item')
        }
      }
    }

    // Check limit
    const foodCals = food.caloriesKcal || 0
    const limit = currentPlan?.caloriesTargetKcal || 2500
    if (totalCalories + foodCals > limit) {
      showConfirm(
        'Cảnh báo Calorie',
        `Thêm món này sẽ vượt quá giới hạn ${limit} kcal/ngày. Bạn có muốn tiếp tục?`,
        executeAdd
      )
    } else {
      executeAdd()
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    if (!currentPlan) return

    // Check if past date
    if (isPastDate(selectedDateStr)) {
      showAlert('Lỗi', 'Không thể xóa món ăn của ngày đã qua')
      return
    }

    showConfirm('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa món này khỏi thực đơn?', async () => {
      try {
        await removeItemFromPlan(currentPlan.id, itemId)
        loadPlans()
        if (selectedItem?.id === itemId) setSelectedItem(null)
      } catch (error: any) {
        showAlert('Lỗi', error.message || 'Failed to remove')
      }
    })
  }

  const handleToggleComplete = async (item: NutritionPlanItem) => {
    if (!currentPlan) return
    try {
      await markItemCompleted(currentPlan.id, item.id, !item.isCompleted)
      loadPlans()
    } catch {
      showAlert('Lỗi', 'Failed to update status')
    }
  }

  const handleUpdateItem = async (itemId: string, newFoodItemId: string) => {
    if (!currentPlan) return

    // Check if past date
    // Validation: Cannot update past dates
    if (isPastDate(selectedDateStr)) {
      showAlert('Lỗi', 'Không thể cập nhật món ăn của ngày đã qua')
      return
    }

    try {
      setLoading(true)
      // If we have a new food ID, we use it. Otherwise keep old one?
      // Logic: UpdateNutritionPlanItemRequestDTO needs NewFoodItemId if replacing.
      const res = await updateNutritionPlanItem(currentPlan.id, itemId, newFoodItemId)

      if (res.success) {
        loadPlans()
        setShowSearch(false)
        setUpdatingItemId(null)
        // showAlert('Thành công', 'Đã cập nhật món ăn!') // Optional success message, skipping for speed
      } else {
        showAlert('Lỗi', res.message || 'Failed to update item')
      }
    } catch (error: any) {
      showAlert('Lỗi', error.message || 'Failed to update item')
    } finally {
      setLoading(false)
    }
  }

  const handleDayClick = (dateStr: string) => {
    setSelectedDateStr(dateStr)
    setShowDayDetail(true)
    setActiveTab('morning')
    setSelectedItem(null)
  }

  const getFoodImagePath = (foodName: string) => {
    // Use exact food name as filename (images have spaces and proper casing)
    const filename = `${foodName}.jpg`
    return `/nutrition_images/${filename}`
  }

  const handleGenerate = async () => {
    let targetPlanId = currentPlan?.id

    // Auto-create weekly plan if not exists (uses BMI record for calories)
    if (!targetPlanId) {
      try {
        const res = await createWeeklyNutritionPlan(selectedDateStr)
        if (res.success && res.data) {
          targetPlanId = res.data.id
          setPlans((prev) => [res.data!, ...prev])
          showAlert(
            'Thành công',
            `Đã tạo kế hoạch tuần với mục tiêu ${res.data.caloriesTargetKcal} kcal/ngày từ hồ sơ sức khỏe của bạn`
          )
        } else {
          showAlert('Lỗi', res.message || 'Không thể tạo nutrition plan')
          return
        }
      } catch (error: any) {
        showAlert('Lỗi', error.message || 'Lỗi: Vui lòng cập nhật thông số sức khỏe (BMI Record) trước')
        return
      }
    }

    // If a plan exists (or was just created), proceed with daily generation confirmation
    if (targetPlanId) {
      showConfirm(
        'Tự động gợi ý',
        `Tạo thực đơn tự động cho ngày ${selectedDateStr.split('-').reverse().join('/')}?`,
        async () => {
          try {
            setLoading(true)
            console.log('🔍 Frontend generating for date:', selectedDateStr)
            const res = await generateDailyMealPlan(
              targetPlanId!,
              selectedDateStr, // API will handle T12:00:00
              currentPlan?.caloriesTargetKcal || 2000
            )
            if (res.success) {
              loadPlans()
              showAlert('Thành công', 'Đã tạo thực đơn tự động!')
              setSelectedItem(null)
            } else {
              showAlert('Lỗi', res.message || 'Failed to generate meal plan')
            }
          } catch (error: any) {
            showAlert('Lỗi', error.message || 'Failed to generate meal plan')
          } finally {
            setLoading(false)
          }
        }
      )
    }
  }

  // Helper: Check if day is in the past
  const isPastDay = (dateStr: string) => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const todayStr = `${year}-${month}-${day}`

    return dateStr < todayStr
  }

  // Helper: Get day status for past days
  const getDayStatus = (dateStr: string) => {
    if (!isPastDay(dateStr)) return null

    const dayPlan = plans.find((p) => p.items.some((i) => i.date?.startsWith(dateStr)))
    const dayItems = dayPlan?.items.filter((i) => i.date?.startsWith(dateStr)) || []

    if (dayItems.length === 0) {
      return 'skipped' // No items = skipped
    }

    const allCompleted = dayItems.every((i) => i.isCompleted)
    return allCompleted ? 'completed' : 'partial'
  }

  return (
    <div className='nutrition-container'>
      {/* Top Calendar Strip */}
      <div className='calendar-strip'>
        <div className='calendar-left'>
          <h2 className='strip-month'>{currentMonth}</h2>
          <span className='strip-year'>{currentYear}</span>
        </div>

        <div className='calendar-center'>
          <div className='days-row'>
            {weekDays.map((d) => {
              // Fix timezone issue: Use local date components
              const year = d.getFullYear()
              const month = String(d.getMonth() + 1).padStart(2, '0')
              const day = String(d.getDate()).padStart(2, '0')
              const dStr = `${year}-${month}-${day}`

              const isSelected = dStr === selectedDateStr
              const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
              const dayNum = d.getDate()
              const dayStatus = getDayStatus(dStr)

              return (
                <div
                  key={dStr}
                  className={`day-column ${isSelected ? 'active' : ''} ${dayStatus ? `status-${dayStatus}` : ''}`}
                  onClick={() => handleDayClick(dStr)}
                >
                  <span className='day-label'>{dayName}</span>
                  <span className='day-value'>{dayNum}</span>
                  {dayStatus === 'skipped' && <span className='day-status-icon'>✕</span>}
                  {dayStatus === 'completed' && <span className='day-status-icon'>✓</span>}
                  {dayStatus === 'partial' && <span className='day-status-icon'>○</span>}
                </div>
              )
            })}
          </div>
        </div>

        <div className='calendar-right'>
          <div className='calories-display'>
            <span className={`cals-value ${isOverLimit ? 'over' : ''}`}>{totalCalories.toFixed(0)}</span>
            <span className='cals-label'>/ {caloriesTarget} kcal</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {showDayDetail ? (
        <div className='day-detail-view'>
          {/* 4 Tabs: Sáng, Trưa, Tối, Tổng quan */}
          <div className='tabs-container'>
            <button
              className={`tab-btn ${activeTab === 'morning' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('morning')
                setSelectedItem(null)
              }}
            >
              Sáng
            </button>
            <button
              className={`tab-btn ${activeTab === 'lunch' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('lunch')
                setSelectedItem(null)
              }}
            >
              Trưa
            </button>
            <button
              className={`tab-btn ${activeTab === 'dinner' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('dinner')
                setSelectedItem(null)
              }}
            >
              Tối
            </button>
            <button
              className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('summary')
                setSelectedItem(null)
              }}
            >
              Tổng quan
            </button>
          </div>

          {/* Tab Content */}
          {activeTab !== 'summary' ? (
            <div className='split-view'>
              {/* Left: Food List */}
              <div className='food-list-panel'>
                {/* Calorie Warning */}
                {Math.abs(totalCalories - caloriesTarget) > 300 && (
                  <div className={`calorie-warning-bar ${totalCalories > caloriesTarget ? 'danger' : 'warning'}`}>
                    <AlertTriangleIcon />
                    <span>
                      {totalCalories > caloriesTarget
                        ? `Bạn đã vượt quá mục tiêu ${(totalCalories - caloriesTarget).toFixed(0)} kcal!`
                        : `Bạn còn thiếu ${(caloriesTarget - totalCalories).toFixed(0)} kcal so với mục tiêu.`}
                    </span>
                  </div>
                )}

                {/* Main Meal Section */}
                <div className='meal-section-new'>
                  <div className='section-header'>
                    <h3>Bữa chính</h3>
                    <button className='add-btn-small' onClick={() => handleAddFoodClick(getMealTypeForTab(activeTab))}>
                      +
                    </button>
                  </div>
                  <div className='food-items-list'>
                    {getItemsForMeal(getMealTypeForTab(activeTab)).length === 0 ? (
                      <p className='empty-text'>Chưa có món ăn</p>
                    ) : (
                      getItemsForMeal(getMealTypeForTab(activeTab)).map((item) => (
                        <div
                          key={item.id}
                          className={`food-item-card ${selectedItem?.id === item.id ? 'selected' : ''}`}
                          onClick={() => setSelectedItem(item)}
                        >
                          <div className='food-item-info'>
                            <span className='food-name'>{item.foodItem?.name}</span>
                          </div>
                          <div className='item-actions'>
                            <button
                              className={`more-btn ${activeDropdownId === item.id ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveDropdownId(activeDropdownId === item.id ? null : item.id)
                              }}
                            >
                              <MoreVerticalIcon />
                            </button>

                            {activeDropdownId === item.id && (
                              <div className='dropdown-menu'>
                                <button
                                  className='dropdown-item'
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleToggleComplete(item)
                                    setActiveDropdownId(null)
                                  }}
                                >
                                  <CheckIcon />
                                  {item.isCompleted ? 'Bỏ hoàn thành' : 'Hoàn thành'}
                                </button>

                                <button
                                  className='dropdown-item'
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setUpdatingItemId(item.id)
                                    setActiveMealType(item.mealTime || 'Breakfast')
                                    setShowSearch(true)
                                    setSearchQuery('')
                                    setActiveDropdownId(null)
                                  }}
                                >
                                  <EditIcon /> Thay đổi món
                                </button>

                                <button
                                  className='dropdown-item danger'
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveItem(item.id)
                                    setActiveDropdownId(null)
                                  }}
                                >
                                  <TrashIcon /> Xóa món
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Snack Section */}
                <div className='meal-section-new'>
                  <div className='section-header'>
                    <h3>Món phụ</h3>
                    <button className='add-btn-small' onClick={() => handleAddFoodClick('Snack')}>
                      +
                    </button>
                  </div>
                  <div className='food-items-list'>
                    {getSnackItems().length === 0 ? (
                      <p className='empty-text'>Chưa có món ăn</p>
                    ) : (
                      getSnackItems().map((item) => (
                        <div
                          key={item.id}
                          className={`food-item-card ${selectedItem?.id === item.id ? 'selected' : ''}`}
                          onClick={() => setSelectedItem(item)}
                        >
                          <div className='food-item-info'>
                            <span className='food-name'>{item.foodItem?.name}</span>
                          </div>
                          <div className='item-actions'>
                            <button
                              className={`more-btn ${activeDropdownId === item.id ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveDropdownId(activeDropdownId === item.id ? null : item.id)
                              }}
                            >
                              <MoreVerticalIcon />
                            </button>

                            {activeDropdownId === item.id && (
                              <div className='dropdown-menu'>
                                <button
                                  className='dropdown-item'
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleToggleComplete(item)
                                    setActiveDropdownId(null)
                                  }}
                                >
                                  <CheckIcon />
                                  {item.isCompleted ? 'Bỏ hoàn thành' : 'Hoàn thành'}
                                </button>

                                <button
                                  className='dropdown-item'
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setUpdatingItemId(item.id)
                                    setActiveMealType(item.mealTime || 'Snack')
                                    setShowSearch(true)
                                    setSearchQuery('')
                                    setActiveDropdownId(null)
                                  }}
                                >
                                  <EditIcon /> Thay đổi món
                                </button>

                                <button
                                  className='dropdown-item danger'
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveItem(item.id)
                                    setActiveDropdownId(null)
                                  }}
                                >
                                  <TrashIcon /> Xóa món
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Food Details */}
              <div className='food-detail-panel'>
                {selectedItem ? (
                  <>
                    <h2 className='food-detail-title'>{selectedItem.foodItem?.name}</h2>

                    {/* Mini Tabs */}
                    <div className='food-detail-tabs'>
                      <button
                        className={`food-tab ${foodDetailTab === 'image' ? 'active' : ''}`}
                        onClick={() => setFoodDetailTab('image')}
                      >
                        Hình ảnh
                      </button>
                      <button
                        className={`food-tab ${foodDetailTab === 'nutrition' ? 'active' : ''}`}
                        onClick={() => setFoodDetailTab('nutrition')}
                      >
                        Dinh dưỡng
                      </button>
                    </div>

                    {/* Tab Content */}
                    {foodDetailTab === 'image' ? (
                      <div className='food-image-container'>
                        <img
                          src={getFoodImagePath(selectedItem.foodItem?.name || '')}
                          alt={selectedItem.foodItem?.name}
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = '/nutrition_images/default.jpg'
                          }}
                        />
                      </div>
                    ) : (
                      <div className='food-nutrition-info'>
                        <div className='nutrition-grid'>
                          <div className='nutrition-item'>
                            <span className='label'>Năng lượng</span>
                            <span className='value'>
                              {((selectedItem.foodItem?.caloriesKcal || 0) * (selectedItem.servingCount || 1)).toFixed(
                                0
                              )}{' '}
                              kcal
                            </span>
                          </div>
                          <div className='nutrition-item'>
                            <span className='label'>Đạm</span>
                            <span className='value'>
                              {((selectedItem.foodItem?.proteinG || 0) * (selectedItem.servingCount || 1)).toFixed(1)}g
                            </span>
                          </div>
                          <div className='nutrition-item'>
                            <span className='label'>Tinh bột</span>
                            <span className='value'>
                              {((selectedItem.foodItem?.carbsG || 0) * (selectedItem.servingCount || 1)).toFixed(1)}g
                            </span>
                          </div>
                          <div className='nutrition-item'>
                            <span className='label'>Chất béo</span>
                            <span className='value'>
                              {((selectedItem.foodItem?.fatG || 0) * (selectedItem.servingCount || 1)).toFixed(1)}g
                            </span>
                          </div>
                          <div className='nutrition-item'>
                            <span className='label'>Số lượng</span>
                            <span className='value'>{selectedItem.servingCount}x</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className='detail-actions'>
                      <button className='btn-generate' onClick={handleGenerate} disabled={loading}>
                        <DiceIcon /> {loading ? 'Đang tạo...' : 'Gợi ý'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className='no-selection'>
                    <PlateIcon />
                    <p>Chọn món ăn để xem chi tiết</p>

                    {/* Generate button when no selection */}
                    <div className='detail-actions' style={{ width: '100%', maxWidth: '300px' }}>
                      <button className='btn-generate' onClick={handleGenerate} disabled={loading}>
                        <DiceIcon /> {loading ? 'Đang tạo...' : 'Gợi ý thực đơn'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Summary Tab
            <div className='tab-content'>
              <div className='summary-cards'>
                <div className='summary-card'>
                  <h3>Tổng Calories</h3>
                  <div className='big-number'>{totalCalories.toFixed(0)} kcal</div>
                  <div className='progress-bar'>
                    <div
                      className='progress-fill'
                      style={{ width: `${Math.min((totalCalories / DAILY_CALORIE_LIMIT) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p>{DAILY_CALORIE_LIMIT} kcal mục tiêu</p>
                </div>

                <div className='summary-card'>
                  <h3>Protein</h3>
                  <div className='big-number'>
                    {currentPlan?.items
                      .filter((i) => i.date?.startsWith(selectedDateStr))
                      .reduce((acc, i) => acc + (i.foodItem?.proteinG || 0) * (i.servingCount || 1), 0)
                      .toFixed(1)}
                    g
                  </div>
                </div>

                <div className='summary-card'>
                  <h3>Carbs</h3>
                  <div className='big-number'>
                    {currentPlan?.items
                      .filter((i) => i.date?.startsWith(selectedDateStr))
                      .reduce((acc, i) => acc + (i.foodItem?.carbsG || 0) * (i.servingCount || 1), 0)
                      .toFixed(1)}
                    g
                  </div>
                </div>

                <div className='summary-card'>
                  <h3>Fat</h3>
                  <div className='big-number'>
                    {currentPlan?.items
                      .filter((i) => i.date?.startsWith(selectedDateStr))
                      .reduce((acc, i) => acc + (i.foodItem?.fatG || 0) * (i.servingCount || 1), 0)
                      .toFixed(1)}
                    g
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Overlay */}
          {showSearch && (
            <>
              <div className='food-search-backdrop' onClick={() => setShowSearch(false)} />
              <div className='food-search-overlay'>
                <div className='search-header'>
                  <h3>Thêm món vào {activeMealType}</h3>
                  <button className='close-btn' onClick={() => setShowSearch(false)}>
                    ✕
                  </button>
                </div>
                <input
                  className='search-input'
                  placeholder='Tìm kiếm món ăn...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <div className='food-results-list'>
                  {loading ? (
                    <p>Loading...</p>
                  ) : (
                    foodItems.map((f) => (
                      <div key={f.id} className='food-result-item' onClick={() => handleAddFood(f)}>
                        <div className='f-info'>
                          <strong>{f.name}</strong>
                          <small style={{ color: '#666' }}>{f.caloriesKcal} kcal</small>
                        </div>
                        <button className='add-btn'>+</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* Custom Modal */}
          {modalState.isOpen && (
            <div className='modal-overlay'>
              <div className='custom-modal'>
                <h3 className='modal-title'>{modalState.title}</h3>
                <p className='modal-message'>{modalState.message}</p>
                <div className='modal-actions'>
                  {modalState.type === 'confirm' ? (
                    <>
                      <button className='modal-btn secondary' onClick={closeModal}>
                        Hủy
                      </button>
                      <button
                        className='modal-btn primary'
                        onClick={() => {
                          modalState.onConfirm?.()
                          closeModal()
                        }}
                      >
                        Xác nhận
                      </button>
                    </>
                  ) : (
                    <button className='modal-btn primary' onClick={closeModal}>
                      Đóng
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className='overview-placeholder'>
          <CalendarIcon />
          <h3>Chọn một ngày để xem chi tiết</h3>
          <p>Click vào ngày trên calendar để xem thực đơn chi tiết</p>
        </div>
      )}
    </div>
  )
}

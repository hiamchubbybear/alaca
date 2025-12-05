import { useEffect, useState } from 'react'
import './NutritionPage.css'
// Mock data for staging
type NutritionPlan = {
  id: string
  name: string
  description: string
  items: any[]
  macros: any
  caloriesTargetKcal: number
}

export function NutritionPage() {
  const [plans, setPlans] = useState<NutritionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan] = useState<NutritionPlan | null>(null)

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      // Mock data - no API calls
      setPlans([])
    } catch (err) {
      setError('Không thể tải kế hoạch dinh dưỡng')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const parseMacros = (macrosString: string) => {
    try {
      return JSON.parse(macrosString)
    } catch {
      return { protein: 0, carbs: 0, fat: 0 }
    }
  }

  if (loading) {
    return (
      <div className="section-page">
        <div className="loading-state">Đang tải kế hoạch dinh dưỡng...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="section-page">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={loadPlans} className="btn-primary">Thử lại</button>
        </div>
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <div className="section-page">
        <h1 className="main-content-title">Kế Hoạch Dinh Dưỡng</h1>
        <div className="empty-state">
          <h2>Chưa Có Kế Hoạch Dinh Dưỡng</h2>
          <p>Tạo kế hoạch dinh dưỡng đầu tiên để bắt đầu theo dõi bữa ăn và dinh dưỡng</p>
          <button className="btn-primary">Tạo Kế Hoạch</button>
        </div>
      </div>
    )
  }

  const macros = selectedPlan ? parseMacros(selectedPlan.macros) : { protein: 0, carbs: 0, fat: 0 }

  return (
    <div className="section-page">
      <div className="section-header">
        <h1 className="main-content-title">Kế Hoạch Dinh Dưỡng</h1>
        <button className="btn-primary">Tạo Kế Hoạch Mới</button>
      </div>

      <div className="nutrition-grid">
        {/* Calorie Card */}
        <div className="nutrition-card">
          <h2>Calo Hàng Ngày</h2>
          <div className="calorie-display">
            <span className="calorie-number">{selectedPlan?.caloriesTargetKcal || 0}</span>
            <span className="calorie-unit">kcal</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '0%' }}></div>
          </div>
          <p className="progress-text">0 / {selectedPlan?.caloriesTargetKcal || 0} kcal hôm nay</p>
        </div>

        {/* Macros Card */}
        <div className="nutrition-card">
          <h2>Dinh Dưỡng Đa Lượng</h2>
          <div className="macro-list">
            <div className="macro-item">
              <span className="macro-label">Protein</span>
              <span className="macro-value">{macros.protein}g</span>
            </div>
            <div className="macro-item">
              <span className="macro-label">Carbs</span>
              <span className="macro-value">{macros.carbs}g</span>
            </div>
            <div className="macro-item">
              <span className="macro-label">Chất Béo</span>
              <span className="macro-value">{macros.fat}g</span>
            </div>
          </div>
        </div>

        {/* Meals Card */}
        <div className="nutrition-card full-width">
          <div className="card-header">
            <h2>Bữa Ăn Hôm Nay</h2>
            <button className="btn-secondary">Thêm Món Ăn</button>
          </div>
          {selectedPlan?.items && selectedPlan.items.length > 0 ? (
            <div className="meal-list">
              {selectedPlan.items.map((item: any) => (
                <div key={item.id} className="meal-item">
                  <div className="meal-info">
                    <span className="meal-time">{item.mealTime}</span>
                    <span className="meal-name">{item.foodItemName}</span>
                  </div>
                  <span className="meal-serving">{item.servingCount}x</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-text">Chưa có bữa ăn nào được ghi nhận</p>
          )}
        </div>
      </div>
    </div>
  )
}

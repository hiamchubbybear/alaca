export interface FoodItem {
  id: string
  name: string
  servingSize?: string
  servingAmount?: number
  caloriesKcal?: number
  proteinG?: number
  carbsG?: number
  fatG?: number
  fiberG?: number
  sodiumMg?: number
  category?: string
  imageUrl?: string // Placeholder for future if needed
}

export interface NutritionPlanItem {
  id: string
  mealTime?: string
  foodItemId: string
  foodItemName?: string
  foodItem: FoodItem
  servingCount?: number
  notes?: string
  date?: string
  isCompleted?: boolean
}

export interface NutritionPlan {
  id: string
  ownerUserId: string
  title: string
  description?: string
  startDate?: string
  endDate?: string
  visibility?: string
  caloriesTargetKcal?: number
  items: NutritionPlanItem[]
  // Helper props computed possibly or from backend
  totalCalories?: number
  totalProtein?: number
  totalCarbs?: number
  totalFat?: number
}

// Matching backend Paginated responses
export interface PaginatedFoodItems {
  foodItems: FoodItem[]
  total: number
  page: number
  pageSize: number
}

export interface PaginatedNutritionPlans {
  plans: NutritionPlan[]
  total: number
  page: number
  pageSize: number
}

export interface CreateNutritionPlanRequest {
  title: string
  description?: string
  startDate?: string
  endDate?: string
  visibility?: string
  caloriesTargetKcal?: number
}

export interface AddNutritionPlanItemRequest {
  foodItemId: string
  servingCount: number
  mealTime?: string
  notes?: string
  date?: string
}

export interface NutritionSummary {
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  itemCount: number
}

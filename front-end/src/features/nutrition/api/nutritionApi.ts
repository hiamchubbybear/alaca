import { request } from '../../../shared/api/apiClient'
import type {
  AddNutritionPlanItemRequest,
  CreateNutritionPlanRequest,
  NutritionPlan,
  NutritionPlanItem,
  PaginatedFoodItems,
  PaginatedNutritionPlans
} from '../types'

// Food Items API
export async function getFoodItems(page: number = 1, pageSize: number = 20, category?: string) {
  let url = `/food-items?page=${page}&pageSize=${pageSize}`
  if (category) url += `&category=${encodeURIComponent(category)}`
  return request<never, PaginatedFoodItems>(url, {
    method: 'GET',
    auth: true
  })
}

export async function searchFoodItems(query: string, page: number = 1, pageSize: number = 20) {
  return request<never, PaginatedFoodItems>(
    `/food-items/search?query=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`,
    {
      method: 'GET',
      auth: true
    }
  )
}

// Nutrition Plans API
export async function getMyNutritionPlans(page: number = 1, pageSize: number = 20) {
  return request<never, PaginatedNutritionPlans>(`/nutrition-plans/me?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
    auth: true
  })
}

export async function getNutritionPlan(id: string) {
  return request<never, NutritionPlan>(`/nutrition-plans/${id}`, {
    method: 'GET',
    auth: true
  })
}

export async function createNutritionPlan(data: CreateNutritionPlanRequest) {
  return request<CreateNutritionPlanRequest, NutritionPlan>('/nutrition-plans', {
    method: 'POST',
    body: data,
    auth: true
  })
}

export async function addItemToPlan(planId: string, data: AddNutritionPlanItemRequest) {
  // Add noon time to avoid timezone issues if date is provided
  const payload = { ...data }
  if (payload.date && !payload.date.includes('T')) {
    payload.date = `${payload.date}T12:00:00`
  }

  return request<AddNutritionPlanItemRequest, NutritionPlanItem>(`/nutrition-plans/${planId}/items`, {
    method: 'POST',
    body: payload,
    auth: true
  })
}

export async function removeItemFromPlan(planId: string, itemId: string) {
  return request<never, boolean>(`/nutrition-plans/${planId}/items/${itemId}`, {
    method: 'DELETE',
    auth: true
  })
}

export async function generateDailyMealPlan(planId: string, date: string, caloriesTarget?: number) {
  // Add noon time to avoid timezone issues (backend will use .Date anyway)
  const dateWithTime = `${date}T12:00:00`
  return request<{ date: string; caloriesTarget?: number }, NutritionPlan>(
    `/nutrition-plans/${planId}/generate-daily`,
    {
      method: 'POST',
      body: { date: dateWithTime, caloriesTarget },
      auth: true
    }
  )
}

export async function markItemCompleted(planId: string, itemId: string, isCompleted: boolean) {
  return request<{ isCompleted: boolean }, NutritionPlanItem>(`/nutrition-plans/${planId}/items/${itemId}/complete`, {
    method: 'PATCH',
    body: { isCompleted },
    auth: true
  })
}

export async function createWeeklyNutritionPlan(weekStartDate: string) {
  // Add noon time to avoid timezone issues
  const dateWithTime = `${weekStartDate}T12:00:00`
  return request<{ weekStartDate: string }, NutritionPlan>('/nutrition-plans/weekly', {
    method: 'POST',
    body: { weekStartDate: dateWithTime },
    auth: true
  })
}

export async function updateNutritionPlanItem(
  planId: string,
  itemId: string,
  newFoodItemId: string,
  servingCount?: number,
  notes?: string
) {
  return request<{ newFoodItemId: string; servingCount?: number; notes?: string }, NutritionPlanItem>(
    `/nutrition-plans/${planId}/items/${itemId}`,
    {
      method: 'PUT',
      body: { newFoodItemId, servingCount, notes },
      auth: true
    }
  )
}

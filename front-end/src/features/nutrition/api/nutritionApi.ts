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
  return request<AddNutritionPlanItemRequest, NutritionPlanItem>(`/nutrition-plans/${planId}/items`, {
    method: 'POST',
    body: data,
    auth: true
  })
}

export async function removeItemFromPlan(planId: string, itemId: string) {
  return request<never, boolean>(`/nutrition-plans/${planId}/items/${itemId}`, {
    method: 'DELETE',
    auth: true
  })
}

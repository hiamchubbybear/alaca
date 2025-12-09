import { request } from '../../shared/api/apiClient'

// Food Items APIs
export const getAllFoods = async (page: number, pageSize: number, category?: string) => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  })

  if (category && category !== 'all') {
    params.append('category', category)
  }

  return request<never, { foodItems: any[]; total: number }>(`/food-items?${params.toString()}`, {
    method: 'GET',
    auth: true
  })
}

export const getFoodById = async (id: string) => {
  return request<never, any>(`/food-items/${id}`, {
    method: 'GET',
    auth: true
  })
}

export const createFood = async (data: any) => {
  return request<any, any>('/food-items', {
    method: 'POST',
    auth: true,
    body: data
  })
}

export const updateFood = async (id: string, data: any) => {
  return request<any, any>(`/food-items/${id}`, {
    method: 'PUT',
    auth: true,
    body: data
  })
}

export const deleteFood = async (id: string) => {
  return request<never, boolean>(`/food-items/${id}`, {
    method: 'DELETE',
    auth: true
  })
}

export const searchFoods = async (query: string, page: number, pageSize: number) => {
  return request<never, { foodItems: any[]; total: number }>(
    `/food-items/search?query=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`,
    {
      method: 'GET',
      auth: true
    }
  )
}

// Nutrition Plans APIs
export const getMyNutritionPlans = async (page: number, pageSize: number) => {
  return request<never, any[]>(`/nutrition-plans/me?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
    auth: true
  })
}

export const getNutritionPlan = async (id: string) => {
  return request<never, any>(`/nutrition-plans/${id}`, {
    method: 'GET',
    auth: true
  })
}

export const createNutritionPlan = async (data: any) => {
  return request<any, any>('/nutrition-plans', {
    method: 'POST',
    auth: true,
    body: data
  })
}

export const updateNutritionPlan = async (id: string, data: any) => {
  return request<any, any>(`/nutrition-plans/${id}`, {
    method: 'PUT',
    auth: true,
    body: data
  })
}

export const deletePlan = async (id: string) => {
  return request<never, boolean>(`/nutrition-plans/${id}`, {
    method: 'DELETE',
    auth: true
  })
}

export const addItemToPlan = async (planId: string, data: any) => {
  return request<any, any>(`/nutrition-plans/${planId}/items`, {
    method: 'POST',
    auth: true,
    body: data
  })
}

export const updatePlanItem = async (planId: string, itemId: string, data: any) => {
  return request<any, any>(`/nutrition-plans/${planId}/items/${itemId}`, {
    method: 'PUT',
    auth: true,
    body: data
  })
}

export const removeItemFromPlan = async (planId: string, itemId: string) => {
  return request<never, boolean>(`/nutrition-plans/${planId}/items/${itemId}`, {
    method: 'DELETE',
    auth: true
  })
}

export const getPlanSummary = async (id: string) => {
  return request<never, any>(`/nutrition-plans/${id}/summary`, {
    method: 'GET',
    auth: true
  })
}

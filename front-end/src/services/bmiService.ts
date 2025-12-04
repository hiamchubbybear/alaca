import type { ApiResponse, BmiCalculateRequest, BmiCalculateResponse, BmiRecordResponse } from '../shared/types/api'
import { apiRequest } from './api'

/**
 * Calculate BMI
 * POST /bmi/calculate
 */
export async function calculateBmi(heightCm: number, weightKg: number): Promise<ApiResponse<BmiCalculateResponse>> {
  return apiRequest<BmiCalculateResponse>('POST', '/bmi/calculate', {
    heightCm,
    weightKg
  } as BmiCalculateRequest)
}

/**
 * Get current user's BMI record
 * GET /bmi/me
 */
export async function getBmiRecord(): Promise<ApiResponse<BmiRecordResponse>> {
  return apiRequest<BmiRecordResponse>('GET', '/bmi/me')
}

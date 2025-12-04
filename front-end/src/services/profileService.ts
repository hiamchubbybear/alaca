import type { ApiResponse, ProfileData } from '../shared/types/api'
import { apiRequest } from './api'

/**
 * Get current user's profile
 * GET /profile/me
 */
export async function getProfile(): Promise<ApiResponse<ProfileData>> {
  return apiRequest<ProfileData>('GET', '/profile/me')
}

/**
 * Update user profile
 * PUT /profile/update
 */
export async function updateProfile(data: Partial<ProfileData>): Promise<ApiResponse<ProfileData>> {
  return apiRequest<ProfileData>('PUT', '/profile/update', data)
}

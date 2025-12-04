import { request } from '../../../shared/api/apiClient'

export type ProfileResponse = {
  id: string
  userId: string
  displayName: string
  avatarUrl?: string
  birthDate?: string
  gender?: string
  bio?: string
}

export async function getProfile() {
  // Backend route is [Route("profile")] + [HttpGet], so the URL is /profile
  return request<undefined, ProfileResponse>('/profile', {
    method: 'GET',
    auth: true
  })
}

export type UpdateProfileRequest = {
  displayName: string
  avatarUrl: string
  birthDate: string
  gender: string
  bio: string
}

export async function updateProfile(body: UpdateProfileRequest) {
  // Maps to UpdateProfileRequestDto on the backend
  return request<UpdateProfileRequest, ProfileResponse>('/profile', {
    method: 'PUT',
    body,
    auth: true
  })
}



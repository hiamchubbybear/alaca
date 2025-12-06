export const API_BASE_URL = 'https://alaca.onrender.com'
// export const API_BASE_URL = 'http://localhost:5000'

export type ApiResponse<TData = unknown> = {
  success: boolean
  message?: string
  data?: TData
  statusCode?: number
}

export type LoginResponse = {
  accessToken: string
  refreshToken: string
  userId: string
  profileId: string
  email: string
  role: string
}

export type RegisterResponse = {
  userId: string
  username: string
  email: string
}

export type ProfileData = {
  profileId: string
  userId: string
  displayName: string
  avatarUrl?: string
  birthDate?: string
  gender?: string
  bio?: string
}

export type BmiCalculateRequest = {
  heightCm: number
  weightKg: number
}

export type BmiCalculateResponse = {
  bmi: number
  assessment: string
  heightCm: number
  weightKg: number
}

export type BmiRecordResponse = {
  id: string
  userId: string
  heightCm: number
  weightKg: number
  bmi: number
  assessment: string
  createdAt: string
  updatedAt: string
}

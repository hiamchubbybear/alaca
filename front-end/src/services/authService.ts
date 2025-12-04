import type { ApiResponse, LoginResponse, RegisterResponse } from '../shared/types/api'
import { apiRequest } from './api'

/**
 * Login user
 * POST /account/login
 */
export async function login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
  return apiRequest<LoginResponse>('POST', '/auth/login', { email, password })
}

/**
 * Register new user
 * POST /account/register
 */
export async function register(
  username: string,
  email: string,
  password: string,
  phoneNumber = ''
): Promise<ApiResponse<RegisterResponse>> {
  return apiRequest<RegisterResponse>('POST', '/account', {
    username,
    email,
    password,
    phoneNumber
  })
}

/**
 * Save access token to localStorage
 */
export function saveToken(token: string): void {
  localStorage.setItem('accessToken', token)
}

/**
 * Remove access token from localStorage
 */
export function clearToken(): void {
  localStorage.removeItem('accessToken')
}

/**
 * Get access token from localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem('accessToken')
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getToken()
}

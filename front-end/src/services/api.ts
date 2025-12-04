import axios, { type AxiosError, type AxiosInstance } from 'axios'
import { API_BASE_URL, type ApiResponse } from '../shared/types/api'

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('accessToken')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// Generic request wrapper
export async function apiRequest<TData = unknown>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  data?: unknown
): Promise<ApiResponse<TData>> {
  try {
    const response = await api.request<ApiResponse<TData>>({
      method,
      url: path,
      data
    })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<TData>
    }
    return {
      success: false,
      message: 'Network error. Please try again.',
      statusCode: 500
    }
  }
}

export default api

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

import NProgress from 'nprogress'

export type ApiResponse<TData = unknown> = {
  success: boolean
  message?: string
  data?: TData
  statusCode?: number
}

export async function request<TReq, TRes>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    body?: TReq
    auth?: boolean
  } = {}
): Promise<ApiResponse<TRes>> {
  const { method = 'POST', body, auth = false } = options

  // Start progress bar
  NProgress.start()

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }

    if (auth) {
      const token = localStorage.getItem('accessToken')
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    })

    // In case backend returns non-JSON on error
    let data: ApiResponse<TRes>
    try {
      const text = await res.text()
      if (!text) {
        data = {
          success: false,
          message: `Empty response from server`,
          statusCode: res.status
        }
      } else {
        try {
          data = JSON.parse(text) as ApiResponse<TRes>
        } catch (parseError) {
          console.error('Failed to parse JSON:', text)
          data = {
            success: false,
            message: `Invalid JSON response: ${text.substring(0, 100)}`,
            statusCode: res.status
          }
        }
      }
    } catch (error) {
      console.error('Fetch error:', error)
      data = {
        success: false,
        message: res.ok ? undefined : `HTTP error ${res.status}`,
        statusCode: res.status
      }
    }

    // Complete progress bar
    NProgress.done()

    return data
  } catch (error) {
    // Complete progress bar on error
    NProgress.done()

    console.error('Request error:', error)
    return {
      success: false,
      message: 'Network error occurred',
      statusCode: 0
    }
  }
}

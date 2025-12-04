export const API_BASE_URL = 'https://alaca.onrender.com'

export type ApiResponse<TData = unknown> = {
  success: boolean
  message?: string
  data?: TData
  statusCode?: number
}

async function request<TReq, TRes>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: TReq
    auth?: boolean
  } = {}
): Promise<ApiResponse<TRes>> {
  const { method = 'POST', body, auth = false } = options

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
    data = (await res.json()) as ApiResponse<TRes>
  } catch {
    data = {
      success: false,
      message: res.ok ? undefined : `HTTP error ${res.status}`,
      statusCode: res.status
    }
  }

  return data
}

export async function login(email: string, password: string) {
  return request<{ email: string; password: string }, { accessToken: string }>(
    '/auth/login',
    {
      method: 'POST',
      body: { email, password }
    }
  )
}

export async function registerUser(
  username: string,
  email: string,
  password: string,
  phoneNumber = ''
) {
  return request<
    { username: string; email: string; password: string; phoneNumber: string },
    { userId: string; username: string; email: string }
  >('/account', {
    method: 'POST',
    body: { username, email, password, phoneNumber }
  })
}

export type ProfileResponse = {
  profileId: string
  userId: string
  displayName: string
  avatarUrl?: string
}

export async function getProfile() {
  return request<undefined, ProfileResponse>('/profile/me', {
    method: 'GET',
    auth: true
  })
}



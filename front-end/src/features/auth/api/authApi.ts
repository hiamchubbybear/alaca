import { request } from '../../../shared/api/apiClient'

export async function login(email: string, password: string) {
  // Backend returns: { success, message, data: { token, refreshToken }, ... }
  // We model the important part (token) here.
  return request<{ email: string; password: string }, { token: string }>(
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



import { request } from './apiClient'

export type ChangePasswordRequest = {
  currentPassword: string
  newPassword: string
}

export const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
  await request<string, boolean>('/account/password', {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

export type ForgotPasswordRequest = {
  email: string
}

export const forgotPassword = async (email: string): Promise<void> => {
  await request<string, object>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ Email: email })
  })
}

export type ResetPasswordRequest = {
  token: string
  newPassword: string
}

export const resetPassword = async (data: ResetPasswordRequest): Promise<void> => {
  await request<string, object>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      Token: data.token,
      NewPassword: data.newPassword
    })
  })
}

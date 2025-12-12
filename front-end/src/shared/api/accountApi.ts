import { request } from './apiClient'

export type ChangePasswordRequest = {
  currentPassword: string
  newPassword: string
}

export const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
  await request<ChangePasswordRequest, boolean>('/account/password', {
    method: 'PUT',
    body: data,
    auth: true
  })
}

export type ForgotPasswordRequest = {
  email: string
}

export const forgotPassword = async (email: string): Promise<void> => {
  await request<ForgotPasswordRequest, object>('/auth/forgot-password', {
    method: 'POST',
    body: { email }
  })
}

export type ResetPasswordRequest = {
  token: string
  newPassword: string
}

export const resetPassword = async (data: ResetPasswordRequest): Promise<void> => {
  await request<{ Token: string; NewPassword: string }, object>('/auth/reset-password', {
    method: 'POST',
    body: {
      Token: data.token,
      NewPassword: data.newPassword
    }
  })
}

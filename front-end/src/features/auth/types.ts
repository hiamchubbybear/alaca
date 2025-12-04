export type AuthMode = 'login' | 'signup'

export type AuthFormData = {
  name?: string
  email: string
  password: string
  confirmPassword?: string
}

import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { googleLogin } from '../api/authApi'

type Props = {
  onSuccess: () => void
  onError: (error: string) => void
}

export function GoogleOAuthButton({ onSuccess, onError }: Props) {
  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        onError('Không nhận được thông tin từ Google')
        return
      }

      const res = await googleLogin(credentialResponse.credential)

      if (!res.success || !res.data) {
        onError(res.message || 'Đăng nhập Google thất bại')
        return
      }

      // Store the access token
      const token = (res as any).data.token as string
      localStorage.setItem('accessToken', token)

      onSuccess()
    } catch (err: any) {
      console.error('Google login error:', err)
      onError(err?.message || 'Không thể kết nối máy chủ. Vui lòng thử lại.')
    }
  }

  const handleError = () => {
    onError('Đăng nhập Google thất bại')
  }

  return (
    <div className="google-oauth-button">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        theme="outline"
        size="large"
        text="continue_with"
        locale="vi"
      />
    </div>
  )
}

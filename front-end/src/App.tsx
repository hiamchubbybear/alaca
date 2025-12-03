import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import { LoginPage } from './LoginPage'
import { SignUpPage } from './SignUpPage'

const ACCESS_TOKEN_KEY = 'accessToken'

function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(ACCESS_TOKEN_KEY))

  const login = (newToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, newToken)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    setToken(null)
  }

  return { token, login, logout, isAuthenticated: !!token }
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div className="app-shell__brand">
          <span className="app-shell__logo">A</span>
          <span className="app-shell__title">Alaca</span>
        </div>
        <button className="button button--ghost" onClick={handleLogout}>
          Log out
        </button>
      </header>
      <main className="app-shell__main">
        <section className="app-shell__hero">
          <h1>Welcome to your fitness dashboard</h1>
          <p>Login is working. You can now connect this view to workouts, nutrition plans and progress.</p>
        </section>
      </main>
    </div>
  )
}

function App() {
  const auth = useAuth()
  const location = useLocation()

  // If user hits /login while already logged in, push them to home
  useEffect(() => {
    if (auth.isAuthenticated && location.pathname === '/login') {
      // eslint-disable-next-line no-console
      console.debug('Already authenticated, redirecting to home')
    }
  }, [auth.isAuthenticated, location.pathname])

  return (
    <Routes>
      <Route
        path="/login"
        element={
          auth.isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <LoginPage
              onLoginSuccess={(token) => {
                auth.login(token)
              }}
            />
          )
        }
      />
      <Route path="/signup" element={auth.isAuthenticated ? <Navigate to="/" replace /> : <SignUpPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard onLogout={auth.logout} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={auth.isAuthenticated ? '/' : '/login'} replace />} />
    </Routes>
  )
}

export default App

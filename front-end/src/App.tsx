import { useEffect, useState } from "react"
import "./App.css"
// import { AdminLogin } from "./features/admin/pages/AdminLogin"
// import { AdminDashboard } from "./features/admin/pages/AdminDashboard"
import { AuthModal, type AuthMode } from "./features/auth/components/AuthModal"
import { LoggedInLayout, type MainSection } from "./features/dashboard/components/LoggedInLayout"
import { WeekStreak } from "./features/dashboard/components/WeekStreak"
import { HomePage } from "./features/landing/components/HomePage"
import { MuscleWikiPage } from "./features/muscleWiki/components/MuscleWikiPage"
import { getProfile } from "./features/profile/api/profileApi"
import { AdminAuth } from "./pages/admin/AdminAuth"
import { AdminDashboard } from "./pages/admin/AdminDashboard"
import { ResetPasswordPage } from "./pages/ResetPasswordPage"
import { BmiModal } from "./shared/components/BmiModal"
import { ChangePasswordModal } from "./shared/components/ChangePasswordModal"
import { ForgotPasswordModal } from "./shared/components/ForgotPasswordModal"
import { ProgressBar } from "./shared/components/ProgressBar"
import { logos } from "./shared/constants/logos"



function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    typeof window !== "undefined" && !!localStorage.getItem("accessToken")
  )
  const [currentPage, setCurrentPage] = useState<"home" | "muscle-wiki" | "admin-login" | "reset-password">("home")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>("login")
  const [showBmiModal, setShowBmiModal] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)
  const [mainSection, setMainSection] = useState<MainSection>("social")
  const [userName, setUserName] = useState("User")

  const handleLogoClick = () => {
    setCurrentPage("home")
    if (isLoggedIn) {
      setMainSection("social")
    }
    // Update URL
    window.history.pushState({}, '', '/')
  }

  // Check URL path on mount to handle direct navigation
  useEffect(() => {
    const path = window.location.pathname
    if (path === '/admin' || path.startsWith('/admin/')) {
      setCurrentPage('admin-login')
    } else if (path === '/reset-password' || window.location.search.includes('token=')) {
      setCurrentPage('reset-password')
    }
  }, [])

  const openLogin = () => {
    setAuthMode("login")
    setShowAuthModal(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("userRole")
    setIsLoggedIn(false)
    setCurrentPage("home")
  }

  const handleChangePassword = () => {
    setShowChangePasswordModal(true)
  }

  const handleForgotPassword = () => {
    setShowForgotPasswordModal(true)
  }

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    setCurrentPage("home")
    setMainSection("social")
  }

  useEffect(() => {
    if (!isLoggedIn) return
    ;(async () => {
      const res = await getProfile()
      if (res.success && res.data) {
        const data: any = res.data
        const nameFromProfile = data.displayName || data.DisplayName || data.username || data.userName || data.email
        setUserName(nameFromProfile || "User")
      }
    })()
  }, [isLoggedIn])

  // Check if admin logged in
  const isAdmin = typeof window !== "undefined" && localStorage.getItem("userRole") === "Admin"

  // Show admin dashboard if logged in as admin
  if (isLoggedIn && isAdmin) {
    return <AdminDashboard />
  }

  // Check if on /admin route (not logged in)
  if (typeof window !== "undefined" && window.location.pathname === "/admin") {
    return <AdminAuth />
  }

  return (
    <div className="app">
      <ProgressBar />

      {!isLoggedIn && (
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-left">
              <button type="button" className="logo-container" onClick={handleLogoClick}>
                <img src="/alaca_logo.png" alt="Alaca Logo" className="logo-image" />
              </button>
            </div>
            <div className="nav-right">
              <button type="button" className="nav-link nav-link-button" onClick={openLogin}>
                Luyện Tập Ngay
              </button>
              <button
                type="button"
                className="nav-link nav-link-button"
                onClick={() => setShowBmiModal(true)}
              >
                Tính Chỉ Số BMI
              </button>
              <a
                href="#muscle-wiki"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentPage("muscle-wiki")
                }}
              >
                Bách Khoa Cơ
              </a>
              <button className="login-btn" type="button" onClick={openLogin}>
                <svg
                  className="login-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="7"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Đăng Nhập</span>
              </button>
            </div>
          </div>
        </nav>
      )}

      {isLoggedIn && (
        <>
          <LoggedInLayout
            activeSection={mainSection}
            onSelectSection={setMainSection}
            onProfile={() => setMainSection("profile")}
            onChangePassword={handleChangePassword}
            onLogout={handleLogout}
            userName={userName}
          />
          {mainSection === 'social' && <WeekStreak />}
        </>
      )}

      {!isLoggedIn && currentPage === "muscle-wiki" && (
        <MuscleWikiPage onBack={() => setCurrentPage("home")} />
      )}

      {currentPage === "reset-password" && <ResetPasswordPage />}

      {!isLoggedIn && currentPage === "home" && <HomePage logos={logos} />}

      {showBmiModal && <BmiModal open={showBmiModal} onClose={() => setShowBmiModal(false)} />}
      {showChangePasswordModal && (
        <ChangePasswordModal
          open={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
        />
      )}
      {showForgotPasswordModal && (
        <ForgotPasswordModal
          open={showForgotPasswordModal}
          onClose={() => setShowForgotPasswordModal(false)}
        />
      )}

      <AuthModal
        open={showAuthModal}
        mode={authMode}
        onModeChange={setAuthMode}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
        onForgotPassword={handleForgotPassword}
      />
    </div>
  )
}

export default App

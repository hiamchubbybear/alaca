import { useEffect, useState } from "react"
import { AuthModal, type AuthMode } from "./components/AuthModal"
import { BmiModal } from "./components/BmiModal"
import { HomePage } from "./components/HomePage"
import { LoggedInLayout, type MainSection } from "./components/LoggedInLayout"
import { MuscleWikiPage } from "./components/MuscleWikiPage"
import { logos } from "./constants/logos"
import { getProfile } from "./apiClient"
import "./App.css"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    typeof window !== "undefined" && !!localStorage.getItem("accessToken")
  )
  const [currentPage, setCurrentPage] = useState<"home" | "muscle-wiki">("home")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>("login")
  const [showBmiModal, setShowBmiModal] = useState(false)
  const [mainSection, setMainSection] = useState<MainSection>("training")
  const [userName, setUserName] = useState("User")

  const handleLogoClick = () => {
    setCurrentPage("home")
    if (isLoggedIn) {
      setMainSection("training")
    }
  }

  const openLogin = () => {
    setAuthMode("login")
    setShowAuthModal(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("accessToken")
    setIsLoggedIn(false)
    setCurrentPage("home")
  }

  useEffect(() => {
    if (!isLoggedIn) return
    ;(async () => {
      const res = await getProfile()
      if (res.success && res.data) {
        setUserName(res.data.displayName || "User")
      }
    })()
  }, [isLoggedIn])

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <button type="button" className="logo-container" onClick={handleLogoClick}>
              <img src="/alaca_logo.png" alt="Alaca Logo" className="logo-image" />
            </button>
          </div>
          <div className="nav-right">
            {!isLoggedIn && (
              <>
                <button type="button" className="nav-link nav-link-button" onClick={openLogin}>
                  Training Now
                </button>
                <button
                  type="button"
                  className="nav-link nav-link-button"
                  onClick={() => setShowBmiModal(true)}
                >
                  Calculate your BMI
                </button>
            <a 
              href="#muscle-wiki" 
              className="nav-link"
              onClick={(e) => {
                e.preventDefault()
                    setCurrentPage("muscle-wiki")
              }}
            >
              Muscle Wiki
            </a>
                <button className="login-btn" type="button" onClick={openLogin}>
                <svg className="login-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                <span>Login</span>
              </button>
              </>
            )}
          </div>
      </div>
      </nav>

      {isLoggedIn && (
        <LoggedInLayout
          activeSection={mainSection}
          onSelectSection={setMainSection}
          onProfile={() => setMainSection("training")}
          onLogout={handleLogout}
          userName={userName}
        />
      )}

      {!isLoggedIn && currentPage === "muscle-wiki" && (
        <MuscleWikiPage onBack={() => setCurrentPage("home")} />
      )}

      {!isLoggedIn && currentPage === "home" && <HomePage logos={logos} />}

      {showBmiModal && <BmiModal open={showBmiModal} onClose={() => setShowBmiModal(false)} />}

      <AuthModal
        open={showAuthModal}
        mode={authMode}
        onModeChange={setAuthMode}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={() => {
          setIsLoggedIn(true)
          setCurrentPage("home")
        }}
      />
    </div>
  )
}

export default App

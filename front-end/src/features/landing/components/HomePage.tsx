import { useState, useEffect } from 'react'
import type { LogoItem } from '../../../shared/constants/logos'

type Props = {
  logos: LogoItem[]
}

// Hero images - bạn có thể thêm ảnh vào đây
const heroImages = [
  '/slides/slide1.jpg',
  '/slides/slide2.jpg',
  '/slides/slide3.jpg',
  '/slides/slide4.jpg',
]

export function HomePage({ logos }: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (heroImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
    }, 3000) // Chuyển ảnh mỗi 3 giây

    return () => clearInterval(interval)
  }, [])

  const goToSlide = (index: number) => {
    setCurrentImageIndex(index)
  }

  const nextSlide = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
  }

  const prevSlide = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + heroImages.length) % heroImages.length)
  }

  return (
    <>
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">Transform Your Body, Transform Your Life</h1>
            <p className="hero-description">
              Alaca is your personal fitness and nutrition companion. Get personalized workout
              plans, nutrition guidance, and track your progress all in one place. Start your
              journey to a healthier, stronger you today.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary">Get Started</button>
              <button className="btn-secondary">Learn More</button>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-carousel">
              {heroImages.length > 1 && (
                <>
                  <button
                    className="hero-carousel-arrow hero-carousel-arrow-prev"
                    onClick={prevSlide}
                    aria-label="Previous slide"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15 18L9 12L15 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    className="hero-carousel-arrow hero-carousel-arrow-next"
                    onClick={nextSlide}
                    aria-label="Next slide"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 18L15 12L9 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </>
              )}
              <div className="hero-carousel-container">
                {heroImages.map((image, index) => (
                  <div
                    key={index}
                    className={`hero-carousel-slide ${index === currentImageIndex ? 'active' : ''}`}
                  >
                    <img
                      src={image}
                      alt={`Hero image ${index + 1}`}
                      className="hero-carousel-image"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  </div>
                ))}
              </div>
              {heroImages.length > 1 && (
                <div className="hero-carousel-dots">
                  {heroImages.map((_, index) => (
                    <button
                      key={index}
                      className={`hero-carousel-dot ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => goToSlide(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="carousel-section">
        <div className="carousel-container">
          <div className="carousel-track">
            {logos.concat(logos).map((logo, index) => (
              <div key={`${logo.name}-${index}`} className="carousel-item">
                <img
                  src={logo.image}
                  alt={logo.name}
                  className="carousel-logo"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    if (target.parentElement) {
                      target.parentElement.textContent = logo.name
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tabs-section">
        <div className="tabs-container">
          <h2 className="section-title">Explore Our Features</h2>
          <div className="tabs-wrapper">
            <div className="tab-item">
              <div className="tab-image">
                <img
                  src="/feature/workout.jpg"
                  alt="Workout Plans"
                  className="tab-image-content"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              </div>
              <div>
                <h3>Workout Plans</h3>
                <p>Personalized training routines</p>
              </div>
            </div>
            <div className="tab-item">
              <div className="tab-image">
                <img
                  src="/feature/nutrition.jpg"
                  alt="Nutrition Plans"
                  className="tab-image-content"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              </div>
              <div>
                <h3>Nutrition Plans</h3>
                <p>Smart meal planning</p>
              </div>
            </div>
            <div className="tab-item">
              <div className="tab-image">
                <img
                  src="/feature/progress.jpg"
                  alt="Progress Tracking"
                  className="tab-image-content"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              </div>
              <div>
                <h3>Progress Tracking</h3>
                <p>Monitor your journey</p>
              </div>
            </div>
            <div className="tab-item">
              <div className="tab-image">
                <img
                  src="/feature/challenge.jpg"
                  alt="Challenges"
                  className="tab-image-content"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              </div>
              <div>
                <h3>Challenges</h3>
                <p>Join fitness challenges</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="slogan-section">
        <div className="slogan-container">
          <h2 className="slogan-text">Your Journey to Better Health Starts Here</h2>
          <p className="slogan-subtext">Join thousands of users achieving their fitness goals</p>
        </div>
      </section>

      <section className="email-form-section">
        <div className="email-form-container">
          <h2 className="form-title">Get Expert Advice</h2>
          <p className="form-subtitle">Subscribe to receive personalized fitness and nutrition tips</p>
          <form className="email-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <input type="email" placeholder="Enter your email address" className="email-input" required />
              <button type="submit" className="submit-btn">
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <h3 className="footer-title">Alaca</h3>
            <p className="footer-description">
              Your personal fitness and nutrition companion. Transform your body, transform your life.
            </p>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Features</h4>
            <ul className="footer-links">
              <li><a href="#workouts">Workouts</a></li>
              <li><a href="#nutrition">Nutrition Plans</a></li>
              <li><a href="#progress">Progress Tracking</a></li>
              <li><a href="#challenges">Challenges</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Resources</h4>
            <ul className="footer-links">
              <li><a href="#muscle-wiki">Muscle Wiki</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#support">Support</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Contact</h4>
            <ul className="footer-links">
              <li>Email: info@alaca.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>
                <div className="social-links">
                  <a href="#" aria-label="Facebook">
                    <img src="/social-link/fb.png" alt="Facebook" className="social-icon" />
                  </a>
                  <a href="#" aria-label="Twitter">
                    <img src="/social-link/x.png" alt="Twitter" className="social-icon" />
                  </a>
                  <a href="#" aria-label="Instagram">
                    <img src="/social-link/ig.png" alt="Instagram" className="social-icon" />
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Alaca. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}



import type { LogoItem } from '../../../shared/constants/logos'

type Props = {
  logos: LogoItem[]
}

export function HomePage({ logos }: Props) {
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
            <div className="hero-image-placeholder">
              <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="400" height="400" rx="20" fill="url(#gradient)" />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="400" y2="400">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
                <circle cx="200" cy="150" r="40" fill="white" opacity="0.3" />
                <rect x="160" y="200" width="80" height="120" rx="10" fill="white" opacity="0.3" />
                <circle cx="180" cy="190" r="15" fill="white" opacity="0.4" />
                <circle cx="220" cy="190" r="15" fill="white" opacity="0.4" />
              </svg>
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
            <div className="tab-item active">
              <div className="tab-image">
                <div className="tab-image-placeholder">
                  <svg viewBox="0 0 300 200" fill="none">
                    <rect width="300" height="200" rx="10" fill="#667eea" opacity="0.2" />
                    <circle cx="150" cy="100" r="30" fill="#667eea" />
                  </svg>
                </div>
              </div>
              <h3>Workout Plans</h3>
              <p>Personalized training routines</p>
            </div>
            <div className="tab-item">
              <div className="tab-image">
                <div className="tab-image-placeholder">
                  <svg viewBox="0 0 300 200" fill="none">
                    <rect width="300" height="200" rx="10" fill="#f093fb" opacity="0.2" />
                    <rect x="100" y="70" width="100" height="60" rx="5" fill="#f093fb" />
                  </svg>
                </div>
              </div>
              <h3>Nutrition Plans</h3>
              <p>Smart meal planning</p>
            </div>
            <div className="tab-item">
              <div className="tab-image">
                <div className="tab-image-placeholder">
                  <svg viewBox="0 0 300 200" fill="none">
                    <rect width="300" height="200" rx="10" fill="#4facfe" opacity="0.2" />
                    <path d="M150 70 L180 130 L120 130 Z" fill="#4facfe" />
                  </svg>
                </div>
              </div>
              <h3>Progress Tracking</h3>
              <p>Monitor your journey</p>
            </div>
            <div className="tab-item">
              <div className="tab-image">
                <div className="tab-image-placeholder">
                  <svg viewBox="0 0 300 200" fill="none">
                    <rect width="300" height="200" rx="10" fill="#43e97b" opacity="0.2" />
                    <circle cx="150" cy="100" r="25" fill="#43e97b" />
                    <circle cx="150" cy="100" r="15" fill="white" />
                  </svg>
                </div>
              </div>
              <h3>Challenges</h3>
              <p>Join fitness challenges</p>
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
                    FB
                  </a>
                  <a href="#" aria-label="Twitter">
                    TW
                  </a>
                  <a href="#" aria-label="Instagram">
                    IG
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Alaca. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}



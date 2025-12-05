import { useEffect, useState } from 'react'
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
            <h1 className="hero-title">Biến Đổi Cơ Thể, Biến Đổi Cuộc Sống</h1>
            <p className="hero-description">
              Alaca là người bạn đồng hành thể hình và dinh dưỡng của bạn. Nhận kế hoạch tập luyện
              cá nhân hóa, hướng dẫn dinh dưỡng và theo dõi tiến độ tất cả ở một nơi. Bắt đầu
              hành trình đến một phiên bản khỏe mạnh, mạnh mẽ hơn của bạn hôm nay.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary">Bắt Đầu</button>
              <button className="btn-secondary">Tìm Hiểu Thêm</button>
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
          <h2 className="section-title">Khám Phá Tính Năng</h2>
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
                <h3>Kế Hoạch Tập Luyện</h3>
                <p>Chương trình tập luyện cá nhân hóa</p>
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
                <h3>Kế Hoạch Dinh Dưỡng</h3>
                <p>Lập kế hoạch bữa ăn thông minh</p>
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
                <h3>Theo Dõi Tiến Độ</h3>
                <p>Giám sát hành trình của bạn</p>
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
                <h3>Thử Thách</h3>
                <p>Tham gia thử thách thể hình</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="slogan-section">
        <div className="slogan-container">
          <h2 className="slogan-text">Hành Trình Đến Sức Khỏe Tốt Hơn Bắt Đầu Từ Đây</h2>
          <p className="slogan-subtext">Tham gia cùng hàng nghìn người dùng đang đạt được mục tiêu thể hình</p>
        </div>
      </section>

      <section className="email-form-section">
        <div className="email-form-container">
          <h2 className="form-title">Nhận Tư Vấn Chuyên Gia</h2>
          <p className="form-subtitle">Đăng ký để nhận mẹo về thể hình và dinh dưỡng cá nhân hóa</p>
          <form className="email-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <input type="email" placeholder="Nhập địa chỉ email của bạn" className="email-input" required />
              <button type="submit" className="submit-btn">
                Đăng Ký
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
              Người bạn đồng hành thể hình và dinh dưỡng của bạn. Biến đổi cơ thể, biến đổi cuộc sống.
            </p>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Tính Năng</h4>
            <ul className="footer-links">
              <li><a href="#workouts">Bài Tập</a></li>
              <li><a href="#nutrition">Kế Hoạch Dinh Dưỡng</a></li>
              <li><a href="#progress">Theo Dõi Tiến Độ</a></li>
              <li><a href="#challenges">Thử Thách</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Tài Nguyên</h4>
            <ul className="footer-links">
              <li><a href="#muscle-wiki">Bách Khoa Cơ</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#faq">Câu Hỏi Thường Gặp</a></li>
              <li><a href="#support">Hỗ Trợ</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Liên Hệ</h4>
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
          <p>&copy; 2025 Alaca. Bảo lưu mọi quyền.</p>
        </div>
      </footer>
    </>
  )
}

import { useState } from 'react'
import './App.css'

// Logo images - Replace these with your actual logo image paths
// You can add logos to the public folder or src/assets folder
const logos = [
  { name: 'Jolliebee', image: '/jollibee_logo.png' }, // Replace with actual image path
  { name: 'Castrol', image: '/castrol_logo.png' },
  { name: 'T1', image: '/t1_logo.png' },
  { name: 'DTU', image: '/dtu_logo.png' },
  { name: 'Adidas', image: '/adidas_logo.png' },
  { name: 'Jordan', image: '/jordan_logo.png' },
]

// Muscle group data
const muscleGroups = {
  chest: {
    name: 'Chest',
    description: 'The chest muscles, primarily the pectoralis major and minor, are responsible for pushing movements and arm adduction.',
    functions: ['Pushing movements', 'Arm adduction', 'Shoulder flexion'],
    exercises: ['Bench Press', 'Push-ups', 'Chest Flyes', 'Dips'],
    location: 'Front upper torso'
  },
  back: {
    name: 'Back',
    description: 'The back muscles include the latissimus dorsi, rhomboids, and trapezius. They are crucial for pulling movements and posture.',
    functions: ['Pulling movements', 'Posture support', 'Shoulder retraction'],
    exercises: ['Pull-ups', 'Rows', 'Deadlifts', 'Lat Pulldowns'],
    location: 'Posterior torso'
  },
  shoulders: {
    name: 'Shoulders',
    description: 'The deltoids are the primary shoulder muscles, responsible for arm abduction, flexion, and extension.',
    functions: ['Arm abduction', 'Shoulder flexion', 'Shoulder extension'],
    exercises: ['Shoulder Press', 'Lateral Raises', 'Front Raises', 'Rear Delt Flyes'],
    location: 'Upper arm connection to torso'
  },
  biceps: {
    name: 'Biceps',
    description: 'The biceps brachii are located on the front of the upper arm and are responsible for elbow flexion and forearm supination.',
    functions: ['Elbow flexion', 'Forearm supination', 'Shoulder flexion'],
    exercises: ['Bicep Curls', 'Hammer Curls', 'Chin-ups', 'Cable Curls'],
    location: 'Front of upper arm'
  },
  triceps: {
    name: 'Triceps',
    description: 'The triceps brachii are located on the back of the upper arm and are responsible for elbow extension.',
    functions: ['Elbow extension', 'Arm extension'],
    exercises: ['Tricep Dips', 'Overhead Extension', 'Close-grip Bench Press', 'Tricep Pushdowns'],
    location: 'Back of upper arm'
  },
  abs: {
    name: 'Abdominals',
    description: 'The abdominal muscles, including the rectus abdominis and obliques, provide core stability and trunk flexion.',
    functions: ['Core stability', 'Trunk flexion', 'Rotation'],
    exercises: ['Crunches', 'Planks', 'Leg Raises', 'Russian Twists'],
    location: 'Front of torso, between chest and pelvis'
  },
  legs: {
    name: 'Legs',
    description: 'The leg muscles include quadriceps, hamstrings, glutes, and calves. They are the largest muscle group and essential for movement.',
    functions: ['Walking', 'Running', 'Jumping', 'Squatting'],
    exercises: ['Squats', 'Lunges', 'Leg Press', 'Deadlifts'],
    location: 'Lower body from hips to feet'
  },
  glutes: {
    name: 'Glutes',
    description: 'The gluteal muscles (gluteus maximus, medius, minimus) are the largest muscles in the body, responsible for hip extension and stabilization.',
    functions: ['Hip extension', 'Hip abduction', 'Posture support'],
    exercises: ['Squats', 'Hip Thrusts', 'Lunges', 'Glute Bridges'],
    location: 'Buttocks area'
  }
}

function App() {
  const [isLoggedIn] = useState(false)
  const [currentPage, setCurrentPage] = useState<'home' | 'muscle-wiki'>('home')
  const [selectedMuscle, setSelectedMuscle] = useState<keyof typeof muscleGroups | null>(null)

  return (
    <div className="app">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <div className="logo-container">
              <img 
                src="/alaca_logo.png" 
                alt="Alaca Logo" 
                className="logo-image"
              />
            </div>
          </div>
          <div className="nav-right">
            <a 
              href="#training" 
              className="nav-link"
              onClick={(e) => {
                e.preventDefault()
                setCurrentPage('home')
              }}
            >
              Training Now
            </a>
            <a 
              href="#muscle-wiki" 
              className="nav-link"
              onClick={(e) => {
                e.preventDefault()
                setCurrentPage('muscle-wiki')
              }}
            >
              Muscle Wiki
            </a>
            {!isLoggedIn && (
              <button className="login-btn">
                <svg className="login-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Login</span>
              </button>
            )}
          </div>
      </div>
      </nav>

      {/* Muscle Wiki Page */}
      {currentPage === 'muscle-wiki' && (
        <section className="muscle-wiki-page">
          <div className="muscle-wiki-container">
            <div className="muscle-wiki-header">
              <h1 className="muscle-wiki-title">Muscle Wiki</h1>
              <p className="muscle-wiki-subtitle">Click on a muscle group to learn more</p>
              <button 
                className="back-to-home-btn"
                onClick={() => {
                  setCurrentPage('home')
                  setSelectedMuscle(null)
                }}
              >
                ← Back to Home
        </button>
            </div>
            
            <div className="muscle-wiki-content">
              {/* Left: Muscle Diagram */}
              <div className="muscle-diagram-container">
                <div className="muscle-diagram">
                  <svg viewBox="0 0 400 800" className="muscle-svg">
                    {/* Body outline */}
                    <ellipse cx="200" cy="100" rx="80" ry="60" fill="#e2e8f0" stroke="#cbd5e0" strokeWidth="2"/>
                    <rect x="120" y="160" width="160" height="200" rx="20" fill="#e2e8f0" stroke="#cbd5e0" strokeWidth="2"/>
                    <rect x="140" y="360" width="60" height="180" rx="10" fill="#e2e8f0" stroke="#cbd5e0" strokeWidth="2"/>
                    <rect x="200" y="360" width="60" height="180" rx="10" fill="#e2e8f0" stroke="#cbd5e0" strokeWidth="2"/>
                    
                    {/* Chest */}
                    <ellipse 
                      cx="200" cy="180" 
                      rx="70" ry="50" 
                      fill={selectedMuscle === 'chest' ? '#667eea' : '#cbd5e0'}
                      stroke="#667eea"
                      strokeWidth="2"
                      className="muscle-area"
                      onClick={() => setSelectedMuscle('chest')}
                      style={{ cursor: 'pointer' }}
                    />
                    <text x="200" y="185" textAnchor="middle" fontSize="14" fill="#1a202c" pointerEvents="none">Chest</text>
                    
                    {/* Back */}
                    <ellipse 
                      cx="200" cy="220" 
                      rx="70" ry="60" 
                      fill={selectedMuscle === 'back' ? '#667eea' : '#cbd5e0'}
                      stroke="#667eea"
                      strokeWidth="2"
                      className="muscle-area"
                      onClick={() => setSelectedMuscle('back')}
                      style={{ cursor: 'pointer' }}
                    />
                    <text x="200" y="225" textAnchor="middle" fontSize="14" fill="#1a202c" pointerEvents="none">Back</text>
                    
                    {/* Shoulders */}
                    <ellipse 
                      cx="120" cy="160" 
                      rx="30" ry="40" 
                      fill={selectedMuscle === 'shoulders' ? '#667eea' : '#cbd5e0'}
                      stroke="#667eea"
                      strokeWidth="2"
                      className="muscle-area"
                      onClick={() => setSelectedMuscle('shoulders')}
                      style={{ cursor: 'pointer' }}
                    />
                    <ellipse 
                      cx="280" cy="160" 
                      rx="30" ry="40" 
                      fill={selectedMuscle === 'shoulders' ? '#667eea' : '#cbd5e0'}
                      stroke="#667eea"
                      strokeWidth="2"
                      className="muscle-area"
                      onClick={() => setSelectedMuscle('shoulders')}
                      style={{ cursor: 'pointer' }}
                    />
                    <text x="200" y="150" textAnchor="middle" fontSize="14" fill="#1a202c" pointerEvents="none">Shoulders</text>
                    
                    {/* Biceps */}
                    <ellipse 
                      cx="140" cy="250" 
                      rx="25" ry="60" 
                      fill={selectedMuscle === 'biceps' ? '#667eea' : '#cbd5e0'}
                      stroke="#667eea"
                      strokeWidth="2"
                      className="muscle-area"
                      onClick={() => setSelectedMuscle('biceps')}
                      style={{ cursor: 'pointer' }}
                    />
                    <ellipse 
                      cx="260" cy="250" 
                      rx="25" ry="60" 
                      fill={selectedMuscle === 'biceps' ? '#667eea' : '#cbd5e0'}
                      stroke="#667eea"
                      strokeWidth="2"
                      className="muscle-area"
                      onClick={() => setSelectedMuscle('biceps')}
                      style={{ cursor: 'pointer' }}
                    />
                    <text x="200" y="280" textAnchor="middle" fontSize="14" fill="#1a202c" pointerEvents="none">Biceps</text>
                    
                    {/* Triceps */}
                    <ellipse 
                      cx="160" cy="280" 
                      rx="20" ry="50" 
                      fill={selectedMuscle === 'triceps' ? '#667eea' : '#cbd5e0'}
                      stroke="#667eea"
                      strokeWidth="2"
                      className="muscle-area"
                      onClick={() => setSelectedMuscle('triceps')}
                      style={{ cursor: 'pointer' }}
                    />
                    <ellipse 
                      cx="240" cy="280" 
                      rx="20" ry="50" 
                      fill={selectedMuscle === 'triceps' ? '#667eea' : '#cbd5e0'}
                      stroke="#667eea"
                      strokeWidth="2"
                      className="muscle-area"
                      onClick={() => setSelectedMuscle('triceps')}
                      style={{ cursor: 'pointer' }}
                    />
                    <text x="200" y="310" textAnchor="middle" fontSize="14" fill="#1a202c" pointerEvents="none">Triceps</text>
                    
                    {/* Abs */}
                    <rect 
                      x="130" y="320" 
                      width="140" height="60" 
                      rx="10" 
                      fill={selectedMuscle === 'abs' ? '#667eea' : '#cbd5e0'}
                      stroke="#667eea"
                      strokeWidth="2"
                      className="muscle-area"
                      onClick={() => setSelectedMuscle('abs')}
                      style={{ cursor: 'pointer' }}
                    />
                    <text x="200" y="355" textAnchor="middle" fontSize="14" fill="#1a202c" pointerEvents="none">Abs</text>
                    
                    {/* Legs */}
                    <rect 
                      x="140" y="380" 
                      width="50" height="160" 
                      rx="10" 
                      fill={selectedMuscle === 'legs' ? '#667eea' : '#cbd5e0'}
                      stroke="#667eea"
                      strokeWidth="2"
                      className="muscle-area"
                      onClick={() => setSelectedMuscle('legs')}
                      style={{ cursor: 'pointer' }}
                    />
                    <rect 
                      x="210" y="380" 
                      width="50" height="160" 
                      rx="10" 
                      fill={selectedMuscle === 'legs' ? '#667eea' : '#cbd5e0'}
                      stroke="#667eea"
                      strokeWidth="2"
                      className="muscle-area"
                      onClick={() => setSelectedMuscle('legs')}
                      style={{ cursor: 'pointer' }}
                    />
                    <text x="200" y="450" textAnchor="middle" fontSize="14" fill="#1a202c" pointerEvents="none">Legs</text>
                    
                    {/* Glutes */}
                    <ellipse 
                      cx="200" cy="380" 
                      rx="60" ry="30" 
                      fill={selectedMuscle === 'glutes' ? '#667eea' : '#cbd5e0'}
                      stroke="#667eea"
                      strokeWidth="2"
                      className="muscle-area"
                      onClick={() => setSelectedMuscle('glutes')}
                      style={{ cursor: 'pointer' }}
                    />
                    <text x="200" y="385" textAnchor="middle" fontSize="14" fill="#1a202c" pointerEvents="none">Glutes</text>
                  </svg>
                </div>
              </div>
              
              {/* Right: Information Panel */}
              <div className="muscle-info-panel">
                {selectedMuscle ? (
                  <div className="muscle-info-content">
                    <h2 className="muscle-info-title">{muscleGroups[selectedMuscle].name}</h2>
                    <p className="muscle-info-description">{muscleGroups[selectedMuscle].description}</p>
                    
                    <div className="muscle-info-section">
                      <h3 className="muscle-info-heading">Location</h3>
                      <p className="muscle-info-text">{muscleGroups[selectedMuscle].location}</p>
                    </div>
                    
                    <div className="muscle-info-section">
                      <h3 className="muscle-info-heading">Functions</h3>
                      <ul className="muscle-info-list">
                        {muscleGroups[selectedMuscle].functions.map((func, index) => (
                          <li key={index}>{func}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="muscle-info-section">
                      <h3 className="muscle-info-heading">Recommended Exercises</h3>
                      <ul className="muscle-info-list">
                        {muscleGroups[selectedMuscle].exercises.map((exercise, index) => (
                          <li key={index}>{exercise}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="muscle-info-placeholder">
                    <h2 className="muscle-info-placeholder-title">Select a Muscle Group</h2>
                    <p className="muscle-info-placeholder-text">
                      Click on any muscle group in the diagram to view detailed information, 
                      including its functions, location, and recommended exercises.
        </p>
      </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Home Page Content */}
      {currentPage === 'home' && (
        <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">Transform Your Body, Transform Your Life</h1>
            <p className="hero-description">
              Alaca is your personal fitness and nutrition companion. Get personalized workout plans, 
              nutrition guidance, and track your progress all in one place. Start your journey to a 
              healthier, stronger you today.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary">Get Started</button>
              <button className="btn-secondary">Learn More</button>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-image-placeholder">
              <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="400" height="400" rx="20" fill="url(#gradient)"/>
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="400" y2="400">
                    <stop offset="0%" stopColor="#667eea"/>
                    <stop offset="100%" stopColor="#764ba2"/>
                  </linearGradient>
                </defs>
                <circle cx="200" cy="150" r="40" fill="white" opacity="0.3"/>
                <rect x="160" y="200" width="80" height="120" rx="10" fill="white" opacity="0.3"/>
                <circle cx="180" cy="190" r="15" fill="white" opacity="0.4"/>
                <circle cx="220" cy="190" r="15" fill="white" opacity="0.4"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Carousel */}
      <section className="carousel-section">
        <div className="carousel-container">
          <div className="carousel-track">
            {/* First set of logos */}
            {logos.map((logo, index) => (
              <div key={`logo-${index}`} className="carousel-item">
                <img 
                  src={logo.image} 
                  alt={logo.name}
                  className="carousel-logo"
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.textContent = logo.name;
                    }
                  }}
                />
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {logos.map((logo, index) => (
              <div key={`logo-duplicate-${index}`} className="carousel-item">
                <img 
                  src={logo.image} 
                  alt={logo.name}
                  className="carousel-logo"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.textContent = logo.name;
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Tabs Section */}
      <section className="tabs-section">
        <div className="tabs-container">
          <h2 className="section-title">Explore Our Features</h2>
          <div className="tabs-wrapper">
            <div className="tab-item active">
              <div className="tab-image">
                <div className="tab-image-placeholder">
                  <svg viewBox="0 0 300 200" fill="none">
                    <rect width="300" height="200" rx="10" fill="#667eea" opacity="0.2"/>
                    <circle cx="150" cy="100" r="30" fill="#667eea"/>
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
                    <rect width="300" height="200" rx="10" fill="#f093fb" opacity="0.2"/>
                    <rect x="100" y="70" width="100" height="60" rx="5" fill="#f093fb"/>
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
                    <rect width="300" height="200" rx="10" fill="#4facfe" opacity="0.2"/>
                    <path d="M150 70 L180 130 L120 130 Z" fill="#4facfe"/>
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
                    <rect width="300" height="200" rx="10" fill="#43e97b" opacity="0.2"/>
                    <circle cx="150" cy="100" r="25" fill="#43e97b"/>
                    <circle cx="150" cy="100" r="15" fill="white"/>
                  </svg>
                </div>
              </div>
              <h3>Challenges</h3>
              <p>Join fitness challenges</p>
            </div>
          </div>
        </div>
      </section>

      {/* Slogan Section */}
      <section className="slogan-section">
        <div className="slogan-container">
          <h2 className="slogan-text">Your Journey to Better Health Starts Here</h2>
          <p className="slogan-subtext">Join thousands of users achieving their fitness goals</p>
        </div>
      </section>

      {/* Email Form Section */}
      <section className="email-form-section">
        <div className="email-form-container">
          <h2 className="form-title">Get Expert Advice</h2>
          <p className="form-subtitle">Subscribe to receive personalized fitness and nutrition tips</p>
          <form className="email-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="email-input"
                required
              />
              <button type="submit" className="submit-btn">Subscribe</button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
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
                  <a href="#" aria-label="Facebook">FB</a>
                  <a href="#" aria-label="Twitter">TW</a>
                  <a href="#" aria-label="Instagram">IG</a>
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
      )}
    </div>
  )
}

export default App

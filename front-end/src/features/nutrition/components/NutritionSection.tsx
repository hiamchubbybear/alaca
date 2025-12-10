import { useState } from 'react'
import './NutritionSection.css'

export function NutritionSection() {
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly')
  const [selectedDate, setSelectedDate] = useState(23)
  const currentMonth = 'August'
  const currentYear = '2025'

  // Placeholder days matching the design
  const days = [
    { day: 'Tue', date: 20 },
    { day: 'Wed', date: 21 },
    { day: 'Thu', date: 22 },
    { day: 'Fri', date: 23 },
    { day: 'Sat', date: 24 },
    { day: 'Sun', date: 25 },
    { day: 'Mon', date: 26 }
  ]

  return (
    <div className='nutrition-container'>
      {/* Top Calendar Strip */}
      <div className='calendar-strip'>
        <div className='calendar-left'>
          <h2 className='strip-month'>{currentMonth}</h2>
          <span className='strip-year'>{currentYear}</span>
        </div>

        <div className='calendar-center'>
          <div className='days-row'>
            {days.map((item) => (
              <div
                key={item.date}
                className={`day-column ${item.date === selectedDate ? 'active' : ''}`}
                onClick={() => setSelectedDate(item.date)}
              >
                <span className='day-label'>{item.day}</span>
                <span className='day-value'>{item.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className='calendar-right'>
          <div className='segment-control compact'>
            <button
              className={`segment-btn ${viewMode === 'weekly' ? 'active' : ''}`}
              onClick={() => setViewMode('weekly')}
            >
              Weekly
            </button>
            <button
              className={`segment-btn ${viewMode === 'monthly' ? 'active' : ''}`}
              onClick={() => setViewMode('monthly')}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area (Placeholder for next steps) */}
      <div className='nutrition-content-placeholder'>
        <p className='placeholder-text'>Select a date to view nutrition details</p>
      </div>
    </div>
  )
}

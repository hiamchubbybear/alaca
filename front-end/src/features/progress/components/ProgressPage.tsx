import { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getMyBmiRecords, type BmiRecord } from '../../../shared/api/bmiApi'
import './ProgressPage.css'

type ProgressEntry = {
  id: string
  type: 'weight' | 'photo' | 'measurement'
  numericValue?: number
  textValue?: string
  photoUrl?: string
  recordedAt: string
}

export function ProgressPage() {
  const [entries, setEntries] = useState<ProgressEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadProgress()
  }, [])

  const loadProgress = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getMyBmiRecords()
      if (res.success && res.data && res.data.length > 0) {
        const mappedEntries: ProgressEntry[] = res.data.map((record: BmiRecord) => ({
          id: record.bmiRecordId || Math.random().toString(),
          type: 'weight',
          numericValue: record.weightKg,
          textValue: record.assessment || record.Assessment,
          recordedAt: record.recordedAt || record.RecordedAt || new Date().toISOString()
        }))

        // Sort by date ascending for chart
        mappedEntries.sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
        setEntries(mappedEntries)
      } else {
        setEntries([])
      }
    } catch (err) {
      setError('Không thể tải tiến độ')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const weightEntries = entries.filter((e) => e.type === 'weight')
  // const photoEntries = entries.filter(e => e.type === 'photo')

  // Prepare data for chart
  const chartData = weightEntries.map((e) => ({
    date: e.recordedAt,
    weight: e.numericValue
  }))

  if (loading) {
    return (
      <div className='section-page'>
        <div className='loading-state'>Đang tải tiến độ...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='section-page'>
        <div className='error-state'>
          <p>{error}</p>
          <button onClick={loadProgress} className='btn-primary'>
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='section-page'>
      <div className='section-header'>
        <h1 className='main-content-title'>Tiến Độ Của Bạn</h1>
        {/* <button className="btn-primary">Ghi Nhận Tiến Độ</button> */}
      </div>

      <div className='progress-filters'>
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          Tất cả
        </button>
        <button className={`filter-btn ${filter === 'weight' ? 'active' : ''}`} onClick={() => setFilter('weight')}>
          Cân nặng
        </button>
        {/* <button
          className={`filter-btn ${filter === 'photo' ? 'active' : ''}`}
          onClick={() => setFilter('photo')}
        >
          Hình ảnh
        </button> */}
      </div>

      {entries.length === 0 ? (
        <div className='empty-state'>
          <h2>Chưa Có Dữ Liệu Tiến Độ</h2>
          <p>Hãy cập nhật chỉ số sức khoẻ trong phần "Sức khoẻ" để bắt đầu theo dõi.</p>
        </div>
      ) : (
        <div className='progress-grid'>
          {/* Weight Chart */}
          {(filter === 'all' || filter === 'weight') && weightEntries.length > 0 && (
            <div className='progress-card full-width'>
              <h2>Biểu Đồ Cân Nặng</h2>
              <div className='weight-chart' style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id='colorWeight' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#667eea' stopOpacity={0.8} />
                        <stop offset='95%' stopColor='#667eea' stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#E2E8F0' />
                    <XAxis
                      dataKey='date'
                      tickFormatter={(date) =>
                        new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
                      }
                      stroke='#718096'
                      tickLine={false}
                      axisLine={false}
                      minTickGap={30}
                    />
                    <YAxis domain={['auto', 'auto']} stroke='#718096' tickLine={false} axisLine={false} unit='kg' />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                      labelFormatter={(label) => new Date(label).toLocaleDateString('vi-VN')}
                      formatter={(value: any) => [`${value} kg`, 'Cân nặng']}
                    />
                    <Area
                      type='monotone'
                      dataKey='weight'
                      stroke='#667eea'
                      strokeWidth={3}
                      fillOpacity={1}
                      fill='url(#colorWeight)'
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Progress Photos - Hidden for now as we don't have API */}
          {filter === 'photo' && (
            <div className='empty-state'>
              <p>Tính năng theo dõi hình ảnh đang được phát triển.</p>
            </div>
          )}

          {/* All Entries List */}
          <div className='progress-card full-width'>
            <h2>Lịch Sử Ghi Nhận</h2>
            <div className='entry-list'>
              {[...entries].reverse().map((entry) => (
                <div key={entry.id} className='entry-item'>
                  <div className='entry-info'>
                    <span className='entry-type'>{entry.type === 'weight' ? 'Cân nặng' : 'Khác'}</span>
                    <span className='entry-date'>
                      {new Date(entry.recordedAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className='entry-value'>
                    {entry.numericValue && `${entry.numericValue} kg`}
                    {entry.textValue && (
                      <span style={{ fontSize: '0.8rem', color: '#718096', marginLeft: '0.5rem' }}>
                        ({entry.textValue})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

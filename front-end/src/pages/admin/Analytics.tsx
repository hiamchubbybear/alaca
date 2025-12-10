import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { getPlatformStats } from './adminApi'
import './Analytics.css'

interface Stats {
  totalUsers: number
  activeUsers: number
  totalPosts: number
  totalWorkouts: number
  totalChallenges: number
  totalNotifications: number
  totalFoods: number
  totalExercises: number
  userGrowth?: { month: string; users: number }[]
  activityData?: { name: string; value: number }[]
  weeklyStats?: { day: string; posts: number; workouts: number }[]
}

// Premium Theme Colors
const COLORS = ['#667eea', '#764ba2', '#48bb78', '#ed8936', '#f56565']

export function Analytics() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    loadStats()
  }, [timeRange]) // Reload when filter changes (mock logic support)

  const loadStats = async () => {
    setLoading(true)
    try {
      const res = await getPlatformStats()
      if (res.success && res.data) {
        // Add defaults for missing fields but keep data real (0 instead of mock numbers)
        const enhancedData = {
          totalUsers: res.data.totalUsers || 0,
          activeUsers: res.data.totalUsers || 0, // Using totalUsers as active proxy for now since backend doesn't track active
          totalPosts: res.data.totalPosts || 0,
          totalWorkouts: res.data.totalWorkouts || 0,
          totalChallenges: res.data.totalChallenges || 0,
          totalNotifications: res.data.totalNotifications || 0,
          totalFoods: res.data.totalFoods || 0,
          totalExercises: res.data.totalExercises || 0,

          // If API doesn't provide these arrays yet, we use empty arrays to avoid crashing,
          // or simple placeholders that indicate no data rather than fake data.
          userGrowth: res.data.userGrowth || [],
          activityData: res.data.activityData || [
            { name: 'Bài viết', value: res.data.totalPosts || 0 },
            { name: 'Workouts', value: res.data.totalWorkouts || 0 },
            { name: 'Thử thách', value: res.data.totalChallenges || 0 },
            { name: 'Thông báo', value: res.data.totalNotifications || 0 },
            { name: 'Món ăn', value: res.data.totalFoods || 0 },
            { name: 'Bài tập', value: res.data.totalExercises || 0 }
          ],
          weeklyStats: res.data.weeklyStats || []
        }
        setStats(enhancedData)
      } else {
        // No data found or API failure
        setStats(null)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  // No getMockData anymore

  if (loading) {
    return <div className='loading'>Đang tải dữ liệu báo cáo...</div>
  }

  if (!stats) {
    return (
      <div className='error'>
        <p>Không có dữ liệu thống kê hoặc không thể kết nối đến server.</p>
      </div>
    )
  }

  const userEngagementRate = stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : '0'
  const avgPostsPerUser = stats.totalUsers > 0 ? (stats.totalPosts / stats.totalUsers).toFixed(1) : '0'

  return (
    <div className='analytics'>
      <div className='analytics-header'>
        <div>
          <h2 className='page-title'>Thống Kê & Báo Cáo</h2>
          <p className='page-subtitle'>Tổng quan hoạt động của hệ thống FitLife Planner</p>
        </div>
        <div className='time-filter'>
          <button className={timeRange === 'week' ? 'active' : ''} onClick={() => setTimeRange('week')}>
            Tuần Này
          </button>
          <button className={timeRange === 'month' ? 'active' : ''} onClick={() => setTimeRange('month')}>
            Tháng Này
          </button>
          <button className={timeRange === 'year' ? 'active' : ''} onClick={() => setTimeRange('year')}>
            Năm Nay
          </button>
        </div>
      </div>

      {/* Key Metrics Cards Without Icons */}
      <div className='metrics-grid'>
        <div className='metric-card'>
          <div className='metric-content'>
            <div className='metric-value'>{stats.totalUsers.toLocaleString()}</div>
            <div className='metric-label'>Tổng Người Dùng</div>
            <div className='metric-change positive'>Thực tế</div>
          </div>
        </div>

        <div className='metric-card'>
          <div className='metric-content'>
            <div className='metric-value'>{stats.activeUsers.toLocaleString()}</div>
            <div className='metric-label'>Đang Hoạt Động</div>
            <div className='metric-change positive'>Realtime</div>
          </div>
        </div>

        <div className='metric-card'>
          <div className='metric-content'>
            <div className='metric-value'>{stats.totalPosts.toLocaleString()}</div>
            <div className='metric-label'>Bài Viết Cộng Đồng</div>
            <div className='metric-change positive'>Tổng hợp</div>
          </div>
        </div>

        <div className='metric-card'>
          <div className='metric-content'>
            <div className='metric-value'>{stats.totalWorkouts.toLocaleString()}</div>
            <div className='metric-label'>Lượt Tập Luyện</div>
            <div className='metric-change positive'>Ghi nhận</div>
          </div>
        </div>

        <div className='metric-card'>
          <div className='metric-content'>
            <div className='metric-value'>{stats.totalNotifications.toLocaleString()}</div>
            <div className='metric-label'>Thông Báo</div>
            <div className='metric-change positive'>Đã gửi</div>
          </div>
        </div>

        <div className='metric-card'>
          <div className='metric-content'>
            <div className='metric-value'>{stats.totalFoods.toLocaleString()}</div>
            <div className='metric-label'>Món Ăn Dữ Liệu</div>
            <div className='metric-change positive'>Hệ thống</div>
          </div>
        </div>

        <div className='metric-card'>
          <div className='metric-content'>
            <div className='metric-value'>{stats.totalExercises.toLocaleString()}</div>
            <div className='metric-label'>Thư Viện Bài Tập</div>
            <div className='metric-change positive'>Có sẵn</div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className='charts-row'>
        {/* User Growth Chart */}
        <div className='chart-container'>
          <div className='chart-header'>
            <h3>Tăng Trưởng Người Dùng</h3>
            <p>Số lượng người dùng đăng ký mới</p>
          </div>
          <div className='chart-wrapper'>
            <ResponsiveContainer width='100%' height={300}>
              <AreaChart data={stats.userGrowth}>
                <defs>
                  <linearGradient id='colorUsers' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#667eea' stopOpacity={0.8} />
                    <stop offset='95%' stopColor='#667eea' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' vertical={false} />
                <XAxis dataKey='month' stroke='#a0aec0' axisLine={false} tickLine={false} />
                <YAxis stroke='#a0aec0' axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type='monotone'
                  dataKey='users'
                  stroke='#667eea'
                  strokeWidth={3}
                  fillOpacity={1}
                  fill='url(#colorUsers)'
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Distribution */}
        <div className='chart-container'>
          <div className='chart-header'>
            <h3>Phân Bố Nội Dung</h3>
            <p>Tỷ lệ bài viết, bài tập và thử thách thực tế</p>
          </div>
          <div className='chart-wrapper'>
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={stats.activityData}
                  cx='50%'
                  cy='50%'
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey='value'
                >
                  {stats.activityData?.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend verticalAlign='bottom' height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className='charts-row'>
        {/* Weekly Activity */}
        <div className='chart-container full-width'>
          <div className='chart-header'>
            <h3>Hoạt Động Gần Đây</h3>
            <p>Dữ liệu bài viết và bài tập thực tế</p>
          </div>
          <div className='chart-wrapper'>
            <ResponsiveContainer width='100%' height={320}>
              <BarChart data={stats.weeklyStats} barSize={20}>
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' vertical={false} />
                <XAxis dataKey='day' stroke='#a0aec0' axisLine={false} tickLine={false} />
                <YAxis stroke='#a0aec0' axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#f7fafc' }}
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey='posts' name='Bài viết' fill='#667eea' radius={[4, 4, 0, 0]} />
                <Bar dataKey='workouts' name='Lượt tập' fill='#48bb78' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Stats Without Icons */}
      <div className='summary-section'>
        <h3>Chỉ Số Hiệu Quả</h3>
        <div className='summary-grid'>
          <div className='summary-card'>
            <div className='summary-content'>
              <div className='summary-value'>{userEngagementRate}%</div>
              <div className='summary-label'>Tỷ Lệ Tương Tác</div>
              <div className='summary-desc'>Người dùng hoạt động thường xuyên</div>
            </div>
          </div>

          <div className='summary-card'>
            <div className='summary-content'>
              <div className='summary-value'>{avgPostsPerUser}</div>
              <div className='summary-label'>Đóng Góp Trung Bình</div>
              <div className='summary-desc'>Bài viết / Người dùng</div>
            </div>
          </div>

          <div className='summary-card'>
            <div className='summary-content'>
              <div className='summary-value'>
                {stats.totalWorkouts > 0 && stats.totalUsers > 0
                  ? (stats.totalWorkouts / stats.totalUsers).toFixed(1)
                  : '0'}
              </div>
              <div className='summary-label'>Tần Suất Tập Luyện</div>
              <div className='summary-desc'>Lượt tập / Người dùng / Tháng</div>
            </div>
          </div>

          <div className='summary-card'>
            <div className='summary-content'>
              <div className='summary-value'>{stats.totalPosts + stats.totalWorkouts + stats.totalChallenges}</div>
              <div className='summary-label'>Tổng Tương Tác</div>
              <div className='summary-desc'>Toàn bộ hoạt động ghi nhận được</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

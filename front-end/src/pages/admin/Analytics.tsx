import { useEffect, useState } from 'react'
import { getPlatformStats } from './adminApi'
import './Analytics.css'

interface Stats {
  totalUsers: number
  activeUsers: number
  totalPosts: number
  totalWorkouts: number
  totalChallenges: number
}

export function Analytics() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const res = await getPlatformStats()
      if (res.success && res.data) {
        setStats(res.data)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Đang tải...</div>
  }

  if (!stats) {
    return <div className="error">Không thể tải dữ liệu thống kê</div>
  }

  const maxValue = Math.max(
    stats.totalUsers,
    stats.activeUsers,
    stats.totalPosts,
    stats.totalWorkouts,
    stats.totalChallenges
  )

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h2>Phân Tích Thống Kê</h2>
        <p>Tổng quan về hoạt động của nền tảng</p>
      </div>

      {/* Bar Charts */}
      <div className="charts-container">
        <div className="chart-card">
          <div className="chart-title">Tổng Người Dùng</div>
          <div className="chart-value">{stats.totalUsers}</div>
          <div className="bar-chart">
            <div
              className="bar bar-users"
              style={{ width: `${(stats.totalUsers / maxValue) * 100}%` }}
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">Người Dùng Hoạt Động</div>
          <div className="chart-value">{stats.activeUsers}</div>
          <div className="bar-chart">
            <div
              className="bar bar-active"
              style={{ width: `${(stats.activeUsers / maxValue) * 100}%` }}
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">Tổng Bài Viết</div>
          <div className="chart-value">{stats.totalPosts}</div>
          <div className="bar-chart">
            <div
              className="bar bar-posts"
              style={{ width: `${(stats.totalPosts / maxValue) * 100}%` }}
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">Tổng Workouts</div>
          <div className="chart-value">{stats.totalWorkouts}</div>
          <div className="bar-chart">
            <div
              className="bar bar-workouts"
              style={{ width: `${(stats.totalWorkouts / maxValue) * 100}%` }}
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">Tổng Challenges</div>
          <div className="chart-value">{stats.totalChallenges}</div>
          <div className="bar-chart">
            <div
              className="bar bar-challenges"
              style={{ width: `${(stats.totalChallenges / maxValue) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-label">Tỷ Lệ Hoạt Động</div>
          <div className="summary-value">
            {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%
          </div>
          <div className="summary-desc">Users đang hoạt động</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Trung Bình Bài Viết</div>
          <div className="summary-value">
            {(stats.totalPosts / stats.totalUsers).toFixed(1)}
          </div>
          <div className="summary-desc">Bài viết / user</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Trung Bình Workouts</div>
          <div className="summary-value">
            {(stats.totalWorkouts / stats.totalUsers).toFixed(1)}
          </div>
          <div className="summary-desc">Workouts / user</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Tổng Hoạt Động</div>
          <div className="summary-value">
            {stats.totalPosts + stats.totalWorkouts + stats.totalChallenges}
          </div>
          <div className="summary-desc">Tổng nội dung</div>
        </div>
      </div>
    </div>
  )
}

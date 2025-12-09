import { useEffect, useState } from 'react'
import {
    createExercise,
    deleteExercise,
    getAllExercises,
    searchExercises,
    updateExercise,
    type Exercise
} from './exerciseApi'
import './ExerciseManagement.css'

export function ExerciseManagement() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)

  // Form State
  const [formData, setFormData] = useState<Partial<Exercise>>({
    title: '',
    description: '',
    primaryMuscle: '',
    difficulty: 'Easy',
    equipment: 'None',
    caloriesBurnedPerSet: 0,
    recommendedSets: 3,
    recommendedReps: 10,
    restSeconds: 60,
    instructions: '',
    images: [],
    videoUrl: ''
  })

  // File Upload State - REMOVED as per request
  // const [uploading, setUploading] = useState(false)

  const fetchExercises = async () => {
    setLoading(true)
    try {
      let res
      if (searchQuery) {
        res = await searchExercises(searchQuery, page, 10)
      } else {
        res = await getAllExercises(page, 10)
      }

      if (res.success && res.data) {
        setExercises(res.data.exercises)
        setTotalPages(Math.ceil(res.data.total / 10))
      }
    } catch (error) {
      console.error('Failed to fetch exercises', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExercises()
  }, [page, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchExercises()
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài tập này?')) return
    try {
      const res = await deleteExercise(id)
      if (res.success) {
        fetchExercises()
      } else {
        alert('Không thể xóa bài tập')
      }
    } catch (error) {
      console.error('Delete error', error)
      alert('Đã xảy ra lỗi khi xóa')
    }
  }

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise)
    setFormData(exercise)
    setShowModal(true)
  }

  const handleAddNew = () => {
    setEditingExercise(null)
    setFormData({
      title: '',
      description: '',
      primaryMuscle: '',
      difficulty: 'Easy',
      equipment: 'None',
      caloriesBurnedPerSet: 0,
      recommendedSets: 3,
      recommendedReps: 10,
      restSeconds: 60,
      instructions: '',
      // images: [], // Removed
      videoUrl: ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Basic validation
      if (!formData.title || !formData.primaryMuscle) {
        alert('Vui lòng điền tên bài tập và nhóm cơ chính')
        return
      }

      // Prepare payload without images
      const { images, ...rest } = formData as any
      const payload = {
            ...rest,
            secondaryMuscles: formData.secondaryMuscles || [],
            tags: formData.tags || []
      } as Exercise

      let res
      if (editingExercise) {
        res = await updateExercise(editingExercise.id, payload)
      } else {
        res = await createExercise(payload)
      }

      if (res.success) {
        setShowModal(false)
        fetchExercises()
      } else {
        alert(res.message || 'Lưu thất bại')
      }
    } catch (error) {
      console.error('Save error', error)
      alert('Đã xảy ra lỗi khi lưu')
    }
  }

  return (
    <div className="exercise-management">
      <header className="exercise-controls">
        <h2>Quản Lý Bài Tập</h2>
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Tìm kiếm bài tập..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn-search">Tìm</button>
        </form>
        <button className="btn-add" onClick={handleAddNew}>+ Thêm Mới</button>
      </header>

      <div className="exercise-table-container">
        <table className="exercise-table">
          <thead>
            <tr>
              <th className="col-image">Ảnh</th>
              <th>Tên Bài Tập</th>
              <th>Nhóm Cơ</th>
              <th>Độ Khó</th>
              <th>Dụng Cụ</th>
              <th className="col-actions">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{textAlign: 'center', padding: '2rem'}}>Đang tải...</td></tr>
            ) : exercises.length === 0 ? (
               <tr><td colSpan={6} style={{textAlign: 'center', padding: '2rem'}}>Không có dữ liệu</td></tr>
            ) : (
              exercises.map(exercise => (
                <tr key={exercise.id}>
                  <td>
                    {exercise.images && exercise.images.length > 0 ? (
                      <img src={exercise.images[0]} alt={exercise.title} className="exercise-thumbnail" />
                    ) : (
                      <div className="exercise-thumbnail" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e0'}}>No Img</div>
                    )}
                  </td>
                  <td>
                    <div style={{fontWeight: 600}}>{exercise.title}</div>
                    <div style={{fontSize: '0.85rem', color: '#718096'}}>{exercise.description?.substring(0, 50)}...</div>
                  </td>
                  <td>{exercise.primaryMuscle}</td>
                  <td>
                    <span className={`badge-difficulty badge-${exercise.difficulty.toLowerCase()}`}>
                      {exercise.difficulty}
                    </span>
                  </td>
                  <td>{exercise.equipment}</td>
                  <td className="col-actions">
                    <div className="action-buttons">
                      <button className="btn-edit" onClick={() => handleEdit(exercise)}>Sửa</button>
                      <button className="btn-delete" onClick={() => handleDelete(exercise.id)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          className="page-btn"
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
        >
          Trước
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
                key={p}
                className={`page-btn ${p === page ? 'active' : ''}`}
                onClick={() => setPage(p)}
            >
                {p}
            </button>
        ))}
        <button
          className="page-btn"
          disabled={page === totalPages}
          onClick={() => setPage(p => p + 1)}
        >
          Sau
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingExercise ? 'Cập Nhật Bài Tập' : 'Thêm Bài Tập Mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên bài tập (*)</label>
                <input
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div className="form-group">
                    <label>Nhóm cơ chính (*)</label>
                    <select
                        required
                        value={formData.primaryMuscle}
                        onChange={e => setFormData({...formData, primaryMuscle: e.target.value})}
                    >
                        <option value="">Chọn nhóm cơ</option>
                        <option value="Chest">Ngực (Chest)</option>
                        <option value="Back">Lưng (Back)</option>
                        <option value="Legs">Chân (Legs)</option>
                        <option value="Shoulders">Vai (Shoulders)</option>
                        <option value="Arms">Tay (Arms)</option>
                        <option value="Abs">Bụng (Abs)</option>
                        <option value="Cardio">Cardio</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Độ khó</label>
                    <select
                        value={formData.difficulty}
                        onChange={e => setFormData({...formData, difficulty: e.target.value})}
                    >
                        <option value="Easy">Dễ (Easy)</option>
                        <option value="Medium">Trung bình (Medium)</option>
                        <option value="Hard">Khó (Hard)</option>
                    </select>
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả ngắn</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Hướng dẫn chi tiết</label>
                <textarea
                  rows={4}
                  value={formData.instructions}
                  onChange={e => setFormData({...formData, instructions: e.target.value})}
                />
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem'}}>
                  <div className="form-group">
                      <label>Sets</label>
                      <input type="number" value={formData.recommendedSets} onChange={e => setFormData({...formData, recommendedSets: Number(e.target.value)})}/>
                  </div>
                  <div className="form-group">
                      <label>Reps</label>
                      <input type="number" value={formData.recommendedReps} onChange={e => setFormData({...formData, recommendedReps: Number(e.target.value)})}/>
                  </div>
                  <div className="form-group">
                      <label>Nghỉ (s)</label>
                      <input type="number" value={formData.restSeconds} onChange={e => setFormData({...formData, restSeconds: Number(e.target.value)})}/>
                  </div>
                  <div className="form-group">
                      <label>Calo/Set</label>
                      <input type="number" value={formData.caloriesBurnedPerSet} onChange={e => setFormData({...formData, caloriesBurnedPerSet: Number(e.target.value)})}/>
                  </div>
              </div>



              <div className="form-group">
                <label>Video URL (YouTube)</label>
                <input
                    value={formData.videoUrl || ''}
                    onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                    placeholder="https://youtube.com/..."
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-save">
                    {editingExercise ? 'Cập Nhật' : 'Tạo Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

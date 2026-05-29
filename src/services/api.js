import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Auto-logout on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('aap_token')
      localStorage.removeItem('aap_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  login:  (email, password) => api.post('/auth/login', { email, password }),
  me:     ()                => api.get('/auth/me'),
}

// ─── Students ─────────────────────────────────────────────────────────────
export const studentsAPI = {
  getAll:  (params = {}) => api.get('/students', { params }),
  getById: (id)          => api.get(`/students/${id}`),
}

// ─── Analytics ────────────────────────────────────────────────────────────
export const analyticsAPI = {
  summary:           ()       => api.get('/analytics/summary'),
  byDepartment:      ()       => api.get('/analytics/by-department'),
  trends:            ()       => api.get('/analytics/trends'),
  gradeDistribution: ()       => api.get('/analytics/grade-distribution'),
}

// ─── Predictions ──────────────────────────────────────────────────────────
export const predictionsAPI = {
  getAtRisk: ()         => api.get('/predictions/at-risk'),
  predict:   (features) => api.post('/predictions/predict', { features }),
}

// ─── Departments ──────────────────────────────────────────────────────────
export const departmentsAPI = {
  getAll: () => api.get('/departments'),
}

export default api

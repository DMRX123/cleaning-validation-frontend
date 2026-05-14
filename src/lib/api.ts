// src/lib/api.ts - CORRECTED
import axios from 'axios'

// Remove trailing /api from baseURL since it's already in rewrites
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cleaning-validation-backend.onrender.com'

// IMPORTANT: Don't add /api here - it's handled by rewrites
const api = axios.create({
  baseURL: `${API_BASE_URL}`,  // ← NO /api here!
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
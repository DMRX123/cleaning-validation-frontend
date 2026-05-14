// src/lib/api.ts - COMPLETE WITH ENV VARIABLES
import axios from 'axios'

// Use environment variable with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cleaning-validation-backend.onrender.com'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
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
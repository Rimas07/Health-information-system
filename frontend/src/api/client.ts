import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || ''

export const apiClient = axios.create({
  baseURL: BASE_URL,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  const tenantId = localStorage.getItem('tenant_id')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (tenantId) {
    config.headers['X-TENANT-ID'] = tenantId
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
    }

    try {
      const response = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
        withCredentials:true
      })
      const newAccessToken = response.data.accessToken
      localStorage.setItem('access_token', newAccessToken)

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return apiClient(originalRequest)
    } catch {
      localStorage.removeItem('access_tojen')
      localStorage.removeItem('tenant_id')
      window.location.href = '/login'
    }
  
  return Promise.reject(error)
  }
)

import api from './axios'

export const authApi = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  refreshToken: (refresh) => api.post('/auth/token/refresh/', { refresh }),
  verifyToken: (token) => api.post('/auth/token/verify/', { token }),
  getMe: () => api.get('/users/me/'),
  updateMe: (data) => api.patch('/users/me/', data),
  changePassword: (data) => api.post('/users/change-password/', data),
}

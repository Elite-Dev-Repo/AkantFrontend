import api from './axios'

export const reportsApi = {
  list: (params) => api.get('/reports/', { params }),
  get: (id) => api.get(`/reports/${id}/`),
  generate: (data) => api.post('/reports/generate/', data),
}

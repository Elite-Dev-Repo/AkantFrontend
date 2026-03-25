import api from './axios'

export const paymentsApi = {
  list: (params) => api.get('/payments/', { params }),
  get: (id) => api.get(`/payments/${id}/`),
  initiate: (debtId) => api.post('/payments/initiate/', { debt_id: debtId }),
  verify: (reference) => api.post('/payments/verify/', { reference }),
}

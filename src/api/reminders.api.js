import api from './axios'

export const remindersApi = {
  list: (params) => api.get('/reminders/', { params }),
  get: (id) => api.get(`/reminders/${id}/`),
  send: (debtId) => api.post('/reminders/send/', { debt_id: debtId }),
}

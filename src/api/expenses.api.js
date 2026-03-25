import api from './axios'

export const expensesApi = {
  // Group-scoped
  listByGroup: (groupId, params) =>
    api.get(`/groups/${groupId}/expenses/`, { params }),
  create: (groupId, data) =>
    api.post(`/groups/${groupId}/expenses/`, data),
  get: (groupId, expenseId) =>
    api.get(`/groups/${groupId}/expenses/${expenseId}/`),
  delete: (groupId, expenseId) =>
    api.delete(`/groups/${groupId}/expenses/${expenseId}/`),
  markSplitPaid: (groupId, expenseId, splitId) =>
    api.post(`/groups/${groupId}/expenses/${expenseId}/splits/${splitId}/pay/`),

  // Cross-group listing
  listAll: (params) => api.get('/expenses/', { params }),

  // Debts
  listDebts: (groupId, params) =>
    api.get(`/groups/${groupId}/debts/`, { params }),
  getDebt: (groupId, debtId) =>
    api.get(`/groups/${groupId}/debts/${debtId}/`),
  settleDebt: (groupId, debtId) =>
    api.post(`/groups/${groupId}/debts/${debtId}/settle/`),
  getMyBalance: (groupId) =>
    api.get(`/groups/${groupId}/debts/my-balance/`),
}

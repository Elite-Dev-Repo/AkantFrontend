import api from './axios'

export const groupsApi = {
  list: (params) => api.get('/groups/', { params }),
  create: (data) => api.post('/groups/', data),
  get: (id) => api.get(`/groups/${id}/`),
  update: (id, data) => api.patch(`/groups/${id}/`, data),
  delete: (id) => api.delete(`/groups/${id}/`),

  // Members
  listMembers: (id) => api.get(`/groups/${id}/members/`),
  removeMember: (groupId, userId) => api.delete(`/groups/${groupId}/members/${userId}/`),
  promoteMember: (groupId, userId) => api.post(`/groups/${groupId}/members/${userId}/promote/`),

  // Invites
  sendInvite: (id, email) => api.post(`/groups/${id}/invites/`, { invited_email: email }),
  listInvites: (id) => api.get(`/groups/${id}/invites/list/`),
  acceptInvite: (token) => api.post('/groups/invites/accept/', { token }),
}

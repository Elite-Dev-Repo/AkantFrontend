import api from "./axios";

export const authApi = {
  register: (data) => api.post("/auth/register/", data),
  login: (data) => api.post("/auth/login/", data),
  logout: (refresh) => api.post("/auth/logout/", { refresh }),
  getMe: () => api.get("/users/me/"),
  updateMe: (data) => api.patch("/users/me/", data),
  changePassword: (data) => api.post("/users/change-password/", data),

  // Account Details Endpoints
  getAccountDetails: (id) => api.get(`/account_details/${id}/`),
  addAccountDetails: (data) => api.post("/account_details/", data),
  deleteAccountDetails: (id) => api.delete(`/account_details/${id}/`),
};

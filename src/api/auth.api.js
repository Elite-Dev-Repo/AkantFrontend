import api from "./axios";

export const authApi = {
  register: (data) => api.post("/auth/register/", data),
  login: (data) => api.post("/auth/login/", data),
  logout: (refresh) => api.post("/auth/logout/", { refresh }),
  refreshToken: (refresh) => api.post("/auth/token/refresh/", { refresh }),
  getMe: () => api.get("/users/me/"),
  updateMe: (data) => api.patch("/users/me/", data),
  changePassword: (data) => api.post("/users/change-password/", data),

  // Account details — served under /users/account-details/
  getAccountDetails: () => api.get("/users/account-details/"),
  createAccountDetails: (data) => api.post("/users/account-details/", data),
  updateAccountDetails: (id, data) =>
    api.patch(`/users/account-details/${id}/`, data),
  deleteAccountDetails: (id) => api.delete(`/users/account-details/${id}/`),
};

import api from "./axios";

export const paymentsApi = {
  list: (params) => api.get("/payments/", { params }),
  get: (id) => api.get(`/payments/${id}/`),
  initiate: (debtId) => api.post("/payments/initiate/", { debt_id: debtId }),
  verify: (reference) => api.post("/payments/verify/", { reference }),

  // Bank transfers
  listBankTransfers: (params) =>
    api.get("/payments/bank-transfers/", { params }),
  initiateBankTransfer: (debtId, note) =>
    api.post("/payments/bank-transfers/initiate/", { debt_id: debtId, note }),
  confirmBankTransfer: (transferId) =>
    api.post(`/payments/bank-transfers/${transferId}/confirm/`),
};

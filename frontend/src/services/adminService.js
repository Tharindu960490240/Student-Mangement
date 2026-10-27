import { API_ENDPOINTS } from "../const/const";
import { apiRequest, toQuery } from "./apiClient";

// ---------- invitations ----------
// params: { status?: "pending"|"accepted"|"expired"|"revoked", page, limit }
export const listInvitations = (params) =>
  apiRequest(`${API_ENDPOINTS.INVITATIONS.BASE}${toQuery(params)}`);

// payload: { email, role, first_name? }
export const createInvitation = (payload) =>
  apiRequest(API_ENDPOINTS.INVITATIONS.BASE, { method: "POST", body: payload });

export const resendInvitation = (id) =>
  apiRequest(API_ENDPOINTS.INVITATIONS.RESEND(id), { method: "POST" });

export const revokeInvitation = (id) =>
  apiRequest(API_ENDPOINTS.INVITATIONS.REVOKE(id), { method: "DELETE" });

// ---------- users ----------
// params: { role?, status?, search?, page, limit }
export const listUsers = (params) =>
  apiRequest(`${API_ENDPOINTS.USERS.BASE}${toQuery(params)}`);

// status: "active" | "suspended"
export const setUserStatus = (id, status) =>
  apiRequest(API_ENDPOINTS.USERS.UPDATE_STATUS(id), {
    method: "PATCH",
    body: { status },
  });

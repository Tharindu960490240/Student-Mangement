// ===============================
// Invitation API (public sign-up side)
//
//   GET  /invitations/:token         -> { success, data: { email, role, first_name, expires_at } }
//   POST /invitations/:token/accept  -> { success, message }
//
// The role and email come from the invitation on the server.
// The browser never sends them.
//
// Endpoints are defined in src/const/const.js.
// Admin actions (send, resend, revoke) are in adminService.js.
// ===============================
import { API_ENDPOINTS } from "../const/const";

const request = async (url, options = {}) => {
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const body = await res.json().catch(() => ({}));
    return { ...body, success: res.ok && body.success !== false };
  } catch (error) {
    return { success: false, message: "Could not reach the server." };
  }
};

// Used by the sign-up page to check the link and prefill the email and role.
export const getInvitation = (token) =>
  request(API_ENDPOINTS.INVITATIONS.BY_TOKEN(token));

// Creates the account. payload never contains email or role.
export const acceptInvitation = (token, payload) =>
  request(API_ENDPOINTS.INVITATIONS.ACCEPT(token), {
    method: "POST",
    body: JSON.stringify(payload),
  });

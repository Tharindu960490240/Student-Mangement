// ===============================
// Auth API (talks to the AFC backend)
//
// Replace your old authService.js with this file. Same function names the
// screens already import, new endpoints.
//
// The API address and endpoints live in src/const/const.js.
// ===============================
import { API_ENDPOINTS } from "../const/const";

const request = async (url, { method = "GET", body, token } = {}) => {
  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    return { ...json, success: res.ok && json.success !== false, status: res.status };
  } catch (error) {
    return { success: false, message: "Could not reach the server." };
  }
};

// The token is kept in localStorage under "Token" (App.js manages it).
export const get_token = async () => localStorage.getItem("Token");

// -> { success, data: { token, user } }
export const loginUser = ({ email, password }) =>
  request(API_ENDPOINTS.AUTH.LOGIN, { method: "POST", body: { email, password } });

// -> { success, user: { first_name, last_name, role, profile_image, ... } }
export const getProfile = (token) => request(API_ENDPOINTS.AUTH.ME, { token });

// Always answers "success" (the server never says whether the email exists).
export const sendPasswordResetLink = (email) =>
  request(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { method: "POST", body: { email } });

// Checks the link from the email -> { success, data: { email } }
export const validateResetToken = (token) =>
  request(API_ENDPOINTS.AUTH.VALIDATE_RESET_TOKEN, { method: "POST", body: { token } });

export const resetPassword = (token, password) =>
  request(API_ENDPOINTS.AUTH.RESET_PASSWORD, { method: "POST", body: { token, password } });

export const changePassword = (token, currentPassword, newPassword) =>
  request(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, { method: "PUT", token, body: { currentPassword, newPassword } });

// Accounts are now verified by the invitation link itself, so the old
// /verify/:token page is no longer part of the flow.
export const verifyEmail = async () => ({
  success: false,
  message: "Email verification is no longer needed. Please sign in.",
});

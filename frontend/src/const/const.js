// ===============================
// App-wide constants: API address and every endpoint in one place.
//
// Pick the backend with REACT_APP_API_URL in the frontend .env file
// (restart `npm start` after changing it). Examples:
//   REACT_APP_API_URL=http://localhost:3200/api      (local, the default)
//   REACT_APP_API_URL=https://api.your-afc-domain/api (production)
// ===============================
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3200/api";

// Where the React app itself runs (used for links shown to users)
export const FRONTEND_BASE_URL = window.location.origin;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    ME: `${API_BASE_URL}/auth/me`,
    UPDATE_PROFILE: `${API_BASE_URL}/auth/me`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/me/password`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    VALIDATE_RESET_TOKEN: `${API_BASE_URL}/auth/reset-password/validate`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  },

  INVITATIONS: {
    BASE: `${API_BASE_URL}/invitations`,
    BY_TOKEN: (token) =>
      `${API_BASE_URL}/invitations/${encodeURIComponent(token)}`,
    ACCEPT: (token) =>
      `${API_BASE_URL}/invitations/${encodeURIComponent(token)}/accept`,
    RESEND: (id) => `${API_BASE_URL}/invitations/${id}/resend`,
    REVOKE: (id) => `${API_BASE_URL}/invitations/${id}`,
  },

  AGENTS: {
    BASE: `${API_BASE_URL}/agents`,
  },

  AGREEMENTS: {
    BASE: `${API_BASE_URL}/agreements`,
    BY_ID: (id) => `${API_BASE_URL}/agreements/${id}`,
    SIGN: (id) => `${API_BASE_URL}/agreements/${id}/sign`,
    PDF: (id) => `${API_BASE_URL}/agreements/${id}/pdf`,
    APPROVE: (id) => `${API_BASE_URL}/agreements/${id}/approve`,
    REJECT: (id) => `${API_BASE_URL}/agreements/${id}/reject`,
    CANCEL: (id) => `${API_BASE_URL}/agreements/${id}/cancel`,
    DOWNLOAD: (id, fileId) =>
      `${API_BASE_URL}/agreements/${id}/files/${fileId}/download`,
  },

  AGREEMENT_TEMPLATE: {
    BASE: `${API_BASE_URL}/agreement-template`,
    PREVIEW: `${API_BASE_URL}/agreement-template/preview`,
  },

  USERS: {
    BASE: `${API_BASE_URL}/users`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/users/${id}/status`,
  },
};

export const ROUTES = {
  SIGNIN: "/signin",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
};

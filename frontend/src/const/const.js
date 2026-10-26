// export const API_BASE_URL = "http://localhost:3200/api";

// export const API_BASE_URL = "https://AFC-backend-chec.onrender.com/api";

// export const API_BASE_URL = "http://18.188.218.74/api";

// export const API_BASE_URL = "/api";

export const API_BASE_URL = "https://api.agrilinkservices.com/api";

export const FRONTEND_BASE_URL = "https://AFC.agrilinkservices.com/";

export const PROFILE_PLACEHOLDER_IMAGE =
  "https://agri-link-services-AFC-uploads.s3.us-east-2.amazonaws.com/default/user.png";

export const ADS_PLACEHOLDER_IMAGE =
  "https://agri-link-services-AFC-uploads.s3.us-east-2.amazonaws.com/default/ad.png";

export const API_ENDPOINTS = {
  AUTH: {
    BASE: `${API_BASE_URL}/auth`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    VERIFY: `${API_BASE_URL}/auth/verify`,
    RESEND: `${API_BASE_URL}/auth/resend`,
    ME: `${API_BASE_URL}/auth/me`,
    ME_IMAGE: `${API_BASE_URL}/auth/me/image`,
    UPDATE_PROFILE: `${API_BASE_URL}/auth/me`,
    UPDATE_IMAGE: `${API_BASE_URL}/auth/me/image`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/me/password`,
    DELETE_PROFILE: `${API_BASE_URL}/auth/me`,
    ADMIN_GET_USERS: `${API_BASE_URL}/auth`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/auth/${id}/status`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  },

  ADS: {
    BASE: `${API_BASE_URL}/ads`,
    MY_ADS: `${API_BASE_URL}/ads/my`,
    BY_ID: (id) => `${API_BASE_URL}/ads/${id}`,
    CREATE: `${API_BASE_URL}/ads`,
    UPDATE: (id) => `${API_BASE_URL}/ads/${id}`,
    DELETE: (id) => `${API_BASE_URL}/ads/${id}`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/ads/${id}/status`,
    INCREMENT_VIEW: (id) => `${API_BASE_URL}/ads/${id}/view`,
    UPLOAD_IMAGES: (adId) => `${API_BASE_URL}/ads/${adId}/images`,
  },

  CATEGORIES: {
    BASE: `${API_BASE_URL}/categories`,
    CREATE: `${API_BASE_URL}/categories`,
    GET_ADMIN: `${API_BASE_URL}/categories/admin`,
    DELETE: (id) => `${API_BASE_URL}/categories/${id}`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/categories/${id}/status`,
    GET_ACTIVE: `${API_BASE_URL}/categories`,
    GET_ALL: `${API_BASE_URL}/categories/all`,
  },

  REVIEWS: {
    BASE: `${API_BASE_URL}/reviews`,
    CREATE: `${API_BASE_URL}/reviews`,
    BY_AD: (adId) => `${API_BASE_URL}/reviews/${adId}`,
    DELETE: (id) => `${API_BASE_URL}/reviews/${id}`,
  },

  SAVED: {
    BASE: `${API_BASE_URL}/saved`,
    CREATE: `${API_BASE_URL}/saved`,
    DELETE: (id) => `${API_BASE_URL}/saved/${id}`,
  },

  DASHBOARD: {
    BASE: `${API_BASE_URL}/dashboard`,
    HOME: `${API_BASE_URL}/dashboard/home`,
    ADMIN: `${API_BASE_URL}/dashboard/admin`,
  },

  SUPPORT: {
    BASE: `${API_BASE_URL}/support`,
    CREATE_TICKET: `${API_BASE_URL}/support/ticket`,
    SEND_MESSAGE: `${API_BASE_URL}/support/message`,
    GET_TICKETS: `${API_BASE_URL}/support`,
    GET_MESSAGES: (ticketId) => `${API_BASE_URL}/support/${ticketId}`,
    CLOSE_TICKET: (ticketId) => `${API_BASE_URL}/support/${ticketId}/close`,
  },

  NOTIFICATIONS: {
    BASE: `${API_BASE_URL}/notifications`,
    GET_ALL: `${API_BASE_URL}/notifications`,
    COUNT: `${API_BASE_URL}/notifications/count`,
    MARK_AS_READ: (id) => `${API_BASE_URL}/notifications/${id}/read`,
    MARK_ALL_AS_READ: `${API_BASE_URL}/notifications/read-all`,
  },
};

export const ROUTES = {
  HOME: "/home",
  SIGNIN: "/signin",
  SIGNUP: "/signup",
  VERIFY: "/verify",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
};

// export const googleMapsConfig = {
//   id: "google-map-script",
//   googleMapsApiKey: "AIzaSyBVnhyhy6TFKpERbsN4d_GKJir9wQgrGeg",
//   libraries: ["places", "maps"],
// };

export const DISTRICTS = [
  { value: "Ampara", label: "Ampara", si: "අම්පාර", lat: 7.3018, lng: 81.6747 },
  {
    value: "Anuradhapura",
    label: "Anuradhapura",
    si: "අනුරාධපුර",
    lat: 8.3114,
    lng: 80.4037,
  },
  {
    value: "Badulla",
    label: "Badulla",
    si: "බදුල්ල",
    lat: 6.9934,
    lng: 81.055,
  },
  {
    value: "Batticaloa",
    label: "Batticaloa",
    si: "මඩකලපුව",
    lat: 7.7102,
    lng: 81.6924,
  },
  { value: "Colombo", label: "Colombo", si: "කොළඹ", lat: 6.9271, lng: 79.8612 },
  { value: "Galle", label: "Galle", si: "ගාල්ල", lat: 6.0535, lng: 80.2117 },
  {
    value: "Gampaha",
    label: "Gampaha",
    si: "ගම්පහ",
    lat: 7.0873,
    lng: 79.9913,
  },
  {
    value: "Hambantota",
    label: "Hambantota",
    si: "හම්බන්තොට",
    lat: 6.1429,
    lng: 81.1212,
  },
  { value: "Jaffna", label: "Jaffna", si: "යාපනය", lat: 9.6615, lng: 80.0255 },
  {
    value: "Kalutara",
    label: "Kalutara",
    si: "කළුතර",
    lat: 6.5854,
    lng: 79.9607,
  },
  { value: "Kandy", label: "Kandy", si: "මහනුවර", lat: 7.2906, lng: 80.6337 },
  {
    value: "Kegalle",
    label: "Kegalle",
    si: "කෑගල්ල",
    lat: 7.2513,
    lng: 80.3464,
  },
  {
    value: "Kilinochchi",
    label: "Kilinochchi",
    si: "කිලිනොච්චි",
    lat: 9.3803,
    lng: 80.377,
  },
  {
    value: "Kurunegala",
    label: "Kurunegala",
    si: "කුරුණෑගල",
    lat: 7.4863,
    lng: 80.3647,
  },
  { value: "Mannar", label: "Mannar", si: "මන්නාරම", lat: 8.981, lng: 79.9044 },
  { value: "Matale", label: "Matale", si: "මාතලේ", lat: 7.4675, lng: 80.6234 },
  { value: "Matara", label: "Matara", si: "මාතර", lat: 5.9549, lng: 80.555 },
  {
    value: "Monaragala",
    label: "Monaragala",
    si: "මොණරාගල",
    lat: 6.8719,
    lng: 81.3504,
  },
  {
    value: "Mullaitivu",
    label: "Mullaitivu",
    si: "මුලතිව්",
    lat: 9.2673,
    lng: 80.8143,
  },
  {
    value: "Nuwara Eliya",
    label: "Nuwara Eliya",
    si: "නුවරඑළිය",
    lat: 6.9497,
    lng: 80.7891,
  },
  {
    value: "Polonnaruwa",
    label: "Polonnaruwa",
    si: "පොළොන්නරුව",
    lat: 7.9403,
    lng: 81.0188,
  },
  {
    value: "Puttalam",
    label: "Puttalam",
    si: "පුත්තලම",
    lat: 8.0362,
    lng: 79.8283,
  },
  {
    value: "Ratnapura",
    label: "Ratnapura",
    si: "රත්නපුර",
    lat: 6.7056,
    lng: 80.3847,
  },
  {
    value: "Trincomalee",
    label: "Trincomalee",
    si: "ත්‍රිකුණාමලය",
    lat: 8.5873,
    lng: 81.2152,
  },
  {
    value: "Vavuniya",
    label: "Vavuniya",
    si: "වව්නියාව",
    lat: 8.7542,
    lng: 80.4982,
  },
];

export const RATING_LABLES = {
  0.5: "Useless",
  1: "Useless+",
  1.5: "Poor",
  2: "Poor+",
  2.5: "Ok",
  3: "Ok+",
  3.5: "Good",
  4: "Good+",
  4.5: "Excellent",
  5: "Excellent+",
};

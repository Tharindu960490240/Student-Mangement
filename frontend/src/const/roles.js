// ===============================
// User roles
// The role always comes from the server (getProfile), never from the client.
// ===============================
export const ROLES = {
  ADMIN: "admin",
  AGENT: "agent",
  TEACHER: "teacher",
  STUDENT: "student",
};

// Display names (used in the header and dashboards)
export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.AGENT]: "Agent",
  [ROLES.TEACHER]: "Teacher",
  [ROLES.STUDENT]: "Student",
};

// Where each role lands after signing in.
export const ROLE_HOME = {
  [ROLES.ADMIN]: "/admin",
  [ROLES.AGENT]: "/agent",
  [ROLES.TEACHER]: "/teacher",
  [ROLES.STUDENT]: "/student",
};

export const normalizeRole = (role) => String(role || "").trim().toLowerCase();

export const getHomeRoute = (role) => ROLE_HOME[normalizeRole(role)] || "/home";

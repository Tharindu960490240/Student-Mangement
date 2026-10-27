const ROLES = Object.freeze({ ADMIN: "admin", AGENT: "agent", TEACHER: "teacher", STUDENT: "student" });
const ROLE_LIST = Object.values(ROLES);

// who may invite whom
const INVITE_PERMISSIONS = Object.freeze({
  [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.AGENT, ROLES.TEACHER, ROLES.STUDENT],
  [ROLES.AGENT]: [ROLES.STUDENT],
});

// same rule as the React sign-up form
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,72}$/;

module.exports = { ROLES, ROLE_LIST, INVITE_PERMISSIONS, PASSWORD_REGEX };

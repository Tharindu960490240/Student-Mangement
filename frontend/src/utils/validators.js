// ===============================
// Shared form validation
// ===============================

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Same rule the reset-password page and the server use
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Shown to the user as they type a password
export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (v) => v.length >= 8 },
  { id: "upper", label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { id: "lower", label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { id: "number", label: "One number", test: (v) => /\d/.test(v) },
  {
    id: "special",
    label: "One special character (@ $ ! % * ? &)",
    test: (v) => /[@$!%*?&]/.test(v),
  },
  {
    id: "allowed",
    label: "Only letters, numbers and @ $ ! % * ? &",
    test: (v) => v.length > 0 && /^[A-Za-z\d@$!%*?&]*$/.test(v),
  },
];

// International names: letters in any language, with spaces, hyphens,
// apostrophes and full stops (e.g. "Mary-Jane", "O'Brien", "de Silva")
export const isValidName = (value) =>
  /^[\p{L}\p{M}]+(?:[\s'’.-]+[\p{L}\p{M}]+)*$/u.test((value || "").trim());

// Phone numbers: any country. Spaces, dashes and brackets are allowed.
export const normalizePhone = (value) =>
  (value || "").replace(/[\s\-().]/g, "");

export const isValidPhone = (value) =>
  /^\+?\d{7,15}$/.test(normalizePhone(value));

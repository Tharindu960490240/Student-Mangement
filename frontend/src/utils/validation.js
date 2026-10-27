// ===============================
// Sign-up validation (shared, easy to unit test)
// ===============================
export const NAME_REGEX = /^[\p{L}][\p{L}\s'’.-]*$/u; // allows O'Brien, Smith-Jones
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const isValidName = (v) => {
  const s = (v || "").trim();
  return s.length >= 1 && s.length <= 50 && NAME_REGEX.test(s);
};

// Australian (04xx xxx xxx, +61 ...) and international numbers
export const isValidPhone = (v) => {
  const s = (v || "").trim();
  const digits = s.replace(/\D/g, "");
  return /^\+?[\d\s()-]+$/.test(s) && digits.length >= 8 && digits.length <= 15;
};

export const isValidPassword = (v) => PASSWORD_REGEX.test(v || "");

// yyyy-mm-dd (value of <input type="date">)
export const getAge = (dob, today = new Date()) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob || "")) return null;
  const [y, m, d] = dob.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null; // e.g. 2000-02-31
  }
  if (date > today) return null;
  let age = today.getFullYear() - y;
  const hadBirthday =
    today.getMonth() > m - 1 ||
    (today.getMonth() === m - 1 && today.getDate() >= d);
  if (!hadBirthday) age -= 1;
  return age;
};

export const isValidDob = (dob, today = new Date()) => {
  const age = getAge(dob, today);
  return age !== null && age >= 0 && age <= 100;
};

// ABN (Australia) or an overseas business registration number. Optional.
export const isValidBusinessNumber = (v) => {
  const s = (v || "").trim();
  return s === "" || /^[A-Za-z0-9][A-Za-z0-9 -]{3,24}$/.test(s);
};

// Returns { field: "message" }. Empty object means the form is valid.
export const validateSignUp = (v, role, today = new Date()) => {
  const e = {};

  if (!isValidName(v.first_name)) e.first_name = "Enter your first name";
  if (!isValidName(v.last_name)) e.last_name = "Enter your last name";
  if (!isValidPhone(v.phone))
    e.phone = "Enter a valid phone number, e.g. 0412 345 678 or +61 412 345 678";

  if (!isValidPassword(v.password))
    e.password =
      "Use 8+ characters with upper and lower case, a number and one of @ $ ! % * ? &";
  if (v.password !== v.confirmPassword)
    e.confirmPassword = "Passwords do not match";

  if (role === "agent") {
    const agency = (v.agency_name || "").trim();
    if (agency.length < 2 || agency.length > 100)
      e.agency_name = "Enter your agency or business name";
    if (!v.country) e.country = "Select the country your business is in";
    if (!isValidBusinessNumber(v.business_number))
      e.business_number = "Enter 4 to 25 letters or numbers, or leave blank";
  }

  if (role === "student") {
    if (!isValidDob(v.date_of_birth, today))
      e.date_of_birth = "Enter your date of birth";
    if (!v.country) e.country = "Select your country of citizenship";
  }

  if (!v.consent) e.consent = "You must agree to continue";

  return e;
};

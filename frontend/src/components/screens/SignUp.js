import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  Person,
  Lock,
  Phone,
  Visibility,
  VisibilityOff,
  Email,
  Business,
  Event,
  CheckCircle,
  ErrorOutline,
} from "@mui/icons-material";

import {
  IconButton,
  TextField,
  InputAdornment,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  CircularProgress,
} from "@mui/material";

import "../styles/signUp.css";

import AuthLogo from "../AuthLogo";
import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";

import { getInvitation, acceptInvitation } from "../../services/invitationService";
import { ROLES, ROLE_LABELS, normalizeRole } from "../../const/roles";
import { COUNTRIES } from "../../const/countries";
import { getAge, validateSignUp } from "../../utils/validation";

// ===============================
// Wording per role
// ===============================
const ROLE_COPY = {
  [ROLES.ADMIN]: {
    title: "Set up your admin account",
    subtitle: "Create your password to manage the portal.",
    next: "Sign in to open the admin dashboard.",
  },
  [ROLES.AGENT]: {
    title: "Set up your agent account",
    subtitle:
      "Tell us about your agency. You will review and sign the agent agreement after you sign in.",
    next: "Sign in to review and upload your signed agent agreement.",
  },
  [ROLES.TEACHER]: {
    title: "Set up your teacher account",
    subtitle: "Create your password to access your classes and students.",
    next: "Sign in to open your teacher dashboard.",
  },
  [ROLES.STUDENT]: {
    title: "Set up your student account",
    subtitle: "Confirm your details and create your password.",
    next: "Sign in to continue with your application.",
  },
};

const CONSENT_TEXT =
  "I agree to Australian Federation College collecting and handling my personal information to manage my application, enrolment and studies, in line with the Australian Privacy Principles.";

const INITIAL_VALUES = {
  first_name: "",
  last_name: "",
  phone: "",
  agency_name: "",
  business_number: "",
  country: "",
  date_of_birth: "",
  password: "",
  confirmPassword: "",
  consent: false,
};

const SignUp = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  // "no-token" | "checking" | "invalid" | "ready" | "done"
  const [status, setStatus] = useState(token ? "checking" : "no-token");
  const [invite, setInvite] = useState(null); // { email, role }
  const [inviteError, setInviteError] = useState("");

  const [values, setValues] = useState(INITIAL_VALUES);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const showMessage = (message, severity) =>
    setSnackbar({ open: true, message, severity });

  // ---------- Check the invitation link ----------
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const check = async () => {
      setStatus("checking");
      const res = await getInvitation(token);
      if (cancelled) return;

      const role = normalizeRole(res?.data?.role);
      if (res.success && res.data?.email && ROLE_COPY[role]) {
        setInvite({ email: res.data.email, role });
        setValues((prev) => ({
          ...prev,
          first_name: prev.first_name || res.data.first_name || "",
        }));
        setStatus("ready");
      } else {
        setInviteError(res.message || "");
        setStatus("invalid");
      }
    };

    check();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const role = invite?.role;
  const copy = ROLE_COPY[role];

  const errors = useMemo(
    () => (role ? validateSignUp(values, role) : {}),
    [values, role],
  );

  const showError = (name) => Boolean(errors[name] && (touched[name] || submitted));

  const setField = (name, value) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const markTouched = (name) =>
    setTouched((prev) => ({ ...prev, [name]: true }));

  // props shared by every text field
  const fieldProps = (name, label, hint = " ") => ({
    className: "custom-textfield",
    size: "small",
    label,
    value: values[name],
    onChange: (e) => setField(name, e.target.value),
    onBlur: () => markTouched(name),
    error: showError(name),
    helperText: showError(name) ? errors[name] : hint,
    required: true,
  });

  const adornment = (Icon) => ({
    startAdornment: (
      <InputAdornment position="start">
        <Icon />
      </InputAdornment>
    ),
  });

  const age = role === ROLES.STUDENT ? getAge(values.date_of_birth) : null;

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (Object.keys(errors).length > 0) {
      showMessage("Please fix the highlighted fields.", "error");
      return;
    }

    // Email and role are NOT sent. The server takes them from the invitation.
    const payload = {
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      phone: values.phone.trim(),
      password: values.password,
      consent: true,
    };

    if (role === ROLES.AGENT) {
      payload.agency_name = values.agency_name.trim();
      payload.business_number = values.business_number.trim();
      payload.country = values.country;
    }

    if (role === ROLES.STUDENT) {
      payload.date_of_birth = values.date_of_birth;
      payload.country = values.country;
    }

    setLoading(true);
    const res = await acceptInvitation(token, payload);
    setLoading(false);

    if (res.success) {
      setValues(INITIAL_VALUES);
      setStatus("done");
    } else {
      showMessage(
        res.message || "We could not create your account. Please try again.",
        "error",
      );
    }
  };

  const handleClose = () => setSnackbar((prev) => ({ ...prev, open: false }));

  // ---------- Screens other than the form ----------
  if (status === "checking") {
    return (
      <div className="signup-container">
        <div className="signup-box">
          <AuthLogo />
          <CircularProgress size={36} thickness={4} />
          <p className="signup-subtitle">Checking your invitation…</p>
        </div>
      </div>
    );
  }

  if (status === "no-token" || status === "invalid") {
    const isMissing = status === "no-token";
    return (
      <div className="signup-container">
        <div className="signup-box">
          <AuthLogo />
          <ErrorOutline className="signup-icon signup-icon-warn" />
          <h2>
            {isMissing ? "Sign-up is by invitation only" : "Invitation not valid"}
          </h2>
          <p className="signup-subtitle">
            {isMissing
              ? "Accounts are created from a personal invitation link sent by the college. Check your email for the link."
              : inviteError ||
                "This invitation link is not valid. It may have expired or already been used."}
          </p>
          <p className="signup-subtitle">
            {isMissing
              ? "No invitation? Contact the college on +61 3 6393 3225 or info@afcollege.edu.au."
              : "Ask the college (info@afcollege.edu.au) to send you a new invitation."}
          </p>
          <Link to="/signin" className="button-success signup-link-button">
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="signup-container">
        <div className="signup-box">
          <AuthLogo />
          <CheckCircle className="signup-icon signup-icon-success" />
          <h2>Your account is ready</h2>
          <p className="signup-subtitle">
            {copy?.next || "Sign in to continue."}
          </p>
          <button
            className="button-success"
            onClick={() => navigate("/signin", { replace: true })}
          >
            Go to sign in
          </button>
        </div>
      </div>
    );
  }

  // ---------- The form ----------
  return (
    <div className="signup-container">
      <form className="signup-box" onSubmit={handleSubmit} noValidate>
        <AuthLogo />

        <span className={`role-chip role-${role}`}>
          Invited as {ROLE_LABELS[role]}
        </span>

        <h2>{copy.title}</h2>
        <p className="signup-subtitle">{copy.subtitle}</p>

        {/* Email comes from the invitation and cannot be changed */}
        <div className="form-row full">
          <TextField
            className="custom-textfield"
            size="small"
            label="Email"
            value={invite.email}
            disabled
            helperText="This is the email address your invitation was sent to."
            InputProps={adornment(Email)}
          />
        </div>

        {/* Name */}
        <div className="form-row desktop-two">
          <TextField
            {...fieldProps("first_name", "First name")}
            autoComplete="given-name"
            InputProps={adornment(Person)}
          />
          <TextField
            {...fieldProps("last_name", "Last name")}
            autoComplete="family-name"
            InputProps={adornment(Person)}
          />
        </div>

        {/* Phone */}
        <div className="form-row full">
          <TextField
            {...fieldProps("phone", "Phone number", "Include your country code if outside Australia")}
            autoComplete="tel"
            inputMode="tel"
            onChange={(e) => {
              if (/^[\d\s()+-]*$/.test(e.target.value)) {
                setField("phone", e.target.value);
              }
            }}
            InputProps={adornment(Phone)}
          />
        </div>

        {/* Agent details */}
        {role === ROLES.AGENT && (
          <>
            <div className="form-row full">
              <TextField
                {...fieldProps("agency_name", "Agency or business name")}
                autoComplete="organization"
                InputProps={adornment(Business)}
              />
            </div>
            <div className="form-row desktop-two">
              <Autocomplete
                options={COUNTRIES}
                value={values.country || null}
                onChange={(e, v) => setField("country", v || "")}
                onBlur={() => markTouched("country")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    className="custom-textfield"
                    size="small"
                    label="Country of business"
                    required
                    error={showError("country")}
                    helperText={showError("country") ? errors.country : " "}
                  />
                )}
              />
              <TextField
                {...fieldProps(
                  "business_number",
                  "ABN or business number",
                  "Optional. Your ABN if you have one",
                )}
                required={false}
              />
            </div>
          </>
        )}

        {/* Student details */}
        {role === ROLES.STUDENT && (
          <>
            <div className="form-row desktop-two">
              <TextField
                {...fieldProps("date_of_birth", "Date of birth")}
                type="date"
                autoComplete="bday"
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: new Date().toISOString().slice(0, 10) }}
                InputProps={adornment(Event)}
              />
              <Autocomplete
                options={COUNTRIES}
                value={values.country || null}
                onChange={(e, v) => setField("country", v || "")}
                onBlur={() => markTouched("country")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    className="custom-textfield"
                    size="small"
                    label="Country of citizenship"
                    required
                    error={showError("country")}
                    helperText={showError("country") ? errors.country : " "}
                  />
                )}
              />
            </div>
            {age !== null && age < 18 && (
              <p className="signup-note">
                You are under 18. The college will contact you about the extra
                requirements for students under 18.
              </p>
            )}
          </>
        )}

        {/* Password */}
        <div className="form-row desktop-two">
          <TextField
            {...fieldProps("password", "Password", "8+ characters, upper and lower case, a number and one of @ $ ! % * ? &")}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            InputProps={{
              ...adornment(Lock),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            {...fieldProps("confirmPassword", "Confirm password")}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            InputProps={adornment(Lock)}
          />
        </div>

        {/* Privacy consent */}
        <div className="signup-consent">
          <FormControlLabel
            control={
              <Checkbox
                checked={values.consent}
                onChange={(e) => {
                  setField("consent", e.target.checked);
                  markTouched("consent");
                }}
              />
            }
            label={CONSENT_TEXT}
          />
          {showError("consent") && (
            <FormHelperText error>{errors.consent}</FormHelperText>
          )}
        </div>

        <div className="button-group">
          <button type="submit" className="button-success">
            Create account
          </button>
        </div>

        <p className="signin-link">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </form>

      <CustomSnackbar {...snackbar} onClose={handleClose} />
      <LoadingSpinner open={loading} />
    </div>
  );
};

export default SignUp;

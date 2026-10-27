import React, { useState, useEffect, useRef } from "react";
import { Lock, Visibility, VisibilityOff, Email } from "@mui/icons-material";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/frogotPassword.css";
import AuthLogo from "../AuthLogo";
import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";

import { resetPassword, validateResetToken } from "../../services/authService";

import { useTranslation } from "react-i18next";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const ResetPassword = ({ onSignOut }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    showPassword: false,
    isValidUser: true,
    isPasswordValid: true,
    passwordMatch: true,
    check_email_Change: false,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showMessage = (message, severity) =>
    setSnackbar({ open: true, message, severity });

  // keep the latest onSignOut without re-running the effect below
  const signOutRef = useRef(onSignOut);
  useEffect(() => {
    signOutRef.current = onSignOut;
  }, [onSignOut]);

  // Read the link when the page opens
  useEffect(() => {
    // Anyone opening a reset link is signed out first (the saved theme is kept)
    localStorage.removeItem("Token");
    localStorage.removeItem("sessionTimestamp");
    if (signOutRef.current) signOutRef.current();

    let timer;
    const failAndRedirect = (message) => {
      showMessage(message, "error");
      setLoading(true);
      timer = setTimeout(() => {
        setLoading(false);
        navigate("/forgot-password");
      }, 2500);
    };

    const token = new URLSearchParams(location.search).get("token");

    if (!token) {
      failAndRedirect(t("reset_password_page.missingToken"));
      return () => clearTimeout(timer);
    }

    // The link holds a random one-time code. Ask the server whether it is
    // still valid and which account it belongs to.
    let cancelled = false;
    validateResetToken(token).then((res) => {
      if (cancelled) return;
      if (res.success) {
        setData((prev) => ({
          ...prev,
          email: res.data.email,
          isValidUser: true,
          check_email_Change: true,
        }));
      } else {
        failAndRedirect(res.message || t("reset_password_page.invalidToken"));
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [location.search, navigate, t]);

  const handleNewPasswordChange = (val) => {
    setData({
      ...data,
      password: val,
      isPasswordValid: PASSWORD_REGEX.test(val),
      passwordMatch: val === data.confirmPassword,
    });
  };

  const handleConfirmPasswordChange = (val) => {
    setData({
      ...data,
      confirmPassword: val,
      passwordMatch: val === data.password,
    });
  };

  const togglePasswordVisibility = () => {
    setData({ ...data, showPassword: !data.showPassword });
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault(); // form submit (also works with the Enter key)

    const isPasswordValid = PASSWORD_REGEX.test(data.password);
    const matchPassword = data.password === data.confirmPassword;

    setData({
      ...data,
      isPasswordValid,
      passwordMatch: matchPassword,
    });

    if (!isPasswordValid || !matchPassword) {
      showMessage(t("reset_password_page.fillValidFields"), "error");
      return;
    }

    const token = new URLSearchParams(location.search).get("token");

    if (!token) {
      showMessage(t("reset_password_page.missingToken"), "error");
      return;
    }

    try {
      setLoading(true);

      const response = await resetPassword(token, data.password);

      if (response.success) {
        showMessage(t("reset_password_page.resetSuccess"), "success");

        setData({
          email: "",
          password: "",
          confirmPassword: "",
          showPassword: false,
          isValidUser: true,
          isPasswordValid: true,
          passwordMatch: true,
          check_email_Change: false,
        });

        setTimeout(() => {
          navigate("/signin");
        }, 2500);
      } else {
        showMessage(t("reset_password_page.resetFailed"), "error");
      }
    } catch (error) {
      showMessage(t("reset_password_page.somethingWrong"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <div className="forgot-password-container">
      <form
        className="forgot-password-box"
        onSubmit={handlePasswordReset}
        noValidate
      >
        <AuthLogo />

        <h2>{t("reset_password_page.title")}</h2>
        <p className="auth-subtitle">
          {t(
            "reset_password_page.subtitle",
            "Choose a new password for your account.",
          )}
        </p>

        {/* Email (from the reset link, read only) */}
        <div className="input-container">
          <TextField
            size="small"
            label={t("reset_password_page.email")}
            type="email"
            fullWidth
            value={data.email}
            disabled
            margin="normal"
            variant="outlined"
            className="custom-textfield"
            error={!data.isValidUser}
            helperText={
              !data.isValidUser ? t("reset_password_page.emailError") : ""
            }
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
              endAdornment: data.check_email_Change ? (
                <InputAdornment position="end">
                  <span style={{ color: "green" }}>✔</span>
                </InputAdornment>
              ) : null,
            }}
          />
        </div>

        {/* New password */}
        <div className="input-container">
          <TextField
            className="custom-textfield"
            size="small"
            label={t("reset_password_page.newPassword")}
            type={data.showPassword ? "text" : "password"}
            autoComplete="new-password"
            fullWidth
            value={data.password}
            onChange={(e) => handleNewPasswordChange(e.target.value)}
            margin="normal"
            variant="outlined"
            error={!data.isPasswordValid}
            required
            helperText={
              !data.isPasswordValid
                ? t("reset_password_page.invalidPasswordStrength")
                : t("reset_password_page.passwordHint")
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={togglePasswordVisibility}
                    aria-label={
                      data.showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {data.showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </div>

        {/* Confirm password */}
        <div className="input-container">
          <TextField
            size="small"
            label={t("reset_password_page.confirmPassword")}
            type={data.showPassword ? "text" : "password"}
            autoComplete="new-password"
            fullWidth
            value={data.confirmPassword}
            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            margin="normal"
            variant="outlined"
            className="custom-textfield"
            error={!data.passwordMatch}
            helperText={
              !data.passwordMatch ? t("reset_password_page.passwordMismatch") : ""
            }
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
            }}
          />
        </div>

        <div className="button-group">
          <button type="submit" className="button-success">
            {t("reset_password_page.resetPassword")}
          </button>
        </div>

        <p className="signin-link">
          {t("reset_password_page.rememberedPassword")}{" "}
          <Link to="/signin">{t("reset_password_page.signIn")}</Link>
        </p>
      </form>

      <CustomSnackbar {...snackbar} onClose={handleClose} />
      <LoadingSpinner open={loading} />
    </div>
  );
};

export default ResetPassword;

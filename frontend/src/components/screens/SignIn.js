import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Visibility, VisibilityOff, Email } from "@mui/icons-material";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";

import "../styles/signIn.css";
import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";

import { loginUser } from "../../services/authService";
import { getHomeRoute } from "../../const/roles";

import { useTranslation } from "react-i18next";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignIn = ({ onSignIn }) => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: "",
    password: "",
    check_email_Change: false,
    secureTextEntry: true,
    isValidUser: true,
    isValidPassword: true,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showMessage = (message, severity) =>
    setSnackbar({ open: true, message, severity });

  const handleEmailChange = (val) => {
    const isValidEmail = EMAIL_REGEX.test(val);
    setData({
      ...data,
      email: val,
      check_email_Change: isValidEmail,
      isValidUser: isValidEmail,
    });
  };

  const handlePasswordChange = (val) => {
    setData({
      ...data,
      password: val,
      isValidPassword: val.trim().length >= 8,
    });
  };

  const togglePasswordVisibility = () => {
    setData({ ...data, secureTextEntry: !data.secureTextEntry });
  };

  const handleSignIn = async (e) => {
    e.preventDefault(); // form submit (also works with the Enter key)

    const isEmailValid = EMAIL_REGEX.test(data.email);
    const isPasswordValid = data.password.trim().length >= 8;

    setData({
      ...data,
      isValidUser: isEmailValid,
      isValidPassword: isPasswordValid,
    });

    if (!isEmailValid || !isPasswordValid) {
      showMessage(t("signin_page.validEmailPassword"), "error");
      return;
    }

    setLoading(true);

    try {
      const loginResponse = await loginUser({
        email: data.email.trim(),
        password: data.password,
      });

      if (!loginResponse.success) {
        setLoading(false);
        showMessage(
          loginResponse.message || t("signin_page.loginFailed"),
          "error",
        );
        return;
      }

      localStorage.setItem("Token", loginResponse.data.token);
      localStorage.setItem("sessionTimestamp", Date.now().toString());

      // App loads the profile and returns the user's role
      // (admin | agent | teacher | student)
      const role = await onSignIn();

      if (!role) {
        localStorage.removeItem("Token");
        localStorage.removeItem("sessionTimestamp");
        setLoading(false);
        showMessage(t("signin_page.unexpectedError"), "error");
        return;
      }

      showMessage(t("signin_page.loginSuccess"), "success");

      setTimeout(() => {
        setLoading(false);
        navigate(getHomeRoute(role), { replace: true });
      }, 800);
    } catch (error) {
      setLoading(false);
      showMessage(t("signin_page.unexpectedError"), "error");
      console.error("Login error:", error);
    }
  };

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <div className="signin-container">
      {/* Brand panel */}
      <div className="signin-brand">
        <img
          src="/assets/afc-logo-white.svg"
          alt="Australian Federation College"
          className="signin-brand-logo"
        />
        <p className="signin-brand-tagline">
          {t("signin_page.portalTagline", "Agent and student portal")}
        </p>
      </div>

      {/* Form */}
      <form className="signin-box" onSubmit={handleSignIn} noValidate>
        <h2>{t("signin_page.signIn")}</h2>
        <p className="signin-subtitle">
          {t("signin_page.subtitle", "Use your portal account to continue.")}
        </p>

        <div className="input-container">
          <TextField
            size="small"
            label={t("signin_page.email")}
            type="email"
            autoComplete="username"
            fullWidth
            value={data.email}
            onChange={(e) => handleEmailChange(e.target.value)}
            required
            margin="normal"
            variant="outlined"
            className="custom-textfield"
            error={!data.isValidUser}
            helperText={!data.isValidUser ? t("signin_page.emailError") : ""}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
              endAdornment: data.check_email_Change && (
                <InputAdornment position="end">
                  <span style={{ color: "green" }}>✔</span>
                </InputAdornment>
              ),
            }}
          />
        </div>

        <div className="input-container">
          <TextField
            size="small"
            label={t("signin_page.password")}
            type={data.secureTextEntry ? "password" : "text"}
            autoComplete="current-password"
            fullWidth
            value={data.password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            required
            margin="normal"
            variant="outlined"
            className="custom-textfield"
            error={!data.isValidPassword}
            helperText={
              !data.isValidPassword ? t("signin_page.invalidPassword") : ""
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
                      data.secureTextEntry ? "Show password" : "Hide password"
                    }
                  >
                    {data.secureTextEntry ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </div>

        <div className="button-group">
          <button type="submit" className="button-success">
            {t("signin_page.signIn")}
          </button>
        </div>

        <p className="forgot-password-link">
          {t("signin_page.forgotPassword")}{" "}
          <Link to="/forgot-password">{t("signin_page.resetIt")}</Link>
        </p>
        <p className="signup-link">
          {t(
            "signin_page.invitationOnly",
            "New here? Accounts are created from an invitation email sent by the college.",
          )}
        </p>
      </form>

      {/* Snackbar & Loading */}
      <CustomSnackbar {...snackbar} onClose={handleClose} />
      <LoadingSpinner open={loading} />
    </div>
  );
};

export default SignIn;

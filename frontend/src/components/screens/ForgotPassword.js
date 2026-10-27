import React, { useState } from "react";
import { Email } from "@mui/icons-material";

import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { Link, useNavigate } from "react-router-dom";
import "../styles/frogotPassword.css";
import AuthLogo from "../AuthLogo";
import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";

import { sendPasswordResetLink } from "../../services/authService";

import { useTranslation } from "react-i18next";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    email: "",
    isValidUser: true,
    check_email_Change: false,
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
      isValidUser: isValidEmail,
      check_email_Change: isValidEmail,
    });
  };

  // Sends the reset link to the user's email
  const handlePasswordReset = async (e) => {
    e.preventDefault(); // form submit (also works with the Enter key)

    const email = data.email.trim();
    const isValidEmail = EMAIL_REGEX.test(email);
    setData({
      ...data,
      isValidUser: isValidEmail,
      check_email_Change: isValidEmail,
    });

    if (!isValidEmail) {
      showMessage(t("frorgotPassword_page.enterValidEmail"), "error");
      return;
    }

    try {
      setLoading(true);

      const response = await sendPasswordResetLink(email);

      if (response.success) {
        showMessage(t("frorgotPassword_page.resetLinkSent"), "success");

        setData((prev) => ({
          ...prev,
          email: "",
          check_email_Change: false,
        }));

        // back to sign in after the message has been read
        setTimeout(() => {
          navigate("/signin");
        }, 2500);
      } else {
        showMessage(t("frorgotPassword_page.resetFailedLink"), "error");
      }
    } catch (error) {
      showMessage(t("frorgotPassword_page.somethingWrong"), "error");
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

        <h2>{t("frorgotPassword_page.forgotPasswordTitle")}</h2>
        <p className="auth-subtitle">
          {t(
            "frorgotPassword_page.subtitle",
            "Enter your email and we will send you a link to reset your password.",
          )}
        </p>

        <div className="input-container">
          <TextField
            size="small"
            label={t("frorgotPassword_page.email")}
            type="email"
            autoComplete="email"
            fullWidth
            value={data.email}
            onChange={(e) => handleEmailChange(e.target.value)}
            margin="normal"
            variant="outlined"
            className="custom-textfield"
            error={!data.isValidUser}
            helperText={
              !data.isValidUser ? t("frorgotPassword_page.emailError") : ""
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

        <div className="button-group">
          <button type="submit" className="button-success">
            {t("frorgotPassword_page.sendResetLink")}
          </button>
        </div>

        <p className="signin-link">
          {t("frorgotPassword_page.rememberedPassword")}{" "}
          <Link to="/signin">{t("frorgotPassword_page.signIn")}</Link>
        </p>
      </form>

      <CustomSnackbar {...snackbar} onClose={handleClose} />
      <LoadingSpinner open={loading} />
    </div>
  );
};

export default ForgotPassword;

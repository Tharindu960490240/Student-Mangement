import React, { useState } from "react";
import { Email } from "@mui/icons-material";

import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { Link, useNavigate } from "react-router-dom";
import "../styles/frogotPassword.css";
import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";

import { sendPasswordResetLink } from "../../services/authService";

import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
  const { t } = useTranslation();

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

  const navigate = useNavigate();

  // Handle Email Input Change
  const handleEmailChange = (val) => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    setData({
      ...data,
      email: val,
      isValidUser: isValidEmail,
      check_email_Change: isValidEmail,
    });
  };

  // Handle Password Reset (Only sending email for reset link)
  const handlePasswordReset = async () => {
    // 1. Basic validation

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
    setData({
      ...data,
      isValidUser: isValidEmail,
      check_email_Change: isValidEmail,
    });

    if (!isValidEmail) {
      setSnackbar({
        open: true,
        message: t("frorgotPassword_page.enterValidEmail"),
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      // 2. Call API
      const response = await sendPasswordResetLink(data.email);

      if (response.success) {
        setSnackbar({
          open: true,
          message: t("frorgotPassword_page.resetLinkSent"),
          severity: "success",
        });

        setData((prev) => ({
          ...prev,
          email: "",
          check_email_Change: false,
        }));

        // optional: redirect after delay
        setTimeout(() => {
          navigate("/signin");
        }, 2500);
      } else {
        setSnackbar({
          open: true,
          message: t("frorgotPassword_page.resetFailedLink"),
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: t("frorgotPassword_page.somethingWrong"),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Snackbar Close
  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <h2>{t("frorgotPassword_page.forgotPasswordTitle")}</h2>

        <div className="input-container">
          <TextField
            size="small"
            label={t("frorgotPassword_page.email")}
            type="email"
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

        {/* Reset Button */}
        <div className="button-group">
          <button className="button-success" onClick={handlePasswordReset}>
            {t("frorgotPassword_page.sendResetLink")}
          </button>
        </div>

        {/* Sign In Link */}
        <p className="signin-link">
          {t("frorgotPassword_page.rememberedPassword")}{" "}
          <Link to="/signin">{t("frorgotPassword_page.signIn")}</Link>
        </p>
      </div>

      {/* Snackbar */}
      <CustomSnackbar {...snackbar} onClose={handleClose} />
      <LoadingSpinner open={loading} />
    </div>
  );
};

export default ForgotPassword;

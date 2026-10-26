import React, { useState, useEffect, useCallback } from "react";
import { Lock, Visibility, VisibilityOff, Email } from "@mui/icons-material";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../styles/frogotPassword.css";
import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";

import { resetPassword } from "../../services/authService";

import { useTranslation } from "react-i18next";

const ResetPassword = ({ onSignOut }) => {
  const { t } = useTranslation();

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

  const navigate = useNavigate();
  const location = useLocation();

  const stableOnSignOut = useCallback(() => {
    if (onSignOut) {
      onSignOut();
    }
  }, [onSignOut]);

  useEffect(() => {
    const clearLocalStorage = async () => {
      localStorage.clear();
      stableOnSignOut();
    };

    clearLocalStorage();

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const { email, exp } = decoded;

        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (exp < currentTime) {
          setSnackbar({
            open: true,
            message: t("reset_password_page.tokenExpired"),
            severity: "error",
          });
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            navigate("/forgot-password");
          }, 2500);
          return;
        }

        // Set email and disable the field
        setData((prevData) => ({
          ...prevData,
          email: email,
          isValidUser: true,
          check_email_Change: true,
        }));
      } catch (error) {
        setSnackbar({
          open: true,
          message: t("reset_password_page.invalidToken"),
          severity: "error",
        });
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          navigate("/forgot-password");
        }, 2500);
      }
    }
  }, [location.search, navigate, stableOnSignOut, t]);

  // Handle New Password Input Change
  const handleNewPasswordChange = (val) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const isPasswordValid = passwordRegex.test(val);
    setData({
      ...data,
      password: val,
      isPasswordValid: isPasswordValid,
      passwordMatch: val === data.confirmPassword,
    });
  };

  // Handle Confirm Password Input Change
  const handleConfirmPasswordChange = (val) => {
    setData({
      ...data,
      confirmPassword: val,
      passwordMatch: val === data.password,
    });
  };

  // Toggle Password Visibility
  const togglePasswordVisibility = () => {
    setData({
      ...data,
      showPassword: !data.showPassword,
    });
  };

  // Handle Password Reset
  const handlePasswordReset = async () => {
    const isPasswordValid =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        data.password,
      );
    const matchPassword = data.password === data.confirmPassword;

    // Update the state with validation results
    setData({
      ...data,
      isPasswordValid: isPasswordValid,
      passwordMatch: matchPassword,
    });

    if (!isPasswordValid || !matchPassword) {
      setSnackbar({
        open: true,
        message: t("reset_password_page.fillValidFields"),
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      // 2. Get token from URL
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get("token");

      if (!token) {
        setSnackbar({
          open: true,
          message: t("reset_password_page.missingToken"),
          severity: "error",
        });
        return;
      }

      // 3. Call API
      const response = await resetPassword(token, data.password);

      if (response.success) {
        setSnackbar({
          open: true,
          message: t("reset_password_page.resetSuccess"),
          severity: "success",
        });

        // clear state
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

        // redirect to login
        setTimeout(() => {
          navigate("/signin");
        }, 2500);
      } else {
        setSnackbar({
          open: true,
          message: t("reset_password_page.resetFailed"),
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: t("reset_password_page.somethingWrong"),
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
        <h2>{t("reset_password_page.title")}</h2>

        {/* Email Input */}
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
            helperText={!data.isValidUser ? t("reset_password_page.emailError") : ""}
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

        {/* New Password Input */}
        <div className="input-container">
          <TextField
            className="custom-textfield"
            size="small"
            label={t("reset_password_page.newPassword")}
            type={data.showPassword ? "text" : "password"}
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
                  <IconButton onClick={togglePasswordVisibility}>
                    {data.showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </div>

        {/* Confirm Password Input */}
        <div className="input-container">
          <TextField
            size="small"
            label={t("reset_password_page.confirmPassword")}
            type={data.showPassword ? "text" : "password"}
            fullWidth
            value={data.confirmPassword}
            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            margin="normal"
            variant="outlined"
            className="custom-textfield"
            error={!data.passwordMatch}
            helperText={!data.passwordMatch ? t("reset_password_page.passwordMismatch") : ""}
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
          {/* Reset Button */}
          <button className="button-success" onClick={handlePasswordReset}>
            {t("reset_password_page.resetPassword")}
          </button>
        </div>

        {/* Sign In Link */}
        <p className="signin-link">
          {t("reset_password_page.rememberedPassword")} <Link to="/signin">{t("reset_password_page.signIn")}</Link>
        </p>
      </div>

      {/* Snackbar */}
      <CustomSnackbar {...snackbar} onClose={handleClose} />
      <LoadingSpinner open={loading} />
    </div>
  );
};

export default ResetPassword;

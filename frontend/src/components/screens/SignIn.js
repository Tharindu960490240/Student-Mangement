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

import { useTranslation } from "react-i18next";
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

  const handleEmailChange = (val) => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    setData({
      ...data,
      email: val,
      check_email_Change: isValidEmail,
      isValidUser: isValidEmail,
    });
  };

  const handlePasswordChange = (val) => {
    const isPasswordValid = val.trim().length >= 8;
    setData({
      ...data,
      password: val,
      isValidPassword: isPasswordValid,
    });
  };

  const togglePasswordVisibility = () => {
    setData({
      ...data,
      secureTextEntry: !data.secureTextEntry,
    });
  };

  const handleSignIn = async () => {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
    const isPasswordValid = data.password.trim().length >= 8;

    // Update validation state
    setData({
      ...data,
      isValidUser: isEmailValid,
      isValidPassword: isPasswordValid,
    });

    if (!isEmailValid || !isPasswordValid) {
      setSnackbar({
        open: true,
        message: t("signin_page.validEmailPassword"),
        severity: "error",
      });
      return;
    }

    setLoading(true);
    // Proceed to login if both email and password are valid

    try {
      const loginResponse = await loginUser({
        email: data.email,
        password: data.password,
      });
      if (loginResponse.success) {
        const currentTime = new Date().getTime();

        // Store the token and key in AsyncStorage
        await localStorage.setItem("Token", loginResponse.data.token);
        await localStorage.setItem("sessionTimestamp", currentTime.toString());

        setSnackbar({
          open: true,
          message: t("signin_page.loginSuccess"),
          severity: "success",
        });

        // Call onSignIn to update the parent state and navigate to home
        setTimeout(() => {
          setLoading(false);
          onSignIn();
          navigate("/home");
        }, 2500);
      } else {
        // Handle unsuccessful login attempt
        setLoading(false);
        setSnackbar({
          open: true,
          message: loginResponse.message || t("signin_page.loginFailed"),
          severity: "error",
        });
      }
    } catch (error) {
      // Handle any errors during the login process
      setLoading(false);
      setSnackbar({
        open: true,
        message: t("signin_page.unexpectedError"),
        severity: "error",
      });
      console.error("Login error:", error);
    }
  };

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <div className="signin-container">
      {/* Logo */}
      <div className="signin-logo"></div>

      {/* Form */}
      <div className="signin-box">
        <h2>{t("signin_page.signIn")}</h2>

        <div className="input-container">
          <TextField
            size="small"
            label={t("signin_page.email")}
            type="email"
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
                  <IconButton onClick={togglePasswordVisibility}>
                    {data.secureTextEntry ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </div>

        <div className="button-group">
          <button onClick={handleSignIn} className="button-success">
            {t("signin_page.signIn")}
          </button>
        </div>
        <p className="forgot-password-link">
          {t("signin_page.forgotPassword")}{" "}
          <Link to="/forgot-password">{t("signin_page.resetIt")}</Link>
        </p>
        <p className="signup-link">
          {t("signin_page.dontHaveAccount")}{" "}
          <Link to="/signup">{t("signin_page.signUp")}</Link>
        </p>
      </div>

      {/* Snackbar & Loading */}
      <CustomSnackbar {...snackbar} onClose={handleClose} />
      <LoadingSpinner open={loading} />
    </div>
  );
};

export default SignIn;

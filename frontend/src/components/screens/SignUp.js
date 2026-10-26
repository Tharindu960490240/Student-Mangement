import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Person,
  Lock,
  Phone,
  Visibility,
  VisibilityOff,
  Email,
  Close,
} from "@mui/icons-material";

import {
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import "../styles/signUp.css";

import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";

import { registerUser } from "../../services/authService";

import { useTranslation } from "react-i18next";

const SignUp = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const initialUserData = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    showPassword: false,
    isValidFirstName: true,
    isValidLastName: true,
    isValidEmail: true,
    isValidPhone: true,
    isValidPassword: true,
    passwordMatch: true,
  };

  const [userData, setUserData] = useState(initialUserData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    clearData();
    setLoading(false);
    navigate("/home");
  };

  // ================= VALIDATIONS =================

  const handleEmailChange = (val) => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    setUserData({ ...userData, email: val, isValidEmail });
  };

  const handleFirstNameChange = (val) => {
    const isValidFirstName =
      /^[A-Za-z\u0D80-\u0DFF\p{L}]+(?:\s[A-Za-z\u0D80-\u0DFF\p{L}]+)*$/u.test(
        val,
      );
    setUserData({ ...userData, first_name: val, isValidFirstName });
  };

  const handleLastNameChange = (val) => {
    const isValidLastName =
      /^[A-Za-z\u0D80-\u0DFF\p{L}]+(?:\s[A-Za-z\u0D80-\u0DFF\p{L}]+)*$/u.test(
        val,
      );
    setUserData({ ...userData, last_name: val, isValidLastName });
  };

  const handleContactNoChange = (val) => {
    const isValidPhone = /^\d{10}$/.test(val);
    setUserData({ ...userData, phone: val, isValidPhone });
  };

  const handlePasswordChange = (val) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const isValidPassword = passwordRegex.test(val);
    const passwordMatch = val === userData.confirmPassword;

    setUserData({
      ...userData,
      password: val,
      isValidPassword,
      passwordMatch,
    });
  };
  const handleConfirmPasswordChange = (val) => {
    const passwordMatch = val === userData.password;
    setUserData({ ...userData, confirmPassword: val, passwordMatch });
  };

  const togglePasswordVisibility = () => {
    setUserData({ ...userData, showPassword: !userData.showPassword });
  };

  const clearData = () => {
    setUserData(initialUserData);
  };

  const handleUserFormSubmit = async () => {
    const isFirstNameValid =
      /^[A-Za-z\u0D80-\u0DFF\p{L}]+(?:\s[A-Za-z\u0D80-\u0DFF\p{L}]+)*$/u.test(
        userData.first_name,
      ) && userData.first_name.length > 0;
    const isLastNameValid =
      /^[A-Za-z\u0D80-\u0DFF\p{L}]+(?:\s[A-Za-z\u0D80-\u0DFF\p{L}]+)*$/u.test(
        userData.last_name,
      ) && userData.last_name.length > 0;

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email);
    const isContactNoValid = /^\d{10}$/.test(userData.phone);

    const isPasswordValid =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        userData.password,
      );
    const matchPassword = userData.password === userData.confirmPassword;

    // Update the state with validation results
    setUserData({
      ...userData,
      isValidFirstName: isFirstNameValid,
      isValidLastName: isLastNameValid,
      isValidEmail: isEmailValid,
      isValidPhone: isContactNoValid,
      isValidPassword: isPasswordValid,
      passwordMatch: matchPassword,
    });

    if (
      !isFirstNameValid ||
      !isLastNameValid ||
      !isEmailValid ||
      !isContactNoValid ||
      !isPasswordValid ||
      !matchPassword
    ) {
      setSnackbar({
        open: true,
        message: t("signup_page.fillValidFields"),
        severity: "error",
      });
      return;
    }

    setLoading(true);

    // Proceed with user creation if all validations pass
    try {
      const result = await registerUser(userData);
      if (result.success) {
        setSnackbar({
          open: true,
          message: t("signup_page.accountCreatedSuccess"),
          severity: "success",
        });
        setDialogOpen(true);
      } else {
        setLoading(false);
        setSnackbar({
          open: true,
          message: t("signup_page.accountCreateFailed"),
          severity: "error",
        });
      }
    } catch (error) {
      setLoading(false);
      setSnackbar({
        open: true,
        message: t("signup_page.accountError"),
        severity: "error",
      });
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>{t("signup_page.signUpTitle")}</h2>

        {/* Name */}
        <div className="form-row desktop-two mobile-full">
          <TextField
            className="custom-textfield"
            size="small"
            label={t("signup_page.firstName")}
            value={userData.first_name}
            onChange={(e) => handleFirstNameChange(e.target.value)}
            required
            error={!userData.isValidFirstName}
            helperText={
              !userData.isValidFirstName
                ? t("signup_page.firstNameError")
                : t("signup_page.firstNameHint")
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            className="custom-textfield"
            size="small"
            label={t("signup_page.lastName")}
            value={userData.last_name}
            onChange={(e) => handleLastNameChange(e.target.value)}
            required
            error={!userData.isValidLastName}
            helperText={
              !userData.isValidLastName
                ? t("signup_page.lastNameError")
                : t("signup_page.lastNameHint")
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            }}
          />
        </div>

        {/* Email & Contact */}
        <div className="form-row desktop-two mobile-full">
          <TextField
            className="custom-textfield"
            size="small"
            label={t("signup_page.email")}
            value={userData.email}
            onChange={(e) => handleEmailChange(e.target.value)}
            required
            error={!userData.isValidEmail}
            helperText={
              !userData.isValidEmail
                ? t("signup_page.emailError")
                : t("signup_page.emailHint")
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            className="custom-textfield"
            size="small"
            label={t("signup_page.contactNo")}
            value={userData.phone}
            onChange={(e) => {
              if (/^\d*$/.test(e.target.value)) {
                handleContactNoChange(e.target.value);
              }
            }}
            required
            error={!userData.isValidPhone}
            helperText={
              !userData.isValidPhone
                ? t("signup_page.contactError")
                : t("signup_page.contactHint")
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone />
                </InputAdornment>
              ),
            }}
          />
        </div>

        {/* Password */}
        <div className="form-row desktop-two mobile-full">
          <TextField
            className="custom-textfield"
            size="small"
            label={t("signup_page.newPassword")}
            type={userData.showPassword ? "text" : "password"}
            value={userData.password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            required
            error={!userData.isValidPassword}
            helperText={
              !userData.isValidPassword
                ? t("signup_page.invalidPasswordStrength")
                : t("signup_page.passwordHintSignup")
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
                    {userData.showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            className="custom-textfield"
            size="small"
            label={t("signup_page.confirmPassword")}
            type={userData.showPassword ? "text" : "password"}
            value={userData.confirmPassword}
            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            required
            error={!userData.passwordMatch}
            helperText={
              !userData.passwordMatch ? t("signup_page.passwordMismatch") : ""
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
            }}
          />
        </div>

        {/* Buttons */}
        <div className="button-group">
          <button onClick={handleUserFormSubmit} className="button-success">
            {t("signup_page.createAccount")}
          </button>

          <button onClick={clearData} className="button-error">
            {t("signup_page.cancel")}
          </button>
        </div>

        <p className="signin-link">
          {t("signup_page.alreadyHaveAccount")}{" "}
          <Link to="/signin">{t("signup_page.signInLink")}</Link>
        </p>

        <p className="signin-link">
          <Link onClick={() => setHelpDialogOpen(true)}>
            {" "}
            {t("signup_page.help_dialog.title")}
          </Link>
        </p>
      </div>

      <CustomSnackbar {...snackbar} onClose={handleClose} />
      <LoadingSpinner open={loading} />
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {t("signup_page.verifyEmailTitle")}
          <IconButton
            onClick={handleDialogClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <DialogContentText>
            {t("signup_page.verifyEmailText1")}
            <br />
            <br />
            {t("signup_page.verifyEmailText2")}
            <br />
            <br />
            {t("signup_page.verifyEmailText3")}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}></DialogActions>
      </Dialog>

      <Dialog
        open={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {t("signup_page.help_dialog.title")}{" "}
          <IconButton
            onClick={() => setHelpDialogOpen(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText>
            <DialogContentText style={{ fontWeight: "bold" }}>
              {t("signup_page.help_dialog.step1_title")}
            </DialogContentText>
            {t("signup_page.help_dialog.step1_text")}
            <br />
            <br />
            <DialogContentText style={{ fontWeight: "bold" }}>
              {" "}
              {t("signup_page.help_dialog.step2_title")}
            </DialogContentText>
            {t("signup_page.help_dialog.step2_text")}
            {t("signup_page.help_dialog.password_examples")}
            <br />
            <br />
            <DialogContentText style={{ fontWeight: "bold" }}>
              {" "}
              {t("signup_page.help_dialog.step3_title")}
            </DialogContentText>
            {t("signup_page.help_dialog.step3_text")}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}></DialogActions>
      </Dialog>
    </div>
  );
};

export default SignUp;

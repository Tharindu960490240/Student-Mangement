import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle, ErrorOutline } from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";

import AuthLogo from "../AuthLogo";
import { verifyEmail } from "../../services/authService";

import "../styles/verifyAccount.css";

import { useTranslation } from "react-i18next";

const VerifyAccount = () => {
  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();

  // "verifying" | "success" | "error"
  const [status, setStatus] = useState("verifying");

  // React StrictMode runs effects twice in development. The link must only
  // be used once, otherwise the second call fails and shows a false error.
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyUser = async () => {
      try {
        const result = await verifyEmail(token);
        setStatus(result.success ? "success" : "error");
      } catch (err) {
        setStatus("error");
      }
    };

    verifyUser();
  }, [token]);

  // After a successful verification, continue to sign in
  useEffect(() => {
    if (status !== "success") return;

    const timer = setTimeout(() => {
      navigate("/signin", { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [status, navigate]);

  return (
    <div className="verify-container">
      <div className="verify-box">
        <AuthLogo />

        {status === "verifying" && (
          <>
            <CircularProgress size={40} thickness={4} />
            <h2 className="verify-title">
              {t("verify_account_page.verifyingAccount")}
            </h2>
            <p className="verify-subtext">
              {t("verify_account_page.verifySubtext")}
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="verify-icon verify-icon-success" />
            <h2 className="verify-title">
              {t("verify_account_page.successTitle", "Email verified")}
            </h2>
            <p className="verify-subtext">
              {t("verify_account_page.verifySuccess")}
            </p>
            <Link to="/signin" className="button-success verify-button">
              {t("verify_account_page.goToSignIn", "Go to sign in")}
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <ErrorOutline className="verify-icon verify-icon-error" />
            <h2 className="verify-title">
              {t("verify_account_page.errorTitle", "Verification failed")}
            </h2>
            <p className="verify-subtext">
              {t("verify_account_page.verifyFailed")}
            </p>
            <Link to="/signin" className="button-success verify-button">
              {t("verify_account_page.goToSignIn", "Go to sign in")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyAccount;

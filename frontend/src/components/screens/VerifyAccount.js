import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";

import { verifyEmail } from "../../services/authService";
import { ROUTES } from "../../const/const";

import "../styles/verifyAccount.css";

import { useTranslation } from "react-i18next";

const VerifyAccount = () => {
  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    const verifyUser = async () => {
      setLoading(true);

      try {
        const result = await verifyEmail(token);

        if (result.success) {
          setSnackbar({
            open: true,
            message: t("verify_account_page.verifySuccess"),
            severity: "success",
          });
        } else {
          setSnackbar({
            open: true,
            message: t("verify_account_page.verifyFailed"),
            severity: "error",
          });
        }
      } catch (err) {
        setSnackbar({
          open: true,
          message: t("verify_account_page.verifyError"),
          severity: "error",
        });
      } finally {
        setLoading(false);

        setTimeout(() => {
          navigate(ROUTES.HOME);
        }, 2500);
      }
    };

    verifyUser();
  }, [token, navigate, t]);

  return (
    <div className="verify-container">
      <div className="verify-box">
        <h2 className="verify-title">{t("verify_account_page.verifyingAccount")}</h2>

        <p className="verify-subtext">{t("verify_account_page.verifySubtext")}</p>

        {/* Spinner */}
        <LoadingSpinner open={loading} />

        {/* Snackbar */}
        <CustomSnackbar {...snackbar} onClose={handleClose} />
      </div>
    </div>
  );
};

export default VerifyAccount;

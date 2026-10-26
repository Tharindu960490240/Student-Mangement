import * as React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Fade from "@mui/material/Fade";

import "../styles/loadingSpinner.css";

import { useTranslation } from "react-i18next";

const LoadingSpinner = ({ open }) => {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      closeAfterTransition
      disableAutoFocus
      disableEnforceFocus
      disableRestoreFocus
      slotProps={{
        backdrop: {
          className: "loading-modal-backdrop",
        },
      }}
    >
      <Fade in={open}>
        <Box className="loading-spinner-box">
          <CircularProgress size={42} thickness={4} />

          <Typography className="loading-text">{t("loading")}</Typography>
        </Box>
      </Fade>
    </Modal>
  );
};

export default LoadingSpinner;

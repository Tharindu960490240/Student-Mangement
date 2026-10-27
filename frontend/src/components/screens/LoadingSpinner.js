import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";

import "../styles/loadingSpinner.css";

import { useTranslation } from "react-i18next";

const ICON = `${process.env.PUBLIC_URL || ""}/assets/afc-icon.svg`;
const ICON_WHITE = `${process.env.PUBLIC_URL || ""}/assets/afc-icon-white.svg`;

// Same props as before: <LoadingSpinner open={loading} />
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
        <Box
          className="loading-spinner-box"
          role="status"
          aria-live="polite"
        >
          <div className="afc-loader">
            <span className="afc-loader-glow" />
            <span className="afc-loader-ring" />
            <span className="afc-loader-ring afc-loader-ring-slow" />
            <img
              className="afc-loader-icon afc-loader-icon-light"
              src={ICON}
              alt=""
            />
            <img
              className="afc-loader-icon afc-loader-icon-dark"
              src={ICON_WHITE}
              alt=""
            />
          </div>

          <p className="loading-text">
            {t("loading", { defaultValue: "Loading" })}
            <span className="loading-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </p>
        </Box>
      </Fade>
    </Modal>
  );
};

export default LoadingSpinner;

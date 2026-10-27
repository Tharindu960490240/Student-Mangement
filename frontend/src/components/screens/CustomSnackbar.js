import React from "react";
import Snackbar from "@mui/material/Snackbar";
import Slide from "@mui/material/Slide";
import IconButton from "@mui/material/IconButton";
import {
  CheckCircleRounded,
  ErrorRounded,
  WarningAmberRounded,
  InfoRounded,
  CloseRounded,
} from "@mui/icons-material";

import "../styles/customSnackbar.css";

const AUTO_HIDE = 4000;

const VARIANTS = {
  success: { title: "Success", Icon: CheckCircleRounded },
  error: { title: "Something went wrong", Icon: ErrorRounded },
  warning: { title: "Please note", Icon: WarningAmberRounded },
  info: { title: "Information", Icon: InfoRounded },
};

const slideFromRight = (props) => <Slide {...props} direction="left" />;

// Same props as before:
//   <CustomSnackbar open severity message onClose anchorOrigin />
const CustomSnackbar = ({
  open,
  severity = "info",
  message,
  onClose,
  anchorOrigin = { vertical: "top", horizontal: "right" },
}) => {
  const { title, Icon } = VARIANTS[severity] || VARIANTS.info;

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return; // a stray click should not hide the message
    if (onClose) onClose(event, reason);
  };

  return (
    <Snackbar
      anchorOrigin={anchorOrigin}
      open={open}
      autoHideDuration={AUTO_HIDE}
      onClose={handleClose}
      TransitionComponent={slideFromRight}
    >
      <div className={`afc-toast afc-toast-${severity}`} role="alert">
        <span className="afc-toast-icon">
          <Icon fontSize="small" />
        </span>

        <div className="afc-toast-body">
          <strong className="afc-toast-title">{title}</strong>
          <span className="afc-toast-message">{message}</span>
        </div>

        <IconButton
          size="small"
          className="afc-toast-close"
          aria-label="Close"
          onClick={(e) => handleClose(e, "closeButton")}
        >
          <CloseRounded fontSize="small" />
        </IconButton>

        {/* shrinking bar = time left before the message hides */}
        <span
          className="afc-toast-progress"
          style={{ animationDuration: `${AUTO_HIDE}ms` }}
        />
      </div>
    </Snackbar>
  );
};

export default CustomSnackbar;

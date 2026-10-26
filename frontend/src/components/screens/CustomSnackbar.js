import React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const CustomSnackbar = ({
  open,
  severity,
  message,
  onClose,
  anchorOrigin = { vertical: "top", horizontal: "right" }, // default value
}) => {
  return (
    <Snackbar
      anchorOrigin={anchorOrigin}
      open={open}
      autoHideDuration={3500}
      onClose={onClose}
    >
      <Alert onClose={onClose} severity={severity} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackbar;

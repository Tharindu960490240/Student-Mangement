import React from "react";
import "./styles/authLogo.css";

// College logo for the public auth pages (one image per theme)
const AuthLogo = () => (
  <>
    <img
      src="/assets/afc-logo.svg"
      alt="Australian Federation College"
      className="auth-logo auth-logo-light"
    />
    <img
      src="/assets/afc-logo-white.svg"
      alt="Australian Federation College"
      className="auth-logo auth-logo-dark"
    />
  </>
);

export default AuthLogo;

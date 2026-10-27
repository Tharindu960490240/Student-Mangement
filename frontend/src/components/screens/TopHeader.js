import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, IconButton } from "@mui/material";

import { Logout, Menu, LightMode, DarkMode } from "@mui/icons-material";

import "../styles/topHeader.css";

import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";

import { get_token, getProfile } from "../../services/authService";
import { TOGGLE_SIDE_NAV } from "../SideNav";
import { getHomeRoute, normalizeRole, ROLE_LABELS } from "../../const/roles";

import { useTranslation } from "react-i18next";

const TopHeader = ({ onSignOut, isSignedIn }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [openMenu, setOpenMenu] = useState(false);
  const profileRef = useRef();

  const [user, setUser] = useState(null);

  const [darkMode, setDarkMode] = useState(
    document.documentElement.getAttribute("data-theme") === "dark",
  );

  // Role helpers (admin | agent | teacher | student)
  const role = normalizeRole(user?.role);
  const roleLabel = ROLE_LABELS[role];
  const dashboardPath = getHomeRoute(role);

  const userInitial = user?.first_name
    ? user.first_name.charAt(0).toUpperCase()
    : "";

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.setAttribute(
      "data-theme",
      newMode ? "dark" : "light",
    );
    localStorage.setItem("theme", newMode ? "dark" : "light"); // remembered after refresh
  };

  // English only
  useEffect(() => {
    i18n.changeLanguage("en");
  }, [i18n]);

  // Logo goes to the role home when signed in, otherwise to sign in
  const homePath = isSignedIn ? dashboardPath : "/signin";

  const goTo = (path) => {
    navigate(path);
    setOpenMenu(false);
  };

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleLogout = () => {
    localStorage.removeItem("Token");
    localStorage.removeItem("sessionTimestamp");

    setLoading(true);
    setSnackbar({
      open: true,
      message: t("header.logoutSuccess"),
      severity: "success",
    });

    setTimeout(() => {
      setLoading(false);
      setOpenMenu(false);
      setUser(null);
      onSignOut();
      navigate("/signin");
    }, 800);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 800) setOpenMenu(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Load the signed-in user's profile
  useEffect(() => {
    const fetchUserData = async () => {
      const saved_token = await get_token();
      if (!saved_token) {
        setUser(null);
        return;
      }

      try {
        const res = await getProfile(saved_token);
        setUser(res.success ? res.user : null);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserData();

    window.addEventListener("profileUpdated", fetchUserData);
    return () => window.removeEventListener("profileUpdated", fetchUserData);
  }, [isSignedIn]);

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="header">
        {/* LEFT: menu button (phones) + logo */}
        <div className="header-left">
          {isSignedIn && (
            <button
              type="button"
              className="mobile-menu-icon"
              aria-label="Open menu"
              onClick={() => window.dispatchEvent(new Event(TOGGLE_SIDE_NAV))}
            >
              <Menu />
            </button>
          )}
          <img
            src={
              darkMode ? "/assets/afc-logo-white.svg" : "/assets/afc-logo.svg"
            }
            alt="Australian Federation College"
            className="logo-img"
            onClick={() => goTo(homePath)}
          />
        </div>

        <div className="header-center" />

        {/* RIGHT SIDE */}
        <div className="header-right">
          {/* THEME */}
          <IconButton
            className="theme-icon-btn"
            onClick={toggleDarkMode}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            title={darkMode ? "Light mode" : "Dark mode"}
          >
            {darkMode ? <LightMode /> : <DarkMode />}
          </IconButton>

          {/* PROFILE DROPDOWN */}
          {isSignedIn && (
            <div
              className="profile-section"
              ref={profileRef}
              onClick={() => setOpenMenu(!openMenu)}
            >
              <Avatar
                src={user?.profile_image || undefined}
                className="profile-avatar"
              >
                {userInitial}
              </Avatar>
              <span className="header-name">
                {t("header.welcome")}, {user?.first_name}
              </span>

              {openMenu && (
                <div className="dropdown-menu">
                  <div className="dropdown-user">
                    <strong>
                      {user?.first_name} {user?.last_name}
                    </strong>
                    {roleLabel && (
                      <span>{t(`roles.${role}`, roleLabel)}</span>
                    )}
                  </div>

                  <div className="dropdown-item" onClick={handleLogout}>
                    <Logout /> {t("header.logout")}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <CustomSnackbar {...snackbar} onClose={handleClose} />
      <LoadingSpinner open={loading} />
    </>
  );
};

export default TopHeader;

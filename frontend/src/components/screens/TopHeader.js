import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Switch, Avatar, Badge } from "@mui/material";

import {
  Home,
  Dashboard,
  AddCircle,
  Login,
  PersonAdd,
  Logout,
  AccountCircle,
  Menu,
  Close,
  BorderColor,
  LightMode,
  DarkMode,
  People,
  Category,
  Bookmark,
  Notifications,
  ChatBubble,
  Language,
} from "@mui/icons-material";

import "../styles/topHeader.css";
import "../styles/modal.css";

import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";

import * as AppConst from "../../const/const";

import { get_token, getProfile } from "../../services/authService";
import { getSavedAds } from "../../services/savedAdService";
import { getNotificationsCount } from "../../services/notificationService";

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
  const [mobileMenu, setMobileMenu] = useState(false);
  const profileRef = useRef();

  const [notificationCount, setNotificationCount] = useState(0);

  const [savedCount, setSavedCount] = useState(0);

  const [user, setUser] = useState(null);

  const [darkMode, setDarkMode] = useState(
    document.documentElement.getAttribute("data-theme") === "dark",
  );

  const [language, setLanguage] = useState(
    document.documentElement.getAttribute("language") || "en",
  );

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.setAttribute(
      "data-theme",
      newMode ? "dark" : "light",
    );
  };

  const toggleLanguage = () => {
    const newLang = language === "en" ? "si" : "en";
    setLanguage(newLang);
    document.documentElement.setAttribute("language", newLang);
  };

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const goTo = (path) => {
    navigate(path);
    setMobileMenu(false);
    setOpenMenu(false);
  };

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleLogout = () => {
    localStorage.clear();

    setLoading(true);
    setSnackbar({
      open: true,
      message: t("header.logoutSuccess"),
      severity: "success",
    });

    setTimeout(() => {
      setLoading(false);
      setMobileMenu(false);
      setOpenMenu(false);
      setUser(null);
      onSignOut();
      navigate("/home");
    }, 2500);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 800) {
        setMobileMenu(false);
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const saved_token = await get_token();
      if (!saved_token) return;

      try {
        const res = await getProfile(saved_token);

        if (res.success) {
          const user = res.user;
          setUser(user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserData();

    window.addEventListener("profileUpdated", fetchUserData);

    return () => window.removeEventListener("profileUpdated", fetchUserData);
  }, [isSignedIn]);

  const fetchSavedAds = useCallback(async () => {
    try {
      const token = await get_token();
      if (!token) return;

      const res = await getSavedAds(token);

      if (res?.success) {
        setSavedCount(res.total || res.data?.length || 0);
      } else {
        setSavedCount(0);
      }
    } catch (err) {
      console.error(err);
      setSavedCount(0);
    }
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      fetchSavedAds();
      window.addEventListener("savedChanged", fetchSavedAds);

      return () => window.removeEventListener("savedChanged", fetchSavedAds);
    }
  }, [fetchSavedAds, isSignedIn]);

  const fetchNotificationsCount = useCallback(async () => {
    try {
      const token = await get_token();
      if (!token) return;

      const res = await getNotificationsCount(token);

      if (res?.success) {
        setNotificationCount(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      fetchNotificationsCount();

      // refresh when new notification comes
      window.addEventListener("notificationUpdated", fetchNotificationsCount);

      return () =>
        window.removeEventListener(
          "notificationUpdated",
          fetchNotificationsCount,
        );
    }
  }, [fetchNotificationsCount, isSignedIn]);

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="header">
        {/* LEFT LOGO */}
        <div className="header-left" onClick={() => goTo("/")}>
          <img
            src={
              darkMode
                ? "/assets/navbar_logo_d.png"
                : "/assets/navbar_logo.png"
            }
            alt="logo"
            className="logo-img"
          />
        </div>

        {/* CENTER NAV */}
        <div className="header-center">
          <div className="nav-item" onClick={() => goTo("/")}>
            <Home /> {t("header.home")}
          </div>

          {isSignedIn && user?.role === "user" && (
            <div
              className="nav-item highlight"
              onClick={() => goTo("/post-ad")}
            >
              <AddCircle />{" "}
              <span style={{ marginBottom: "2px" }}>{t("header.postAd")}</span>
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="header-right">
          {/* NOTIFICATION */}
          {isSignedIn && (
            <div
              className="nav-item notification"
              onClick={() => goTo("/support")}
            >
              <Badge color="error" badgeContent={notificationCount} max={99}>
                <Notifications />
              </Badge>
            </div>
          )}

          {/* MOBILE ICON */}
          <div className="mobile-menu-icon" onClick={() => setMobileMenu(true)}>
            <Menu />
          </div>

          {/* NOT LOGGED IN */}
          {!isSignedIn && (
            <>
              <button
                className="hide-in-mobile"
                onClick={() => goTo("/signin")}
              >
                <Login /> <span>{t("header.signIn")}</span>
              </button>

              <button
                className="primary hide-in-mobile"
                onClick={() => goTo("/signup")}
              >
                <PersonAdd /> <span>{t("header.signUp")}</span>
              </button>
            </>
          )}
          {/* DARK MODE INSIDE DROPDOWN */}
          <div className="nav-item toggle-theme hide-in-mobile">
            <LightMode />
            <Switch
              checked={darkMode}
              onChange={toggleDarkMode}
              color="primary"
            />
            <DarkMode />
          </div>

          <div className="nav-item hide-in-mobile" onClick={toggleLanguage}>
            <Language />
            {language === "en" ? "සිංහල" : "English"}
          </div>

          {/* PROFILE DROPDOWN */}
          {isSignedIn && (
            <div
              className="profile-section"
              ref={profileRef}
              onClick={() => setOpenMenu(!openMenu)}
            >
              <Avatar
                src={
                  user && user.profile_image
                    ? user.profile_image
                    : AppConst.PROFILE_PLACEHOLDER_IMAGE
                }
                className="profile-avatar"
              />
              <span className="header-name">
                {t("header.welcome")}, {user?.first_name}
              </span>

              {openMenu && (
                <div className="dropdown-menu">
                  <div
                    className="dropdown-item"
                    onClick={() => goTo("/profile")}
                  >
                    <AccountCircle /> {t("header.profile")}
                  </div>

                  {user?.role === "admin" && (
                    <div
                      className="dropdown-item"
                      onClick={() => goTo("/dashboard")}
                    >
                      <Dashboard /> {t("header.dashboard")}
                    </div>
                  )}

                  {user?.role === "admin" && (
                    <div className="dropdown-item" onClick={() => goTo("/ads")}>
                      <BorderColor /> {t("header.manageAds")}
                    </div>
                  )}

                  {user?.role === "user" && (
                    <div
                      onClick={() => goTo("/saved-ads")}
                      className="dropdown-item saved-item"
                    >
                      <Bookmark /> {t("header.mySavedAds")}
                      <span className="badge-count">{savedCount}</span>
                    </div>
                  )}

                  {user?.role === "user" && (
                    <div
                      className="dropdown-item"
                      onClick={() => goTo("/my-ads")}
                    >
                      <BorderColor /> {t("header.myAds")}
                    </div>
                  )}

                  {user?.role === "admin" && (
                    <div
                      className="dropdown-item"
                      onClick={() => goTo("/users")}
                    >
                      <People />
                      {t("header.manageUsers")}
                    </div>
                  )}

                  {user?.role === "admin" && (
                    <div
                      className="dropdown-item"
                      onClick={() => goTo("/categories")}
                    >
                      <Category />
                      {t("header.manageCategories")}
                    </div>
                  )}

                  <div
                    className="dropdown-item saved-item"
                    onClick={() => goTo("/support")}
                  >
                    <ChatBubble />
                    {user?.role === "user"
                      ? t("header.contactUs")
                      : t("header.giveSupport")}
                    <span className="badge-count">{notificationCount}</span>
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

      {/* ================= MOBILE DRAWER ================= */}
      <div className={`mobile-drawer ${mobileMenu ? "open" : ""}`}>
        <div className="drawer-header">
          <span>{t("header.menu")}</span>
          <Close onClick={() => setMobileMenu(false)} />
        </div>

        <div className="drawer-content">
          <div onClick={() => goTo("/")}>
            <Home /> {t("header.home")}
          </div>

          {isSignedIn && (
            <>
              <div onClick={() => goTo("/profile")}>
                <AccountCircle /> {t("header.profile")}
              </div>

              {user?.role === "admin" && (
                <div onClick={() => goTo("/dashboard")}>
                  <Dashboard /> {t("header.dashboard")}
                </div>
              )}

              {user?.role === "admin" && (
                <div onClick={() => goTo("/ads")}>
                  <BorderColor /> {t("header.manageAds")}
                </div>
              )}

              {user?.role === "user" && (
                <div onClick={() => goTo("/post-ad")}>
                  <AddCircle /> {t("header.postAd")}
                </div>
              )}

              {user?.role === "user" && (
                <div onClick={() => goTo("/saved-ads")} className="saved-item">
                  <Bookmark /> {t("header.mySavedAds")}
                  <span className="badge-count">{savedCount}</span>
                </div>
              )}

              {user?.role === "user" && (
                <div onClick={() => goTo("/my-ads")}>
                  <BorderColor /> {t("header.myAds")}
                </div>
              )}

              {user?.role === "admin" && (
                <div onClick={() => goTo("/users")}>
                  <People />
                  {t("header.manageUsers")}
                </div>
              )}

              {user?.role === "admin" && (
                <div onClick={() => goTo("/categories")}>
                  <Category />
                  {t("header.manageCategories")}
                </div>
              )}

              <div onClick={() => goTo("/support")} className="saved-item">
                <ChatBubble />
                {user?.role === "user"
                  ? t("header.contactUs")
                  : t("header.giveSupport")}
                <span className="badge-count">{notificationCount}</span>
              </div>

              <div onClick={handleLogout}>
                <Logout /> {t("header.logout")}
              </div>
            </>
          )}

          {!isSignedIn && (
            <>
              <div onClick={() => goTo("/signin")}>
                <Login /> {t("header.signIn")}
              </div>

              <div onClick={() => goTo("/signup")}>
                <PersonAdd /> {t("header.signUp")}
              </div>
            </>
          )}

          <div className="toggle-theme">
            <LightMode />
            <Switch
              checked={darkMode}
              onChange={toggleDarkMode}
              color="primary"
            />
            <DarkMode />
          </div>

          <div onClick={toggleLanguage}>
            <Language />
            <span>{language === "en" ? "සිංහල" : "English"}</span>
          </div>
        </div>
      </div>

      {/* OVERLAY */}
      {mobileMenu && (
        <div className="drawer-overlay" onClick={() => setMobileMenu(false)} />
      )}

      <CustomSnackbar {...snackbar} onClose={handleClose} />
      <LoadingSpinner open={loading} />
    </>
  );
};

export default TopHeader;

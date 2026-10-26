import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";

import TopHeader from "./components/screens/TopHeader";
import Footer from "./components/screens/Footer";
import Home from "./components/screens/Home";
import SignIn from "./components/screens/SignIn";
import ForgotPassword from "./components/screens/ForgotPassword";
import ResetPassword from "./components/screens/ResetPassword";
import SignUp from "./components/screens/SignUp";
import VerifyAccount from "./components/screens/VerifyAccount";
import "./App.css";

import LoadingSpinner from "./components/screens/LoadingSpinner";

import { get_token, getProfile } from "./services/authService";

// =======================
// Theme default
// =======================
if (!document.documentElement.getAttribute("data-theme")) {
  document.documentElement.setAttribute("data-theme", "light");
}

if (!document.documentElement.getAttribute("language")) {
  document.documentElement.setAttribute("language", "en");
}

// =======================
// Layout Wrapper
// =======================
const MainBodyWrapper = ({ children, isSignedIn }) => {
  const location = useLocation();

  const isAuthPage =
    location.pathname.startsWith("/signin") ||
    location.pathname.startsWith("/signup") ||
    location.pathname.startsWith("/verify") ||
    location.pathname.startsWith("/forgot-password") ||
    location.pathname.startsWith("/reset-password");

  return (
    <div
      className={
        isSignedIn && !isAuthPage ? "mainBody signedIn" : "mainBody signedIn"
      }
    >
      {children}
    </div>
  );
};

// =======================
// App
// =======================
const App = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);

  // =======================
  // Session check
  // =======================
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem("Token");
      const timestamp = localStorage.getItem("sessionTimestamp");
      const now = new Date().getTime();

      if (!savedToken || !timestamp) {
        setIsLoading(false);
        return;
      }

      const diff = now - parseInt(timestamp, 10);
      const hours = diff / (1000 * 60 * 60);

      if (hours >= 24) {
        handleSignOut();
        setIsLoading(false);
        return;
      }

      setIsSignedIn(true);
      setToken(savedToken);

      try {
        const res = await getProfile(savedToken);

        if (res.success) {
          setRole(res.user.role);
        } else {
          handleSignOut();
        }
      } catch (err) {
        console.error(err);
        handleSignOut();
        setIsLoading(false);
      }

      setIsLoading(false);
    };

    restoreSession();
  }, []);

  // =======================
  // Auth handlers
  // =======================
  const handleSignIn = async () => {
    setIsSignedIn(true);
    await fetchUserData();
  };

  const fetchUserData = async () => {
    const saved_token = await get_token();
    if (!saved_token) return;

    try {
      const res = await getProfile(saved_token);

      if (res.success) {
        const user = res.user;
        setRole(user.role);
        setToken(saved_token);
      } else {
        setRole(null);
        setToken(null);
      }
    } catch (err) {
      console.error(err);
      setRole(null);
      setToken(null);
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    setIsSignedIn(false);
    setRole(null);
    setToken(null);
  };

  const ProtectedRoute = ({ isSignedIn, allowedRoles = [], children }) => {
    if (!isSignedIn || !token) {
      return <Navigate to="/signin" replace />;
    }

    // role restriction
    if (allowedRoles.length > 0 && !allowedRoles.includes(role || "")) {
      return <Navigate to="/home" replace />;
    }

    return children;
  };

  if (isLoading) return <LoadingSpinner open={isLoading} />;

  if (isSignedIn && token && role === null)
    return <LoadingSpinner open={isLoading} />;

  return (
    <Router>
      <TopHeader onSignOut={handleSignOut} isSignedIn={isSignedIn} />

      <MainBodyWrapper isSignedIn={isSignedIn}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/signin" element={<SignIn onSignIn={handleSignIn} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify/:token" element={<VerifyAccount />} />
        </Routes>
      </MainBodyWrapper>

      <Footer />
    </Router>
  );
};

export default App;

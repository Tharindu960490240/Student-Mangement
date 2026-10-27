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
import { getHomeRoute, ROLES } from "./const/roles";
import ProtectedRoute from "./components/ProtectedRoute";
import SideNav from "./components/SideNav";
import "./components/styles/sideNav.css";
import RoleDashboard from "./components/screens/RoleDashboard";
import Invitations from "./components/screens/admin/Invitations";
import Users from "./components/screens/admin/Users";
import Agents from "./components/screens/admin/Agents";
import Agreements from "./components/screens/admin/Agreements";
import AgreementDetail from "./components/screens/admin/AgreementDetail";
import AgreementTemplate from "./components/screens/admin/AgreementTemplate";
import MyAgreement from "./components/screens/agent/MyAgreement";

import LoadingSpinner from "./components/screens/LoadingSpinner";

import { get_token, getProfile } from "./services/authService";

// =======================
// Theme default
// =======================
if (!document.documentElement.getAttribute("data-theme")) {
  // remembered choice from the theme button, default light
  document.documentElement.setAttribute(
    "data-theme",
    localStorage.getItem("theme") === "dark" ? "dark" : "light",
  );
}

// =======================
// Layout Wrapper
// =======================
const MainBodyWrapper = ({ children, isSignedIn, role, user, onSignOut }) => {
  const location = useLocation();

  const isAuthPage =
    location.pathname.startsWith("/signin") ||
    location.pathname.startsWith("/signup") ||
    location.pathname.startsWith("/verify") ||
    location.pathname.startsWith("/forgot-password") ||
    location.pathname.startsWith("/reset-password");

  // Signed in (and not on a sign-in style page): side menu + page
  const showSideNav = isSignedIn && !isAuthPage;

  return (
    <div className="mainBody signedIn">
      {showSideNav ? (
        <div className="app-shell">
          <SideNav role={role} user={user} onSignOut={onSignOut} />
          <main className="app-main">{children}</main>
        </div>
      ) : (
        children
      )}
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
  const [user, setUser] = useState(null);

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
          setUser(res.user);
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
  // Returns the user's role so SignIn can redirect to the right dashboard
  const handleSignIn = async () => {
    setIsSignedIn(true);
    return await fetchUserData();
  };

  const fetchUserData = async () => {
    const saved_token = await get_token();
    if (!saved_token) return null;

    try {
      const res = await getProfile(saved_token);

      if (res.success) {
        const user = res.user;
        setRole(user.role);
        setUser(user);
        setToken(saved_token);
        return user.role;
      }

      setRole(null);
      setToken(null);
      return null;
    } catch (err) {
      console.error(err);
      setRole(null);
      setToken(null);
      return null;
    }
  };

  const handleSignOut = () => {
    // keep the saved theme, only remove the session
    localStorage.removeItem("Token");
    localStorage.removeItem("sessionTimestamp");
    setIsSignedIn(false);
    setUser(null);
    setRole(null);
    setToken(null);
  };

  // Signed in -> role home, signed out -> sign in
  const startPath = isSignedIn ? getHomeRoute(role) : "/signin";

  if (isLoading) return <LoadingSpinner open={isLoading} />;

  if (isSignedIn && token && role === null)
    return <LoadingSpinner open={isLoading} />;

  return (
    <Router>
      <TopHeader onSignOut={handleSignOut} isSignedIn={isSignedIn} />

      <MainBodyWrapper
        isSignedIn={isSignedIn}
        role={role}
        user={user}
        onSignOut={handleSignOut}
      >
        <Routes>
          <Route path="/" element={<Navigate to={startPath} replace />} />
          {/* /home forwards to the signed-in user's own home page */}
          <Route
            path="/home"
            element={
              <Home
                isSignedIn={isSignedIn}
                role={role}
                onSignOut={handleSignOut}
              />
            }
          />

          {/* One protected home page per role */}
          {Object.values(ROLES).map((r) => (
            <Route
              key={r}
              path={`/${r}`}
              element={
                <ProtectedRoute
                  isSignedIn={isSignedIn}
                  token={token}
                  role={role}
                  allowedRoles={[r]}
                >
                  <RoleDashboard role={r} user={user} />
                </ProtectedRoute>
              }
            />
          ))}
          {/* Admin pages */}
          <Route
            path="/admin/invitations"
            element={
              <ProtectedRoute
                isSignedIn={isSignedIn}
                token={token}
                role={role}
                allowedRoles={[ROLES.ADMIN]}
              >
                <Invitations role={role} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute
                isSignedIn={isSignedIn}
                token={token}
                role={role}
                allowedRoles={[ROLES.ADMIN]}
              >
                <Users role={role} user={user} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/agents"
            element={
              <ProtectedRoute
                isSignedIn={isSignedIn}
                token={token}
                role={role}
                allowedRoles={[ROLES.ADMIN]}
              >
                <Agents role={role} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/agreements"
            element={
              <ProtectedRoute
                isSignedIn={isSignedIn}
                token={token}
                role={role}
                allowedRoles={[ROLES.ADMIN]}
              >
                <Agreements role={role} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/agreements/template"
            element={
              <ProtectedRoute
                isSignedIn={isSignedIn}
                token={token}
                role={role}
                allowedRoles={[ROLES.ADMIN]}
              >
                <AgreementTemplate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/agreements/:id"
            element={
              <ProtectedRoute
                isSignedIn={isSignedIn}
                token={token}
                role={role}
                allowedRoles={[ROLES.ADMIN]}
              >
                <AgreementDetail />
              </ProtectedRoute>
            }
          />
          {/* Agent pages */}
          <Route
            path="/agent/agreement"
            element={
              <ProtectedRoute
                isSignedIn={isSignedIn}
                token={token}
                role={role}
                allowedRoles={[ROLES.AGENT]}
              >
                <MyAgreement role={role} />
              </ProtectedRoute>
            }
          />

          <Route path="/signin" element={<SignIn onSignIn={handleSignIn} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signup/:token" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/reset-password"
            element={<ResetPassword onSignOut={handleSignOut} />}
          />
          <Route path="/verify/:token" element={<VerifyAccount />} />
          <Route path="*" element={<Navigate to={startPath} replace />} />
        </Routes>
      </MainBodyWrapper>

      <Footer />
    </Router>
  );
};

export default App;

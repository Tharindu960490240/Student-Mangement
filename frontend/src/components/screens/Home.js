import React from "react";
import { Navigate } from "react-router-dom";

import "../styles/home.css";
import AuthLogo from "../AuthLogo";
import { ROLE_HOME, normalizeRole } from "../../const/roles";

// /home only forwards people to the right place:
//   signed out          -> sign in
//   known role          -> that role's home (/admin, /agent, /teacher, /student)
//   anything else       -> a short message instead of a redirect loop
const Home = ({ isSignedIn, role, onSignOut }) => {
  if (!isSignedIn) return <Navigate to="/signin" replace />;

  const target = ROLE_HOME[normalizeRole(role)];
  if (target) return <Navigate to={target} replace />;

  return (
    <div className="home-container">
      <div className="home-card">
        <AuthLogo />
        <h2>No role assigned</h2>
        <p>
          Your account is signed in but has no portal role yet. Please contact
          the college so they can finish setting it up.
        </p>
        <button className="button-success" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Home;

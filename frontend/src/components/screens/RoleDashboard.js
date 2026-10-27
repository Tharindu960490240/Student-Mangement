import React from "react";
import { Link } from "react-router-dom";

import "../styles/dashboard.css";
import { ROLE_LABELS, normalizeRole } from "../../const/roles";
import { NAV_ITEMS } from "../../const/navigation";

// ===============================
// Dashboard cards come from src/const/navigation.js, the same list the
// side menu uses. Edit the list there (set `ready: true` when a page is built).
// Only the heading and intro text are kept here.
// ===============================
const INTROS = {
  admin: {
    title: "Admin dashboard",
    intro: "Invite people, review agreements and applications, and issue offers.",
  },
  agent: {
    title: "Agent dashboard",
    intro: "Sign your agreement, then submit your students.",
  },
  teacher: {
    title: "Teacher dashboard",
    intro: "Your students and classes.",
  },
  student: {
    title: "Student dashboard",
    intro: "Follow your application and download your documents.",
  },
};

const RoleDashboard = ({ role, user }) => {
  const key = normalizeRole(role);
  const config = INTROS[key];
  if (!config) return null;

  const cards = (NAV_ITEMS[key] || []).filter((item) => !item.home);

  return (
    <div className="dashboard">
      <div className="dashboard-head">
        <span className={`role-chip role-${key}`}>{ROLE_LABELS[key]}</span>
        <h1>
          {user?.first_name ? `Welcome, ${user.first_name}` : config.title}
        </h1>
        <p>{config.intro}</p>
      </div>

      <div className="dashboard-grid">
        {cards.map(({ icon: Icon, label, text, path, ready }) => {
          const body = (
            <>
              <span className="dashboard-icon">
                <Icon />
              </span>
              <h3>{label}</h3>
              <p>{text}</p>
              {!ready && <span className="dashboard-soon">Coming soon</span>}
            </>
          );

          return ready ? (
            <Link key={path} to={path} className="dashboard-card">
              {body}
            </Link>
          ) : (
            <div
              key={path}
              className="dashboard-card is-disabled"
              aria-disabled="true"
            >
              {body}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoleDashboard;

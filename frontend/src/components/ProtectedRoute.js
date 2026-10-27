import React from "react";
import { Navigate } from "react-router-dom";
import { normalizeRole } from "../const/roles";

// Usage (once dashboards exist):
// <Route path="/admin" element={
//   <ProtectedRoute isSignedIn={isSignedIn} token={token} role={role} allowedRoles={[ROLES.ADMIN]}>
//     <AdminDashboard />
//   </ProtectedRoute>
// } />
const ProtectedRoute = ({
  isSignedIn,
  token,
  role,
  allowedRoles = [],
  children,
}) => {
  if (!isSignedIn || !token) {
    return <Navigate to="/signin" replace />;
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.map(normalizeRole).includes(normalizeRole(role))
  ) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedRoute;

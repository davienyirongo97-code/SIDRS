/**
 * src/components/ui/ProtectedRoute.js
 * ─────────────────────────────────────────────
 * RBAC Wrapper for routes. Redirects to Home if the
 * user does not have the required permissions.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '../../context/AppContext';

/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string|string[]} props.allowedRoles - 'citizen', 'police', 'macra'
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const user = useCurrentUser();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(user.role)) {
    // Redirect unauthorized users to Home
    return <Navigate to="/" replace />;
  }

  return children;
}

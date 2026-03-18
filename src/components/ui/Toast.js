/**
 * src/components/ui/Toast.js
 * ─────────────────────────────────────────────
 * Global toast notification component, using react-icons.
 */

import React from 'react';
import { useAppState } from '../../context/AppContext';
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo, FiMessageCircle } from 'react-icons/fi';

const ICONS = {
  success: <FiCheckCircle />,
  error:   <FiXCircle />,
  warn:    <FiAlertTriangle />,
  info:    <FiInfo />,
};

export default function Toast() {
  const { toast } = useAppState();

  if (!toast) return null;

  return (
    <div className={`toast ${toast.type === 'success' ? '' : toast.type}`} role="alert">
      <div className="toast-icon">{ICONS[toast.type] || <FiMessageCircle />}</div>
      <div>
        <div className="toast-msg">{toast.message}</div>
        {toast.subMessage && (
          <div className="toast-sub">{toast.subMessage}</div>
        )}
      </div>
    </div>
  );
}

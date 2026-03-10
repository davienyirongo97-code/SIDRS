/**
 * src/components/ui/Toast.js
 * ─────────────────────────────────────────────
 * Global toast notification component.
 * Renders the current toast from global state (if any).
 *
 * Triggered from anywhere via the useToast() hook:
 *   const showToast = useToast();
 *   showToast('Device registered!', 'Now protected in the registry.', 'success');
 *
 * Types: 'success' | 'error' | 'warn' | 'info'
 * Auto-hides after 4.5 seconds (set in AppContext useToast hook).
 */

import React from 'react';
import { useAppState } from '../../context/AppContext';

// Icon per type
const ICONS = {
  success: '✅',
  error:   '❌',
  warn:    '⚠️',
  info:    'ℹ️',
};

export default function Toast() {
  const { toast } = useAppState();

  // Don't render if no active toast
  if (!toast) return null;

  return (
    <div className={`toast ${toast.type === 'success' ? '' : toast.type}`} role="alert">
      <div className="toast-icon">{ICONS[toast.type] || '💬'}</div>
      <div>
        <div className="toast-msg">{toast.message}</div>
        {toast.subMessage && (
          <div className="toast-sub">{toast.subMessage}</div>
        )}
      </div>
    </div>
  );
}

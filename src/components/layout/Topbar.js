/**
 * src/components/layout/Topbar.js
 * ─────────────────────────────────────────────
 * Sticky top bar shown on every page.
 *
 * Contains:
 *   - Current page title + subtitle (derived from current route)
 *   - Active alert count (red pill if stolen devices are monitored)
 *   - Notification bell with dot if pending reports exist
 *   - Current user avatar
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState, useCurrentUser } from '../../context/AppContext';
import './Topbar.css';

const PAGE_TITLES = {
  '/':             { title: 'Platform Overview',       subtitle: 'National Stolen Device Identification & Recovery System' },
  '/checker':      { title: 'IMEI Checker',            subtitle: 'Verify any device before purchasing' },
  '/my-devices':   { title: 'My Devices',              subtitle: 'Manage your registered devices and theft reports' },
  '/report':       { title: 'Report Theft',            subtitle: 'Submit a verified theft report' },
  '/transfer':     { title: 'Transfer Ownership',      subtitle: 'Safely transfer device ownership with a PIN' },
  '/police':       { title: 'Police Dashboard',        subtitle: 'Intelligence & case management' },
  '/intelligence': { title: 'Intelligence Feed',       subtitle: 'Network detection events from Airtel & TNM' },
  '/admin':        { title: 'MACRA Admin',             subtitle: 'National system overview and analytics' },
  '/registry':     { title: 'Device Registry',        subtitle: 'Full national device registry' },
};

export default function Topbar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const state     = useAppState();
  const user      = useCurrentUser();

  const pageInfo      = PAGE_TITLES[location.pathname] || PAGE_TITLES['/'];
  const activeAlerts  = state.reports.filter(r => r.status === 'active').length;
  const pendingAlerts = state.reports.filter(r => r.status === 'pending').length;

  // Unread reminders — only relevant for police and MACRA
  const isOfficer    = user?.role === 'police' || user?.role === 'macra';
  const unreadCount  = isOfficer
    ? (state.reminders || []).filter(r => !r.acknowledged).length
    : 0;

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h1 className="topbar-heading">{pageInfo.title}</h1>
        <p className="topbar-subtitle">{pageInfo.subtitle}</p>
      </div>

      <div className="topbar-right">

        {/* Active network alert indicator */}
        {activeAlerts > 0 && (
          <div className="alert-pill">
            <div className="live-dot" />
            {activeAlerts} Active Alert{activeAlerts > 1 ? 's' : ''}
          </div>
        )}

        {/* ── Citizen reminder bell — police/MACRA only ── */}
        {isOfficer && unreadCount > 0 && (
          <button
            className="btn btn-sm"
            style={{
              background: 'var(--red)',
              color: '#fff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 800,
              animation: 'ping 2s infinite',
              cursor: 'pointer',
            }}
            title={`${unreadCount} unread citizen reminder${unreadCount > 1 ? 's' : ''}`}
            onClick={() => navigate('/police')}
          >
            🔔 {unreadCount} Reminder{unreadCount > 1 ? 's' : ''}
          </button>
        )}

        {/* Notification bell */}
        <div className="notif-wrap">
          <button className="btn btn-surface btn-sm notif-btn" title="Alerts">
            🔔 Alerts
          </button>
          {pendingAlerts > 0 && (
            <div className="notif-dot" title={`${pendingAlerts} pending reports`} />
          )}
        </div>

        {/* User avatar */}
        <div
          className="topbar-avatar"
          style={{ background: user?.avatarColor }}
          title={user?.name}
        >
          {user?.avatarText}
        </div>
      </div>
    </header>
  );
}
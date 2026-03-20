/**
 * src/components/layout/Topbar.js
 * ─────────────────────────────────────────────
 * Top navigation bar featuring:
 *   - Page dynamic titles & subtitles
 *   - Global search (for police/admin)
 *   - Light/Dark mode toggle
 *   - Notification bell with unread dot
 *   - Current user avatar & role
 */

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppState, useCurrentUser, useAppDispatch } from '../../context/AppContext';
import { FiBell, FiMoon, FiSun, FiSearch } from 'react-icons/fi';

const TITLES = {
  '/':             { main: 'Dashboard', sub: 'National device security overview' },
  '/checker':      { main: 'IMEI Checker', sub: 'Verify device legitimacy instantly' },
  '/my-devices':   { main: 'My Devices', sub: 'Manage your registered hardware' },
  '/report':       { main: 'Report Theft', sub: 'File a verified incident report' },
  '/transfer':     { main: 'Ownership Transfer', sub: 'Securely reassign device titles' },
  '/police':       { main: 'Police Console', sub: 'Active recovery operations & field checks' },
  '/intelligence': { main: 'Intelligence Feed', sub: 'Real-time crime signal analytics' },
  '/admin':        { main: 'MACRA Admin', sub: 'National registry health & compliance' },
  '/registry':     { main: 'National Registry', sub: 'Database of all compliant hardware' },
  '/chain':        { main: 'Ownership Chain', sub: 'Immutable blockchain ledger of titles' },
  '/threats':      { main: 'Threat Intel', sub: 'Anomaly detection & market hotspots' },
};

export default function Topbar() {
  const { pathname } = useLocation();
  const { reminders, theme } = useAppState();
  const user = useCurrentUser();
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);

  const current = TITLES[pathname] || { main: TITLES['/'].main, sub: TITLES['/'].sub };
  
  const relevantReminders = reminders.filter(r => (user.role === 'police' || user.role === 'macra'));
  const hasUnread = relevantReminders.some(r => !r.read);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div>
          <h1 className="topbar-title">{current.main}</h1>
          <p className="topbar-subtitle">{current.sub}</p>
        </div>
      </div>

      <div className="topbar-right">
        {/* Global Search (Privileged) */}
        {(user.role === 'police' || user.role === 'macra') && (
          <div className="topbar-search">
            <FiSearch className="search-icon" />
            <input 
              placeholder="Search IMEI or Case #..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        )}

        {/* Theme Toggle */}
        <button 
          className="icon-btn theme-toggle" 
          onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <FiMoon /> : <FiSun />}
        </button>

        {/* Notifications */}
        <div className="topbar-alerts" style={{ position: 'relative' }}>
          <button className="icon-btn" onClick={() => setShowNotifs(!showNotifs)}>
            <FiBell />
            {hasUnread && <span className="alert-dot" />}
          </button>

          {showNotifs && (
            <div className="notifications-dropdown glass-card fade-in" style={{
              position: 'absolute', top: '100%', right: 0, width: '320px',
              marginTop: '12px', zIndex: 100, padding: '16px'
            }}>
              <div style={{ fontWeight: 800, marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                System Alerts
                <span className="badge-blue" style={{ fontSize: '10px' }}>{relevantReminders.length}</span>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {relevantReminders.length > 0 ? relevantReminders.map(r => (
                  <div key={r.id} style={{ 
                    padding: '12px 0', borderBottom: '1px solid var(--muted-3)',
                    opacity: r.read ? 0.6 : 1
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: 700 }}>Case Update: {r.caseNumber}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>{r.message.split('\n')[0]}</div>
                    <div style={{ fontSize: '10px', color: 'var(--blue)', marginTop: '4px' }}>{r.sentAt}</div>
                  </div>
                )) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="topbar-user">
          <div style={{ textAlign: 'right' }}>
            <div className="user-name">{user.name}</div>
            <div className="user-role" style={{ color: 'var(--blue)', fontWeight: 700, fontSize: '10px' }}>{user.roleLabel || user.role.toUpperCase()}</div>
          </div>
          <div className="user-avatar" style={{ background: user.role === 'citizen' ? 'var(--blue)' : 'var(--navy)' }}>
            {user.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}

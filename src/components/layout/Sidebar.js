/**
 * src/components/layout/Sidebar.js
 * ─────────────────────────────────────────────
 * Fixed left navigation sidebar.
 *
 * Contains:
 *   - SDIRS brand logo/badge
 *   - Navigation groups with icon + label + optional badge
 *   - User switcher (demo only — in production this would be
 *     a real auth session, not a dropdown)
 *
 * Uses React Router's <NavLink> to highlight the active page.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import './Sidebar.css';

// ── NAVIGATION CONFIG ──────────────────────────────────────────
// Each group has a label and a list of nav items.
// badge: function(state) → number|null  — dynamic badge counts
const NAV_GROUPS = [
  {
    label: 'Platform',
    items: [
      { path: '/',             icon: '🏠', label: 'Overview' },
      { path: '/checker',      icon: '🔍', label: 'IMEI Checker' },
    ],
  },
  {
    label: 'Citizen',
    items: [
      {
        path: '/my-devices',
        icon: '📱',
        label: 'My Devices',
        // Badge shows count of stolen devices belonging to current user
        badge: (state) => state.devices.filter(
          d => d.ownerId === state.currentUserId && d.status === 'stolen'
        ).length || null,
        badgeClass: 'badge-red',
      },
      { path: '/report',    icon: '🚨', label: 'Report Theft' },
      { path: '/transfer',  icon: '🔄', label: 'Transfer Device' },
    ],
  },
  {
    label: 'Law Enforcement',
    items: [
      {
        path: '/police',
        icon: '👮',
        label: 'Police Dashboard',
        // Badge shows count of pending (unverified) reports
        badge: (state) => state.reports.filter(r => r.status === 'pending').length || null,
        badgeClass: 'badge-amber',
      },
      { path: '/intelligence', icon: '📡', label: 'Intelligence Feed' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { path: '/admin',    icon: '🏛️', label: 'MACRA Admin' },
      { path: '/registry', icon: '📋', label: 'Device Registry' },
    ],
  },
];

export default function Sidebar() {
  const state    = useAppState();
  const dispatch = useAppDispatch();
  const { users, currentUserId } = state;

  const currentUser = users.find(u => u.id === currentUserId);

  function handleUserSwitch(e) {
    dispatch({ type: 'SET_USER', payload: e.target.value });
  }

  return (
    <aside className="sidebar">
      {/* Decorative background glow */}
      <div className="sidebar-glow" aria-hidden="true" />

      {/* ── Brand ── */}
      <div className="sidebar-brand">
        <div className="brand-badge">SD</div>
        <div>
          <div className="brand-text">SDIRS</div>
          <div className="brand-sub">Malawi · MACRA</div>
        </div>
      </div>

      {/* ── Navigation groups ── */}
      <nav className="sidebar-nav">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <div className="nav-section">{group.label}</div>

            {group.items.map(item => {
              const badgeCount = item.badge ? item.badge(state) : null;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}   /* exact match for home only */
                  className={({ isActive }) =>
                    `nav-item${isActive ? ' active' : ''}`
                  }
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {badgeCount && (
                    <span className={`nav-badge ${item.badgeClass || ''}`}>
                      {badgeCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── User card with switcher ── */}
      <div className="user-card">
        <div className="user-info">
          <div
            className="user-avatar"
            style={{ background: currentUser?.avatarColor }}
          >
            {currentUser?.avatarText}
          </div>
          <div>
            <div className="user-name">{currentUser?.name}</div>
            <div className="user-role">{currentUser?.location}</div>
          </div>
        </div>

        {/*
          Demo-only user switcher.
          In production: replace this with a proper logout button
          and redirect to a login page.
        */}
        <select
          className="user-switcher"
          value={currentUserId}
          onChange={handleUserSwitch}
          title="Switch user (demo only)"
        >
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.name.split(' ')[0]} ({u.role})
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}

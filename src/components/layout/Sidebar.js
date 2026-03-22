/**
 * src/components/layout/Sidebar.js
 * ─────────────────────────────────────────────
 * Fixed left navigation sidebar.
 * Uses react-icons/fi (Feather) throughout for a clean, consistent look.
 */

import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppStore, useAppDispatch } from '../../store/useAppStore';
import {
  FiHome,
  FiSearch,
  FiSmartphone,
  FiAlertCircle,
  FiRefreshCw,
  FiUsers,
  FiRadio,
  FiCpu,
  FiGrid,
  FiList,
  FiLink,
  FiMenu,
  FiX,
} from 'react-icons/fi';
import './Sidebar.css';

// ── NAVIGATION CONFIG ──────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Platform',
    items: [
      { path: '/', icon: <FiHome />, label: 'Overview', roles: ['citizen', 'police', 'macra'] },
      {
        path: '/checker',
        icon: <FiSearch />,
        label: 'IMEI Checker',
        roles: ['citizen', 'police', 'macra'],
      },
    ],
  },
  {
    label: 'Citizen',
    items: [
      {
        path: '/my-devices',
        icon: <FiSmartphone />,
        label: 'My Devices',
        roles: ['citizen', 'police', 'macra'],
        badge: (state) =>
          state.devices.filter((d) => d.ownerId === state.currentUserId && d.status === 'stolen')
            .length || null,
        badgeClass: 'badge-red',
      },
      { path: '/report', icon: <FiAlertCircle />, label: 'Report Theft', roles: ['citizen'] },
      { path: '/transfer', icon: <FiRefreshCw />, label: 'Transfer Device', roles: ['citizen'] },
    ],
  },
  {
    label: 'Law Enforcement',
    items: [
      {
        path: '/police',
        icon: <FiUsers />,
        label: 'Police Dashboard',
        roles: ['police', 'macra'],
        badge: (state) => state.reports.filter((r) => r.status === 'pending').length || null,
        badgeClass: 'badge-amber',
      },
      {
        path: '/intelligence',
        icon: <FiRadio />,
        label: 'Intelligence Feed',
        roles: ['police', 'macra'],
      },
      { path: '/threats', icon: <FiCpu />, label: 'Threat Intel (AI)', roles: ['police', 'macra'] },
    ],
  },
  {
    label: 'Administration',
    items: [
      { path: '/admin', icon: <FiGrid />, label: 'MACRA Admin', roles: ['macra'] },
      { path: '/registry', icon: <FiList />, label: 'Device Registry', roles: ['macra', 'police'] },
      { path: '/chain', icon: <FiLink />, label: 'Ownership Chain', roles: ['macra', 'police'] },
    ],
  },
];

export default function Sidebar() {
  const users = useAppStore((state) => state.users);
  const currentUserId = useAppStore((state) => state.currentUserId);
  const devices = useAppStore((state) => state.devices);
  const reports = useAppStore((state) => state.reports);
  const dispatch = useAppDispatch();
  const location = useLocation();

  const stateProxy = { devices, reports, currentUserId };

  const currentUser = users.find((u) => u.id === currentUserId);

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  function handleUserSwitch(e) {
    dispatch({ type: 'SET_USER', payload: e.target.value });
  }

  return (
    <>
      {/* ── Mobile hamburger button ── */}
      <button
        className="hamburger-btn"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar${mobileOpen ? ' open' : ''}`}>
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
          {NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter((item) =>
              item.roles.includes(currentUser?.role)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.label}>
                <div className="nav-section">{group.label}</div>

                {visibleItems.map((item) => {
                  const badgeCount = item.badge ? item.badge(stateProxy) : null;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                      {badgeCount && (
                        <span className={`nav-badge ${item.badgeClass || ''}`}>{badgeCount}</span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* ── User card with switcher ── */}
        <div className="user-card">
          <div className="user-info">
            <div className="user-avatar" style={{ background: currentUser?.avatarColor }}>
              {currentUser?.avatarText}
            </div>
            <div>
              <div className="user-name">{currentUser?.name}</div>
              <div className="user-role">{currentUser?.location}</div>
            </div>
          </div>

          <select
            className="user-switcher"
            value={currentUserId}
            onChange={handleUserSwitch}
            title="Switch user (demo only)"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name.split(' ')[0]} ({u.role})
              </option>
            ))}
          </select>
        </div>
      </aside>
    </>
  );
}

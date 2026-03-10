/**
 * src/App.js
 * ─────────────────────────────────────────────
 * Root application component.
 * Sets up the main layout (Sidebar + main area)
 * and maps URL routes to page components.
 *
 * ROUTES:
 *   /              → HomePage
 *   /checker       → IMEICheckerPage
 *   /my-devices    → MyDevicesPage
 *   /report        → ReportTheftPage
 *   /transfer      → TransferPage
 *   /police        → PoliceDashboardPage
 *   /intelligence  → IntelligenceFeedPage
 *   /admin         → MacraAdminPage
 *   /registry      → DeviceRegistryPage
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout components
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import Toast from './components/ui/Toast';

// Page components
import HomePage from './components/pages/HomePage';
import IMEICheckerPage from './components/pages/IMEICheckerPage';
import MyDevicesPage from './components/pages/MyDevicesPage';
import ReportTheftPage from './components/pages/ReportTheftPage';
import TransferPage from './components/pages/TransferPage';
import PoliceDashboardPage from './components/pages/PoliceDashboardPage';
import IntelligenceFeedPage from './components/pages/IntelligenceFeedPage';
import MacraAdminPage from './components/pages/MacraAdminPage';
import DeviceRegistryPage from './components/pages/DeviceRegistryPage';

function App() {
  return (
    <div className="app-shell">
      {/* ── Fixed left sidebar with navigation ── */}
      <Sidebar />

      {/* ── Main content area (scrolls independently) ── */}
      <div className="main-area">
        {/* Sticky top bar with page title, role switcher, alerts */}
        <Topbar />

        {/* Page content rendered based on current URL */}
        <main className="page-content">
          <Routes>
            <Route path="/"             element={<HomePage />} />
            <Route path="/checker"      element={<IMEICheckerPage />} />
            <Route path="/my-devices"   element={<MyDevicesPage />} />
            <Route path="/report"       element={<ReportTheftPage />} />
            <Route path="/transfer"     element={<TransferPage />} />
            <Route path="/police"       element={<PoliceDashboardPage />} />
            <Route path="/intelligence" element={<IntelligenceFeedPage />} />
            <Route path="/admin"        element={<MacraAdminPage />} />
            <Route path="/registry"     element={<DeviceRegistryPage />} />
            {/* Catch-all: redirect unknown URLs to home */}
            <Route path="*"             element={<HomePage />} />
          </Routes>
        </main>
      </div>

      {/* ── Global toast notifications (success, error, warning) ── */}
      <Toast />
    </div>
  );
}

export default App;

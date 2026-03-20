import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useCurrentUser } from './context/AppContext';

// Layout components
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import Toast from './components/ui/Toast';
import ErrorBoundary from './components/ui/ErrorBoundary';

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
import OwnershipChainPage from './components/pages/OwnershipChainPage';
import ThreatIntelPage from './components/pages/ThreatIntelPage';
import NotFoundPage from './components/pages/NotFoundPage';

import ProtectedRoute from './components/ui/ProtectedRoute';

function App() {
  return (
    <ErrorBoundary>
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
              
              {/* Citizen Routes */}
              <Route path="/my-devices"   element={<ProtectedRoute allowedRoles={['citizen', 'police', 'macra']}><MyDevicesPage /></ProtectedRoute>} />
              <Route path="/report"       element={<ProtectedRoute allowedRoles={['citizen']}><ReportTheftPage /></ProtectedRoute>} />
              <Route path="/transfer"     element={<ProtectedRoute allowedRoles={['citizen']}><TransferPage /></ProtectedRoute>} />
              
              {/* Law Enforcement Routes */}
              <Route path="/police"       element={<ProtectedRoute allowedRoles={['police', 'macra']}><PoliceDashboardPage /></ProtectedRoute>} />
              <Route path="/intelligence" element={<ProtectedRoute allowedRoles={['police', 'macra']}><IntelligenceFeedPage /></ProtectedRoute>} />
              <Route path="/threats"      element={<ProtectedRoute allowedRoles={['police', 'macra']}><ThreatIntelPage /></ProtectedRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin"        element={<ProtectedRoute allowedRoles={['macra']}><MacraAdminPage /></ProtectedRoute>} />
              <Route path="/registry"     element={<ProtectedRoute allowedRoles={['macra', 'police']}><DeviceRegistryPage /></ProtectedRoute>} />
              <Route path="/chain"        element={<ProtectedRoute allowedRoles={['macra', 'police']}><OwnershipChainPage /></ProtectedRoute>} />
              
              {/* 404 Catch-all */}
              <Route path="*"             element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>

        {/* ── Global toast notifications (success, error, warning) ── */}
        <Toast />
      </div>
    </ErrorBoundary>
  );
}

export default App;

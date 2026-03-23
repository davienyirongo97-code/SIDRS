import React from 'react';
import { Routes, Route } from 'react-router-dom';

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

// Modal components
import RegisterDeviceModal from './components/modals/RegisterDeviceModal';
import ReportTheftModal from './components/modals/ReportTheftModal';
import VerifyReportModal from './components/modals/VerifyReportModal';
import TransferInitiateModal from './components/modals/TransferInitiateModal';
import TransferPinModal from './components/modals/TransferPinModal';

// Hooks
import { useAppStore } from './store/useAppStore';
import { useDeviceTracking } from './hooks/useDeviceTracking';

function App() {
  const theme = useAppStore((state) => state.theme);
  const modal = useAppStore((state) => state.modal);
  const modalData = useAppStore((state) => state.modalData);
  const closeModal = useAppStore((state) => state.closeModal);

  // Start WebSocket tracking globally
  useDeviceTracking();

  // Apply theme class to document body
  React.useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

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
              <Route path="/" element={<HomePage />} />
              <Route path="/checker" element={<IMEICheckerPage />} />

              {/* Citizen Routes */}
              <Route
                path="/my-devices"
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'police', 'macra']}>
                    <MyDevicesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/report"
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <ReportTheftPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transfer"
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <TransferPage />
                  </ProtectedRoute>
                }
              />

              {/* Law Enforcement Routes */}
              <Route
                path="/police"
                element={
                  <ProtectedRoute allowedRoles={['police', 'macra']}>
                    <PoliceDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/intelligence"
                element={
                  <ProtectedRoute allowedRoles={['police', 'macra']}>
                    <IntelligenceFeedPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/threats"
                element={
                  <ProtectedRoute allowedRoles={['police', 'macra']}>
                    <ThreatIntelPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['macra']}>
                    <MacraAdminPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/registry"
                element={
                  <ProtectedRoute allowedRoles={['macra', 'police']}>
                    <DeviceRegistryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chain"
                element={
                  <ProtectedRoute allowedRoles={['macra', 'police', 'citizen']}>
                    <OwnershipChainPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch-all */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>

        {/* ── Global toast notifications (success, error, warning) ── */}
        <Toast />

        {/* ── Global Modal Manager ── */}
        {modal === 'register' && <RegisterDeviceModal onClose={closeModal} />}
        {modal === 'report' && (
          <ReportTheftModal onClose={closeModal} preselectedDeviceId={modalData?.deviceId} />
        )}
        {modal === 'verify' && (
          <VerifyReportModal reportId={modalData?.reportId} onClose={closeModal} />
        )}
        {modal === 'transfer' && (
          <TransferInitiateModal device={modalData?.device} onClose={closeModal} />
        )}
        {modal === 'transfer-pin' && (
          <TransferPinModal pin={modalData?.pin} device={modalData?.device} onClose={closeModal} />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;

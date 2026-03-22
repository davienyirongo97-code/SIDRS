import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import {
  INITIAL_USERS,
  INITIAL_DEVICES,
  INITIAL_REPORTS,
  INITIAL_EVENTS,
  INITIAL_TRANSFERS,
  INITIAL_REMINDERS,
} from '../data/mockData';
import { generateTransferPin } from '../utils/helpers';

// ─── HELPER: generate unique IDs ─────────────────────────────
function makeId(prefix) {
  const ts = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${ts}-${r}`;
}

function makeReportId(reports) {
  const n = String(reports.length + 1).padStart(5, '0');
  return `RPT-2026-${n}`;
}

function nowString() {
  const d = new Date();
  return `${d.toISOString().slice(0, 10)} ${d.toTimeString().slice(0, 5)}`;
}

export const useAppStore = create(
  persist(
    (set, get) => ({
      // INITIAL STATE
      currentUserId: 'U001',
      users: INITIAL_USERS,
      devices: INITIAL_DEVICES,
      reports: INITIAL_REPORTS,
      events: INITIAL_EVENTS,
      transfers: INITIAL_TRANSFERS,
      reminders: INITIAL_REMINDERS,
      modal: null,
      modalData: null,
      toast: null,
      theme: 'light',

      // ACTIONS
      setUser: (userId) => set({ currentUserId: userId }),

      registerDevice: (deviceData) =>
        set((state) => {
          const newDevice = {
            ...deviceData,
            id: makeId('D'),
            ownerId: state.currentUserId,
            registeredDate: new Date().toISOString().slice(0, 10),
            status: 'registered',
          };
          return { devices: [...state.devices, newDevice] };
        }),

      submitReport: (reportData) =>
        set((state) => {
          const newReport = {
            ...reportData,
            id: makeReportId(state.reports),
            reportedBy: state.currentUserId,
            status: 'pending',
            verifiedAt: null,
            dispatched: false,
            caseNumber: null,
          };
          const updatedDevices = state.devices.map((d) =>
            d.id === reportData.deviceId ? { ...d, status: 'stolen' } : d
          );
          return {
            reports: [...state.reports, newReport],
            devices: updatedDevices,
          };
        }),

      verifyReport: (reportId) =>
        set((state) => {
          const caseNum = `MPS-LLW-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
          const updatedReports = state.reports.map((r) =>
            r.id === reportId
              ? {
                  ...r,
                  status: 'active',
                  verifiedAt: new Date().toISOString().slice(0, 10),
                  dispatched: true,
                  caseNumber: caseNum,
                }
              : r
          );
          return { reports: updatedReports };
        }),

      resolveReport: (reportId) =>
        set((state) => {
          const report = state.reports.find((r) => r.id === reportId);
          const updatedReports = state.reports.map((r) =>
            r.id === reportId ? { ...r, status: 'resolved' } : r
          );
          const updatedDevices = state.devices.map((d) =>
            d.id === report?.deviceId ? { ...d, status: 'recovered' } : d
          );
          return { reports: updatedReports, devices: updatedDevices };
        }),

      addTransfer: (payload) =>
        set((state) => {
          const newTransfer = {
            id: `TRF-${Date.now()}`,
            deviceId: payload.deviceId,
            sellerId: state.currentUserId,
            buyerId: null,
            pin: payload.pin || generateTransferPin(),
            status: 'pending',
            createdAt: nowString(),
            priceMWK: payload.priceMWK || 0,
          };
          return { transfers: [...state.transfers, newTransfer] };
        }),

      completeTransfer: (payload) =>
        set((state) => {
          const updatedTransfers = state.transfers.map((t) =>
            t.id === payload.transferId
              ? { ...t, status: 'completed', buyerId: payload.buyerId }
              : t
          );
          const transfer = state.transfers.find((t) => t.id === payload.transferId);
          const updatedDevices = state.devices.map((d) =>
            d.id === transfer?.deviceId ? { ...d, ownerId: payload.buyerId } : d
          );
          return { transfers: updatedTransfers, devices: updatedDevices };
        }),

      sendReminder: (payload) =>
        set((state) => {
          const newReminder = {
            id: `RMD-${Date.now()}`,
            reportId: payload.reportId,
            caseNumber: payload.caseNumber,
            fromUserId: state.currentUserId,
            message: payload.message,
            detectionCount: payload.detectionCount,
            area: payload.area,
            operator: payload.operator,
            sentAt: nowString(),
            read: false,
            acknowledged: false,
          };
          return { reminders: [...state.reminders, newReminder] };
        }),

      acknowledgeReminder: (reminderId) =>
        set((state) => {
          const updatedReminders = state.reminders.map((r) =>
            r.id === reminderId
              ? { ...r, read: true, acknowledged: true, acknowledgedAt: nowString() }
              : r
          );
          return { reminders: updatedReminders };
        }),

      updateDeviceLocation: (payload) =>
        set((state) => {
          const { deviceId, lat, lng, timestamp } = payload;
          const report = state.reports.find((r) => r.deviceId === deviceId);

          const newEvent = {
            id: `WS-EVT-${Date.now()}`,
            reportId: report ? report.id : 'RPT-WS-MOCK',
            operator: 'Airtel',
            detectedAt: timestamp.replace('T', ' ').substring(0, 16),
            latitude: lat,
            longitude: lng,
            tower: 'Live Cellular Ping',
            activeSim: '099XXXXX',
            isLatest: true,
          };

          const updatedDevices = state.devices.map((d) =>
            d.id === deviceId ? { ...d, location: { lat, lng }, lastPing: timestamp } : d
          );
          return {
            devices: updatedDevices,
            events: [...state.events, newEvent],
          };
        }),

      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      openModal: (name, data = null) => set({ modal: name, modalData: data }),

      closeModal: () => set({ modal: null, modalData: null }),

      showToast: (payload) => set({ toast: payload }),

      hideToast: () => set({ toast: null }),
    }),
    {
      name: 'sidrs_state_v1', // use same key for persistence continuity
      partialize: (state) => {
        const { toast, modal, modalData, ...rest } = state;
        return rest; // don't persist these UI states
      },
    }
  )
);

// ─── CONVENIENCE HOOKS ──────────────────────────────────────────

export function useCurrentUser() {
  return useAppStore(
    useShallow((state) => {
      return state.users.find((u) => u.id === state.currentUserId) || state.users[0];
    })
  );
}

export function useMyDevices() {
  return useAppStore(
    useShallow((state) => state.devices.filter((d) => d.ownerId === state.currentUserId))
  );
}

export function useMyReports() {
  return useAppStore(
    useShallow((state) => state.reports.filter((r) => r.reportedBy === state.currentUserId))
  );
}

export function useHasAccess(technicalRoles) {
  const currentUserId = useAppStore((state) => state.currentUserId);
  const users = useAppStore((state) => state.users);
  const user = users.find((u) => u.id === currentUserId) || users[0];
  if (!user) return false;

  const allowed = Array.isArray(technicalRoles) ? technicalRoles : [technicalRoles];
  return allowed.includes(user.role);
}

// Global timer ref for toast to prevent overlapping
let toastTimer = null;

export function useToast() {
  // Return a stable function that reads from getState() at call time.
  // No subscriptions — this function never causes a re-render.
  return React.useCallback((message, subMessage = '', type = 'success') => {
    if (toastTimer) clearTimeout(toastTimer);
    useAppStore.getState().showToast({ message, subMessage, type });
    toastTimer = setTimeout(() => {
      useAppStore.getState().hideToast();
      toastTimer = null;
    }, 4500);
  }, []); // empty deps — stable forever
}

// ─── BACKWARD COMPATIBILITY WRAPPERS ─────────────────────────

export function useAppState() {
  return useAppStore();
}

export function useAppDispatch() {
  // Return a stable dispatch function that reads actions from getState() at call time.
  // Zero subscriptions — this function never causes a re-render.
  return React.useCallback((action) => {
    const s = useAppStore.getState();
    const { type, payload } = action;
    switch (type) {
      case 'HYDRATE_STATE':
        return;
      case 'SET_USER':
        return s.setUser(payload);
      case 'REGISTER_DEVICE':
        return s.registerDevice(payload);
      case 'SUBMIT_REPORT':
        return s.submitReport(payload);
      case 'VERIFY_REPORT':
        return s.verifyReport(payload.reportId);
      case 'RESOLVE_REPORT':
        return s.resolveReport(payload.reportId);
      case 'ADD_TRANSFER':
        return s.addTransfer(payload);
      case 'COMPLETE_TRANSFER':
        return s.completeTransfer(payload);
      case 'SEND_REMINDER':
        return s.sendReminder(payload);
      case 'ACKNOWLEDGE_REMINDER':
        return s.acknowledgeReminder(payload.reminderId);
      case 'TOGGLE_THEME':
        return s.toggleTheme();
      case 'OPEN_MODAL':
        return s.openModal(payload.name, payload.data);
      case 'CLOSE_MODAL':
        return s.closeModal();
      case 'SHOW_TOAST':
        return s.showToast(payload);
      case 'HIDE_TOAST':
        return s.hideToast();
      default:
        console.warn('Unknown action:', action);
    }
  }, []); // empty deps — stable forever
}

export function AppProvider({ children }) {
  return children;
}

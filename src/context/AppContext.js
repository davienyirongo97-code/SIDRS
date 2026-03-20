/**
 * src/context/AppContext.js
 * ─────────────────────────────────────────────
 * Global state management using React Context + useReducer.
 *
 * This replaces Redux for this project — it's simpler and built
 * into React itself. All pages and components can read from and
 * write to this global state.
 *
 * STATE SHAPE:
 *   currentUserId  — the logged-in user's ID
 *   devices        — array of all registered devices
 *   reports        — array of all theft reports
 *   events         — array of all network detection events
 *   transfers      — array of all ownership transfers
 *   modal          — which modal is currently open (or null)
 *   modalData      — data passed into the open modal
 *   toast          — current toast notification (or null)
 *
 * ACTIONS (dispatched via dispatch({ type: '...', payload: ... })):
 *   SET_USER         — switch the current user
 *   REGISTER_DEVICE  — add a new device
 *   SUBMIT_REPORT    — add a new theft report + flag device stolen
 *   VERIFY_REPORT    — police verifies a pending report → active
 *   RESOLVE_REPORT   — close a report → mark device recovered
 *   ADD_TRANSFER     — initiate a transfer (generates PIN)
 *   OPEN_MODAL       — show a modal dialog
 *   CLOSE_MODAL      — hide the modal
 *   SHOW_TOAST       — show a toast notification
 *   HIDE_TOAST       — hide the toast
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import {
  INITIAL_USERS,
  INITIAL_DEVICES,
  INITIAL_REPORTS,
  INITIAL_EVENTS,
  INITIAL_TRANSFERS,
  INITIAL_REMINDERS,
} from '../data/mockData';

// ─── CONTEXT SETUP ────────────────────────────────────────────
// AppContext is split into two:
//   AppStateContext  — read-only state
//   AppDispatchContext — dispatch actions
// This avoids re-rendering components that only dispatch.
const AppStateContext    = createContext(null);
const AppDispatchContext = createContext(null);

// ─── INITIAL STATE ────────────────────────────────────────────
const STORAGE_KEY = 'sidrs_state_v1';

const initialState = {
  currentUserId: 'U001',
  users:         INITIAL_USERS,
  devices:       INITIAL_DEVICES,
  reports:       INITIAL_REPORTS,
  events:        INITIAL_EVENTS,
  transfers:     INITIAL_TRANSFERS,
  reminders:     INITIAL_REMINDERS,       // citizen follow-up reminders sent to police
  modal:         null,
  modalData:     null,
  toast:         null,
  theme:         'light',
};

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

function generateTransferPin() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const block = () =>
    Array(4).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `TRF-${block()}-${block()}`;
}

function nowString() {
  const d = new Date();
  return `${d.toISOString().slice(0, 10)} ${d.toTimeString().slice(0, 5)}`;
}

// ─── REDUCER ─────────────────────────────────────────────────
function appReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE_STATE':
      return { ...state, ...action.payload, toast: null, modal: null };

    // Switch the currently logged-in user (demo only)
    case 'SET_USER':
      return { ...state, currentUserId: action.payload };

    // Add a new device to the registry
    case 'REGISTER_DEVICE': {
      const newDevice = {
        ...action.payload,
        id: makeId('D'),
        ownerId: state.currentUserId,
        registeredDate: new Date().toISOString().slice(0, 10),
        status: 'registered',
      };
      return { ...state, devices: [...state.devices, newDevice] };
    }

    // File a theft report + mark the device as stolen
    case 'SUBMIT_REPORT': {
      const newReport = {
        ...action.payload,
        id: makeReportId(state.reports),
        reportedBy: state.currentUserId,
        status: 'pending',
        verifiedAt: null,
        dispatched: false,
        caseNumber: null,
      };
      // Mark device as stolen
      const updatedDevices = state.devices.map(d =>
        d.id === action.payload.deviceId ? { ...d, status: 'stolen' } : d
      );
      return {
        ...state,
        reports: [...state.reports, newReport],
        devices: updatedDevices,
      };
    }

    // Police verifies a pending report → status becomes 'active'
    // Network alert is dispatched to Airtel & TNM
    case 'VERIFY_REPORT': {
      const caseNum = `MPS-LLW-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const updatedReports = state.reports.map(r =>
        r.id === action.payload.reportId
          ? {
              ...r,
              status: 'active',
              verifiedAt: new Date().toISOString().slice(0, 10),
              dispatched: true,
              caseNumber: caseNum,
            }
          : r
      );
      return { ...state, reports: updatedReports };
    }

    // Mark report as resolved + device as recovered
    case 'RESOLVE_REPORT': {
      const report = state.reports.find(r => r.id === action.payload.reportId);
      const updatedReports = state.reports.map(r =>
        r.id === action.payload.reportId ? { ...r, status: 'resolved' } : r
      );
      const updatedDevices = state.devices.map(d =>
        d.id === report?.deviceId ? { ...d, status: 'recovered' } : d
      );
      return { ...state, reports: updatedReports, devices: updatedDevices };
    }

    // Initiate an ownership transfer → generate Transfer PIN
    case 'ADD_TRANSFER': {
      const newTransfer = {
        id: `TRF-${Date.now()}`,
        deviceId: action.payload.deviceId,
        sellerId: state.currentUserId,
        buyerId: null,
        pin: generateTransferPin(),
        status: 'pending',
        createdAt: nowString(),
        priceMWK: action.payload.priceMWK || 0,
      };
      return { ...state, transfers: [...state.transfers, newTransfer] };
    }

    // Complete a transfer (buyer claimed the PIN)
    case 'COMPLETE_TRANSFER': {
      const updatedTransfers = state.transfers.map(t =>
        t.id === action.payload.transferId
          ? { ...t, status: 'completed', buyerId: action.payload.buyerId }
          : t
      );
      // Update device owner
      const transfer = state.transfers.find(t => t.id === action.payload.transferId);
      const updatedDevices = state.devices.map(d =>
        d.id === transfer?.deviceId
          ? { ...d, ownerId: action.payload.buyerId }
          : d
      );
      return { ...state, transfers: updatedTransfers, devices: updatedDevices };
    }

    // Citizen sends a follow-up reminder to police
    case 'SEND_REMINDER': {
      const newReminder = {
        id:             `RMD-${Date.now()}`,
        reportId:       action.payload.reportId,
        caseNumber:     action.payload.caseNumber,
        fromUserId:     state.currentUserId,
        message:        action.payload.message,
        detectionCount: action.payload.detectionCount,
        area:           action.payload.area,
        operator:       action.payload.operator,
        sentAt:         nowString(),
        read:           false,
        acknowledged:   false,
      };
      return { ...state, reminders: [...state.reminders, newReminder] };
    }

    // Police acknowledges a reminder
    case 'ACKNOWLEDGE_REMINDER': {
      const updatedReminders = state.reminders.map(r =>
        r.id === action.payload.reminderId
          ? { ...r, read: true, acknowledged: true, acknowledgedAt: nowString() }
          : r
      );
      return { ...state, reminders: updatedReminders };
    }

    // Show a modal: { name: 'registerDevice', data: {...} }
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };

    case 'OPEN_MODAL':
      return {
        ...state,
        modal: action.payload.name,
        modalData: action.payload.data || null,
      };

    // Hide the currently open modal
    case 'CLOSE_MODAL':
      return { ...state, modal: null, modalData: null };

    // Show a toast: { message, subMessage, type: 'success'|'error'|'warn'|'info' }
    case 'SHOW_TOAST':
      return { ...state, toast: action.payload };

    // Hide toast
    case 'HIDE_TOAST':
      return { ...state, toast: null };

    default:
      return state;
  }
}

// ─── PROVIDER ────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const isHydrated = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'HYDRATE_STATE', payload: parsed });
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    }
    isHydrated.current = true;
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    if (isHydrated.current) {
      const { toast, modal, modalData, ...rest } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    }
  }, [state]);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

// ─── HOOKS ───────────────────────────────────────────────────
// Use these hooks inside any component to access state or dispatch.

/** Read global state */
export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside <AppProvider>');
  return ctx;
}

/** Dispatch actions to update global state */
export function useAppDispatch() {
  const ctx = useContext(AppDispatchContext);
  if (!ctx) throw new Error('useAppDispatch must be used inside <AppProvider>');
  return ctx;
}

/**
 * Convenience hook — returns the current logged-in user object.
 * Usage: const user = useCurrentUser();
 */
export function useCurrentUser() {
  const { currentUserId, users } = useAppState();
  return users.find(u => u.id === currentUserId) || users[0];
}

/**
 * Convenience hook — returns devices owned by the current user.
 * Usage: const myDevices = useMyDevices();
 */
export function useMyDevices() {
  const { devices, currentUserId } = useAppState();
  return devices.filter(d => d.ownerId === currentUserId);
}

/**
 * Convenience hook — returns theft reports by the current user.
 * Usage: const myReports = useMyReports();
 */
export function useMyReports() {
  const { reports, currentUserId } = useAppState();
  return reports.filter(r => r.reportedBy === currentUserId);
}

/** Improved Toast hook with auto-clear to prevent overlapping timers */
export function useToast() {
  const dispatch = useAppDispatch();
  const timerRef = useRef(null);

  return useCallback(
    (message, subMessage = '', type = 'success') => {
      // Clear any existing timer
      if (timerRef.current) clearTimeout(timerRef.current);
      
      dispatch({ type: 'SHOW_TOAST', payload: { message, subMessage, type } });
      
      // Auto-hide after 4.5 seconds and store ref
      timerRef.current = setTimeout(() => {
        dispatch({ type: 'HIDE_TOAST' });
        timerRef.current = null;
      }, 4500);
    },
    [dispatch]
  );
}

/**
 * RBAC Hook: Checks if the current user has the required role.
 * @param {string|string[]} technicalRoles - 'citizen', 'police', 'macra'
 * @returns {boolean}
 */
export function useHasAccess(technicalRoles) {
  const user = useCurrentUser();
  if (!user) return false;
  
  const allowed = Array.isArray(technicalRoles) ? technicalRoles : [technicalRoles];
  return allowed.includes(user.role);
}

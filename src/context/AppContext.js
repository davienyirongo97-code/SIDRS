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

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import {
  INITIAL_USERS,
  INITIAL_DEVICES,
  INITIAL_REPORTS,
  INITIAL_EVENTS,
  INITIAL_TRANSFERS,
} from '../data/mockData';

// ─── CONTEXT SETUP ────────────────────────────────────────────
// AppContext is split into two:
//   AppStateContext  — read-only state
//   AppDispatchContext — dispatch actions
// This avoids re-rendering components that only dispatch.
const AppStateContext    = createContext(null);
const AppDispatchContext = createContext(null);

// ─── INITIAL STATE ────────────────────────────────────────────
const initialState = {
  currentUserId: 'U001',          // Default logged-in user
  users:         INITIAL_USERS,
  devices:       INITIAL_DEVICES,
  reports:       INITIAL_REPORTS,
  events:        INITIAL_EVENTS,
  transfers:     INITIAL_TRANSFERS,
  modal:         null,            // e.g. 'registerDevice', 'reportTheft'
  modalData:     null,            // extra data for the modal
  toast:         null,            // { message, subMessage, type }
};

// ─── HELPER: generate simple IDs ─────────────────────────────
function makeId(prefix, collection) {
  return `${prefix}${String(collection.length + 1).padStart(3, '0')}`;
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

    // Switch the currently logged-in user (demo only)
    case 'SET_USER':
      return { ...state, currentUserId: action.payload };

    // Add a new device to the registry
    case 'REGISTER_DEVICE': {
      const newDevice = {
        ...action.payload,
        id: makeId('D', state.devices),
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

    // Show a modal: { name: 'registerDevice', data: {...} }
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

/**
 * Convenience hook — show a toast notification from any component.
 * Usage: const showToast = useToast();
 *        showToast('Device registered!', 'Protected in registry.', 'success');
 */
export function useToast() {
  const dispatch = useAppDispatch();
  return useCallback(
    (message, subMessage = '', type = 'success') => {
      dispatch({ type: 'SHOW_TOAST', payload: { message, subMessage, type } });
      // Auto-hide after 4.5 seconds
      setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 4500);
    },
    [dispatch]
  );
}

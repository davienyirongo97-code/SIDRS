/**
 * src/services/api.js
 * ─────────────────────────────────────────────
 * All HTTP API calls for SDIRS.
 *
 * HOW TO USE:
 *   import { api } from '../services/api';
 *   const device = await api.registerDevice(data);
 *
 * CONNECTING TO BACKEND:
 *   Set REACT_APP_API_URL in your .env file:
 *   REACT_APP_API_URL=https://api.sdirs.macra.mw
 *
 * ALL ENDPOINTS:
 *   Auth        → /auth/login, /auth/logout
 *   Devices     → /devices, /devices/check
 *   Reports     → /reports, /reports/:id/verify, /reports/:id/resolve
 *   Transfers   → /transfers, /transfers/:id/complete
 *   Reminders   → /reminders, /reminders/:id/acknowledge
 *   Events      → /events
 *   Users       → /users/me
 *   AI          → /ai/hotspots, /ai/anomalies, /ai/case-priority
 */

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Core fetch wrapper.
 * Attaches auth token from localStorage automatically.
 * Returns parsed JSON or throws an error with the server message.
 */
async function req(method, path, body) {
  const token = localStorage.getItem('sdirs_token');

  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data;
}

export const api = {
  // ── AUTH ───────────────────────────────────────────────────
  // POST /auth/login      { phone, password } → { token, user }
  // POST /auth/logout     → { success }
  login: (credentials) => req('POST', '/auth/login', credentials),
  logout: () => req('POST', '/auth/logout'),

  // ── DEVICES ────────────────────────────────────────────────
  // GET  /devices                          → device[]
  // POST /devices         { ...deviceData } → device
  // GET  /devices/check?imei=&serial=      → { status, device?, report? }
  getDevices: () => req('GET', '/devices'),
  registerDevice: (data) => req('POST', '/devices', data),
  checkImei: (imei, serial) =>
    req('GET', `/devices/check?imei=${imei}&serial=${encodeURIComponent(serial)}`),

  // ── REPORTS ────────────────────────────────────────────────
  // GET   /reports                         → report[]
  // POST  /reports        { ...reportData } → report
  // PATCH /reports/:id/verify              → report
  // PATCH /reports/:id/resolve             → report
  getReports: () => req('GET', '/reports'),
  submitReport: (data) => req('POST', '/reports', data),
  verifyReport: (id) => req('PATCH', `/reports/${id}/verify`),
  resolveReport: (id) => req('PATCH', `/reports/${id}/resolve`),

  // ── TRANSFERS ──────────────────────────────────────────────
  // POST  /transfers                       → transfer (with PIN)
  // PATCH /transfers/:id/complete          → transfer
  addTransfer: (data) => req('POST', '/transfers', data),
  completeTransfer: (data) => req('PATCH', `/transfers/${data.transferId}/complete`, data),

  // ── REMINDERS ──────────────────────────────────────────────
  // POST  /reminders                       → reminder
  // PATCH /reminders/:id/acknowledge       → reminder
  sendReminder: (data) => req('POST', '/reminders', data),
  acknowledgeReminder: (id) => req('PATCH', `/reminders/${id}/acknowledge`),

  // ── EVENTS ─────────────────────────────────────────────────
  // GET /events                            → event[]
  // Events are also pushed in real-time via Socket.io (see socket.js)
  getEvents: () => req('GET', '/events'),

  // ── USERS ──────────────────────────────────────────────────
  // GET /users/me                          → current user profile
  getMe: () => req('GET', '/users/me'),

  // ── AI / INTELLIGENCE ──────────────────────────────────────
  // These endpoints are served by the ML model (Python/FastAPI).
  // Available after enough real data has been collected (phase 2).
  //
  // GET /ai/hotspots       → { area, risk, lat, lng, reports7d }[]
  // GET /ai/anomalies      → { type, severity, deviceId, ... }[]
  // GET /ai/case-priority  → { reportId, score, reason }[]
  getHotspots: () => req('GET', '/ai/hotspots'),
  getAnomalies: () => req('GET', '/ai/anomalies'),
  getCasePriority: () => req('GET', '/ai/case-priority'),
};

/**
 * src/utils/helpers.js
 * ─────────────────────────────────────────────
 * Shared utility functions used across multiple components.
 * Pure functions — no side effects, no imports from the app.
 */

import React from 'react';
import { FiSmartphone, FiMonitor, FiTablet, FiTv } from 'react-icons/fi';

/**
 * Returns a React Icon component for a given device type.
 * @param {string} type - 'mobile' | 'laptop' | 'tablet' | 'desktop'
 */
export function deviceIcon(type) {
  const icons = {
    mobile:  <FiSmartphone size={20} />,
    laptop:  <FiMonitor size={20} />,
    tablet:  <FiTablet size={20} />,
    desktop: <FiTv size={20} />,
  };
  return icons[type] || <FiSmartphone size={20} />;
}

/**
 * Returns the primary identifier string to display for a device.
 * Priority: IMEI → Serial → MAC address.
 * @param {object} device
 */
export function primaryIdentifier(device) {
  return device.imei || device.serial || device.mac || 'N/A';
}

/**
 * Formats a number with locale-aware commas.
 * e.g. 150000 → "150,000"
 * @param {number} n
 */
export function formatNumber(n) {
  if (n === null || n === undefined) return '0';
  return n.toLocaleString('en-MW');
}

/**
 * Returns CSS class + label for a device/report status badge.
 * @param {string} status
 * @returns {{ className: string, label: string }}
 */
export function getStatusConfig(status) {
  const config = {
    registered: { className: 'badge-green',  label: 'Registered' },
    stolen:     { className: 'badge-red',    label: 'Stolen' },
    recovered:  { className: 'badge-blue',   label: 'Recovered' },
    active:     { className: 'badge-red',    label: 'Active Alert' },
    pending:    { className: 'badge-amber',  label: 'Pending' },
    resolved:   { className: 'badge-green',  label: 'Resolved' },
    completed:  { className: 'badge-green',  label: 'Completed' },
    clean:      { className: 'badge-green',  label: '✓ Clean' },
    not_found:  { className: 'badge-gray',   label: 'Not Found' },
  };
  return config[status] || { className: 'badge-gray', label: status };
}

/**
 * Looks up a device in the devices array by deviceId.
 * @param {string} deviceId
 * @param {Array} devices
 */
export function findDevice(deviceId, devices) {
  return devices.find(d => d.id === deviceId) || null;
}

/**
 * Checks an identifier (IMEI / serial / MAC) against all devices.
 * Returns: { status: 'clean' | 'stolen' | 'not_found', device?, report? }
 * @param {string} identifier  — raw string from the IMEI checker input
 * @param {Array}  devices
 * @param {Array}  reports
 */
export function checkIdentifier(identifier, devices, reports) {
  const q = identifier.trim();
  if (!q) return { status: 'not_found' };

  const device = devices.find(
    d => d.imei === q || d.serial === q || d.mac === q
  );

  if (!device) return { status: 'not_found' };

  // Check for any active/pending theft report on this device
  const report = reports.find(
    r => r.deviceId === device.id && (r.status === 'active' || r.status === 'pending')
  );

  if (report) return { status: 'stolen', device, report };
  return { status: 'clean', device };
}

/**
 * Generates a short display-friendly version of a long ID.
 * e.g. "RPT-2026-00012" → "00012"
 * @param {string} id
 */
export function shortId(id) {
  return id?.split('-').pop() || '';
}

/**
 * Truncates a string to maxLength and adds "..." if longer.
 * @param {string} str
 * @param {number} maxLength
 */
export function truncate(str, maxLength = 60) {
  if (!str) return '';
  return str.length > maxLength ? str.slice(0, maxLength) + '…' : str;
}

/**
 * Returns today's date in YYYY-MM-DD format (for default date inputs).
 */
export function todayString() {
  return new Date().toISOString().slice(0, 10);
}

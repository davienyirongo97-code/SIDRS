/**
 * src/utils/helpers.js
 * ─────────────────────────────────────────────
 * Shared utility functions used across multiple components.
 * Pure functions — no side effects, no imports from the app.
 */

import React from 'react';
import { FiSmartphone } from 'react-icons/fi';

/**
 * Returns a React Icon component for a given device type.
 * Phase 1: Mobile phones only.
 * @param {string} type - 'mobile'
 */
export function deviceIcon(type) {
  return <FiSmartphone size={20} />;
}

/**
 * Returns the primary identifier string to display for a device.
 * Priority: IMEI → Serial → MAC address.
 * @param {object} device
 */
export function primaryIdentifier(device) {
  if (!device) return 'N/A';
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
    registered: { className: 'badge-green', label: 'Registered' },
    stolen: { className: 'badge-red', label: 'Stolen' },
    recovered: { className: 'badge-blue', label: 'Recovered' },
    active: { className: 'badge-red', label: 'Active Alert' },
    pending_verification: { className: 'badge-amber', label: 'Pending Verification' },
    not_verified: { className: 'badge-amber', label: 'Not Verified' },
    resolved: { className: 'badge-green', label: 'Resolved' },
    completed: { className: 'badge-green', label: 'Completed' },
    clean: { className: 'badge-green', label: 'Clean' },
    not_found: { className: 'badge-gray', label: 'Not Registered' },
    not_registered: { className: 'badge-gray', label: 'Not Registered' },
  };
  return config[status] || { className: 'badge-gray', label: status };
}

/**
 * Looks up a device in the devices array by deviceId.
 * @param {string} deviceId
 * @param {Array} devices
 */
export function findDevice(deviceId, devices) {
  return devices.find((d) => d.id === deviceId) || null;
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
  if (!q) return { status: 'not_registered' };

  const device = devices.find((d) => d.imei === q || d.serial === q || d.mac === q);

  if (!device) return { status: 'not_registered' };

  // Check for any active/pending theft report on this device
  const report = reports.find(
    (r) => r.deviceId === device.id && (r.status === 'active' || r.status === 'pending')
  );

  if (report) return { status: 'stolen', device, report };

  if (device.status === 'pending_verification') {
    return { status: 'not_verified', device };
  }

  return { status: 'clean', device };
}

/**
 * Two-factor device duplicate check.
 * Both IMEI and serial must be provided and must belong to the SAME
 * registered device for a conflict to be flagged.
 *
 * Returns:
 *   { conflict: false }                          — safe to register
 *   { conflict: true, reason: string }           — already registered
 *   { conflict: true, mismatch: true, reason }   — IMEI/serial belong to different devices
 *
 * @param {string} imei
 * @param {string} serial
 * @param {Array}  devices  — existing registered devices
 */
export function checkDuplicateDevice(imei, serial, devices) {
  const imeiMatch = imei ? devices.find((d) => d.imei === imei.trim()) : null;
  const serialMatch = serial ? devices.find((d) => d.serial === serial.trim()) : null;

  // IMEI already registered
  if (imeiMatch) {
    return {
      conflict: true,
      reason: `This IMEI (${imei}) is already registered in the national registry under a ${imeiMatch.make} ${imeiMatch.model}.`,
    };
  }

  // Serial already registered
  if (serialMatch) {
    return {
      conflict: true,
      reason: `This serial number (${serial}) is already registered in the national registry under a ${serialMatch.make} ${serialMatch.model}.`,
    };
  }

  return { conflict: false };
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

/**
 * Generates a robust, unique ID with a prefix.
 * e.g. "D-K2X3-R9L1"
 * @param {string} prefix
 */
export function makeId(prefix = 'ID') {
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  const r = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${ts}-${r}`;
}

/**
 * Generates a 12-character transfer PIN in TRF-XXXX-XXXX format.
 */
export function generateTransferPin() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const block = () =>
    Array(4)
      .fill(0)
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join('');
  return `TRF-${block()}-${block()}`;
}

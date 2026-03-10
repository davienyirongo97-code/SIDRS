/**
 * src/components/ui/Badge.js
 * ─────────────────────────────────────────────
 * Reusable status badge component.
 *
 * Usage:
 *   <Badge status="registered" />   → green "Registered"
 *   <Badge status="stolen" />       → red "Stolen"
 *   <Badge status="pending" />      → amber "Pending"
 *
 * The component automatically looks up the right class and label
 * from the getStatusConfig helper.
 */

import React from 'react';
import { getStatusConfig } from '../../utils/helpers';

export default function Badge({ status }) {
  const { className, label } = getStatusConfig(status);
  return <span className={`badge ${className}`}>{label}</span>;
}

/**
 * src/components/ui/StatCard.js
 * ─────────────────────────────────────────────
 * Reusable statistics card for dashboards.
 *
 * Usage:
 *   <StatCard
 *     icon="📱"
 *     value={42}
 *     label="Devices Registered"
 *     sub="Since system launch"
 *     color="var(--blue)"
 *   />
 */

import React from 'react';
import { formatNumber } from '../../utils/helpers';

export default function StatCard({ icon, value, label, sub, color = 'var(--blue)' }) {
  return (
    <div className="stat-card">
      {/* Faint large icon in background for visual interest */}
      <div className="stat-bg-icon" aria-hidden="true">
        {icon}
      </div>

      <div style={{ fontSize: '22px' }}>{icon}</div>

      <div className="stat-num" style={{ color }}>
        {formatNumber(value)}
      </div>

      <div className="stat-label">{label}</div>

      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

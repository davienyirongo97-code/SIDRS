/**
 * src/components/pages/IntelligenceFeedPage.js
 */

import React from 'react';
import { useAppState } from '../../context/AppContext';
import { findDevice } from '../../utils/helpers';
import StatCard from '../ui/StatCard';

export default function IntelligenceFeedPage() {
  const { events, reports, devices } = useAppState();
  const airtel = events.filter(e => e.operator === 'Airtel');
  const tnm    = events.filter(e => e.operator === 'TNM');

  return (
    <div className="fade-up">
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <StatCard icon="📡" value={events.length}  label="Total Network Events" sub="Since system launch"          color="var(--blue)" />
        <StatCard icon="🚨" value={reports.filter(r=>r.status==='active').length} label="Active Monitored Devices" sub="On EIR Grey List" color="var(--red)" />
      </div>

      <div className="grid-2">

        {/* Detection timeline */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>📊 Detection Timeline</div>
          <div className="timeline">
            {events.slice().reverse().map((ev, i, arr) => {
              const report = reports.find(r => r.id === ev.reportId);
              const device = report ? findDevice(report.deviceId, devices) : null;
              return (
                <div className="timeline-item" key={ev.id}>
                  {i < arr.length - 1 && <div className="timeline-line" />}
                  <div className="timeline-dot" style={{ background: ev.operator === 'Airtel' ? 'var(--red)' : 'var(--blue)' }}>📡</div>
                  <div className="timeline-content">
                    <div className="timeline-title">{device?.make} {device?.model} · {ev.operator}</div>
                    <div className="timeline-sub">
                      {ev.detectedAt} · {ev.tower}<br />
                      SIM: <span style={{ fontFamily: 'var(--font-mono)' }}>{ev.activeSim}</span><br />
                      {ev.latitude.toFixed(4)}°S, {ev.longitude.toFixed(4)}°E · ±{ev.radiusMeters}m
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          {/* Telecom status */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 16 }}>📡 Telecom Integration Status</div>
            {[
              { name: 'Airtel Malawi', events: airtel.length, color: 'var(--red)' },
              { name: 'TNM',           events: tnm.length,    color: 'var(--blue)' },
            ].map(op => (
              <div key={op.name} style={{ padding: 14, background: 'var(--bg)', borderRadius: 'var(--radius-2)', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{op.name}</div>
                  <div className="live-badge" style={{ fontSize: 10 }}>● Online</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)' }}>
                  <span>Detections: <strong style={{ color: op.color }}>{op.events}</strong></span>
                  <span>EIR: <strong style={{ color: 'var(--green)' }}>Active</strong></span>
                </div>
                <div className="progress-bar" style={{ marginTop: 10 }}>
                  <div className="progress-fill" style={{ width: `${(op.events / events.length * 100).toFixed(0)}%`, background: op.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* EIR flow */}
          <div className="card" style={{ background: 'var(--navy)', borderColor: 'transparent' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>EIR Integration Flow</div>
            {[
              'Police verifies the theft report',
              'SDIRS pushes IMEI to Airtel & TNM EIR Grey List',
              'Device stays active on network (not blocked)',
              'Every connection → operator sends detection event to SDIRS',
              'SDIRS maps SIM + tower + GPS → police dashboard',
              'Officer dispatched based on last known location',
            ].map((step, i) => (
              <div key={step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--blue-3)', flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', paddingTop: 3, lineHeight: 1.5 }}>{step}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

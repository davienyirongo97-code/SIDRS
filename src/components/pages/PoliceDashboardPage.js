/**
 * src/components/pages/PoliceDashboardPage.js
 * ─────────────────────────────────────────────
 * Police officer case management and intelligence dashboard.
 * Shows pending reports (to verify), active cases with network
 * detections, and a simulated map of active device locations.
 */

import React, { useState } from 'react';
import { useAppState, useToast } from '../../context/AppContext';
import { deviceIcon, findDevice } from '../../utils/helpers';
import Badge from '../ui/Badge';
import DeviceLookup from '../ui/DeviceLookup';
import VerifyReportModal from '../modals/VerifyReportModal';

export default function PoliceDashboardPage() {
  const { reports, devices, events } = useAppState();
  const showToast = useToast();

  const [activeTab, setActiveTab] = useState('pending');
  const [verifyId, setVerifyId]   = useState(null);  // reportId to verify

  const pending  = reports.filter(r => r.status === 'pending');
  const active   = reports.filter(r => r.status === 'active');
  const resolved = reports.filter(r => r.status === 'resolved');

  const tabReports = { pending, active, resolved }[activeTab] || [];

  const TABS = [
    { key: 'pending',  label: 'Pending',  count: pending.length,  color: 'var(--amber)' },
    { key: 'active',   label: 'Active',   count: active.length,   color: 'var(--red)' },
    { key: 'resolved', label: 'Resolved', count: resolved.length, color: 'var(--green)' },
  ];

  return (
    <div className="fade-up">

      {/* ── Police banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1a0508, #2d0f0f, var(--navy))',
        borderRadius: 'var(--radius)', padding: '24px 28px', marginBottom: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Malawi Police Service</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#fff' }}>👮 SDIRS Intelligence Dashboard</div>
          <div style={{ display: 'flex', gap: 28, marginTop: 12, flexWrap: 'wrap' }}>
            {[
              [pending.length,  'Pending',       'var(--amber-2)'],
              [active.length,   'Active Alerts', 'var(--red-2)'],
              [events.length,   'Intel Events',  'var(--blue-3)'],
              [resolved.length, 'Resolved',      '#80E890'],
            ].map(([n, label, color]) => (
              <div key={label}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color }}>{n}</span>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="live-badge">Network Monitoring LIVE</div>
      </div>

      {/* ── Device Owner Lookup ── full owner profile search by IMEI/serial/MAC ── */}
      <DeviceLookup />

      <div className="grid-2">

        {/* ── Case management ── */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📋 Case Management</div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6 }}>
              {TABS.map(t => (
                <button
                  key={t.key}
                  style={{
                    padding: '5px 13px', borderRadius: 8, border: '1px solid var(--muted-3)',
                    background: activeTab === t.key ? t.color : 'var(--bg)',
                    color: activeTab === t.key ? '#fff' : 'var(--muted)',
                    fontSize: 11, fontWeight: 800, cursor: 'pointer', transition: 'all .15s',
                  }}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label} ({t.count})
                </button>
              ))}
            </div>
          </div>

          {tabReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>No {activeTab} reports</div>
          ) : (
            tabReports.map(report => {
              const device  = findDevice(report.deviceId, devices);
              const devEvts = events.filter(e => e.reportId === report.id);

              return (
                <div key={report.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--muted-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 7 }}>
                        {deviceIcon(device?.type)} {device?.make} {device?.model}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>📅 {report.date} · 📍 {report.location.split(',')[0]}</div>
                      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted-2)' }}>{report.id}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
                      <Badge status={report.status} />
                      {report.status === 'pending' && (
                        <button className="btn btn-amber btn-sm" onClick={() => setVerifyId(report.id)}>
                          Review &amp; Verify →
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Network detections summary */}
                  {devEvts.length > 0 && (
                    <div style={{ padding: '8px 12px', background: 'var(--red-pale)', borderRadius: 8, fontSize: 11, color: 'var(--red)', fontWeight: 700 }}>
                      📡 {devEvts.length} detection{devEvts.length > 1 ? 's' : ''} · Latest: {devEvts[devEvts.length - 1].tower}
                    </div>
                  )}

                  {report.caseNumber && (
                    <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--blue)', marginTop: 6, fontWeight: 700 }}>{report.caseNumber}</div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ── Live intelligence feed ── */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📡 Live Intelligence Feed</div>
            <div className="live-badge">● LIVE</div>
          </div>

          {/* Network status bar */}
          <div style={{ padding: '10px 14px', background: 'var(--navy)', borderRadius: 10, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}>Network Monitoring Active</span>
            <span style={{ fontSize: 12, color: 'var(--green-2)', fontWeight: 800 }}>Airtel ● TNM ●</span>
          </div>

          {events.slice().reverse().map(ev => {
            const report = reports.find(r => r.id === ev.reportId);
            const device = report ? findDevice(report.deviceId, devices) : null;

            return (
              <div key={ev.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--muted-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800,
                    background: ev.operator === 'Airtel' ? 'var(--red-pale)' : '#EBF3FF',
                    color:      ev.operator === 'Airtel' ? 'var(--red)'      : 'var(--blue)',
                  }}>
                    {ev.operator}
                  </span>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>{ev.detectedAt}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>{device?.make} {device?.model}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>📍 <strong>{ev.tower}</strong> · ±{ev.radiusMeters}m</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  📱 Active SIM: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--blue)' }}>{ev.activeSim}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted-2)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                  {ev.latitude.toFixed(4)}°S {ev.longitude.toFixed(4)}°E
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Active device cards ── */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <div className="card-title">🗺️ Active Device Tracking</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Based on latest network detection events</div>
        </div>

        {active.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>No active device alerts at this time</div>
        ) : (
          <div className="grid-2">
            {active.map(report => {
              const device  = findDevice(report.deviceId, devices);
              const devEvts = events.filter(e => e.reportId === report.id);
              const latest  = devEvts[devEvts.length - 1];
              if (!latest) return null;

              return (
                <div key={report.id} style={{ background: 'linear-gradient(135deg, rgba(192,37,44,0.08), rgba(232,57,63,0.03))', border: '1px solid rgba(192,37,44,0.25)', borderRadius: 'var(--radius)', padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span className="pulse-anim" style={{ background: 'var(--red-2)', color: '#fff', padding: '2px 9px', borderRadius: 6, fontSize: 10, fontWeight: 800 }}>🔴 ACTIVE</span>
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>{latest.detectedAt}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{device?.make} {device?.model}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>📍 {latest.tower}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)', marginTop: 3 }}>📱 SIM: {latest.activeSim}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted-2)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>
                    {latest.latitude}°S, {latest.longitude}°E · ±{latest.radiusMeters}m
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 3 }}>📡 {devEvts.length} total events · via {latest.operator}</div>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ marginTop: 10, fontSize: 11 }}
                    onClick={() => showToast('Dispatch request sent.', 'Officer ETA: ~12 minutes')}
                  >
                    🚔 Dispatch Response
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Verify modal */}
      {verifyId && (
        <VerifyReportModal reportId={verifyId} onClose={() => setVerifyId(null)} />
      )}
    </div>
  );
}
/**
 * src/components/pages/PoliceDashboardPage.js
 * ─────────────────────────────────────────────
 * Police officer case management and intelligence dashboard.
 * Shows pending reports (to verify), active cases with network
 * detections, and a simulated map of active device locations.
 */

import React, { useState } from 'react';
import { useAppStore, useAppDispatch, useToast } from '../../store/useAppStore';
import { deviceIcon, findDevice } from '../../utils/helpers';
import Badge from '../ui/Badge';
import DeviceLookup from '../ui/DeviceLookup';
import VerifyReportModal from '../modals/VerifyReportModal';
import {
  FiUsers,
  FiClipboard,
  FiRadio,
  FiMap,
  FiMapPin,
  FiSmartphone,
  FiBell,
  FiCheckCircle,
} from 'react-icons/fi';
import MalawiMap from '../ui/MalawiMap';

export default function PoliceDashboardPage() {
  const reports = useAppStore((state) => state.reports);
  const devices = useAppStore((state) => state.devices);
  const events = useAppStore((state) => state.events);
  const reminders = useAppStore((state) => state.reminders);
  const users = useAppStore((state) => state.users);
  const dispatch = useAppDispatch();
  const showToast = useToast();

  const [activeTab, setActiveTab] = useState('pending');
  const [verifyId, setVerifyId] = useState(null); // reportId to verify

  const pending = reports.filter((r) => r.status === 'pending');
  const active = reports.filter((r) => r.status === 'active');
  const resolved = reports.filter((r) => r.status === 'resolved');

  // Unified list of active events for the map
  const activeEvents = events.filter((e) => {
    const r = reports.find((rep) => rep.id === e.reportId);
    return r && r.status === 'active';
  });

  const tabReports = { pending, active, resolved }[activeTab] || [];

  const TABS = [
    { key: 'pending', label: 'Pending', count: pending.length, color: 'var(--amber)' },
    { key: 'active', label: 'Active', count: active.length, color: 'var(--red)' },
    { key: 'resolved', label: 'Resolved', count: resolved.length, color: 'var(--green)' },
  ];

  return (
    <div className="fade-up">
      {/* ── Police banner ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a0508, #2d0f0f, var(--navy))',
          borderRadius: 'var(--radius)',
          padding: '24px 28px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Malawi Police Service
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 24,
              fontWeight: 800,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <FiUsers size={22} /> SDIRS Intelligence Dashboard
          </div>
          <div style={{ display: 'flex', gap: 28, marginTop: 12, flexWrap: 'wrap' }}>
            {[
              [pending.length, 'Pending', 'var(--amber-2)'],
              [active.length, 'Active Alerts', 'var(--red-2)'],
              [events.length, 'Intel Events', 'var(--blue-3)'],
              [resolved.length, 'Resolved', '#80E890'],
            ].map(([n, label, color]) => (
              <div key={label}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 24,
                    fontWeight: 800,
                    color,
                  }}
                >
                  {n}
                </span>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="live-badge">Network Monitoring LIVE</div>
      </div>

      {/* ── Device Owner Lookup ── */}
      <DeviceLookup />

      {/* ── Citizen Follow-up Reminders ── */}
      <CitizenReminders
        reminders={reminders}
        reports={reports}
        devices={devices}
        users={users}
        onAcknowledge={(reminderId) => {
          dispatch({ type: 'ACKNOWLEDGE_REMINDER', payload: { reminderId } });
          showToast('Reminder acknowledged', 'Citizen will be notified.', 'success');
        }}
      />

      <div className="grid-2">
        {/* ── Case management ── */}
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiClipboard size={15} /> Case Management
            </div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6 }}>
              {TABS.map((t) => (
                <button
                  key={t.key}
                  style={{
                    padding: '5px 13px',
                    borderRadius: 8,
                    border: '1px solid var(--muted-3)',
                    background: activeTab === t.key ? t.color : 'var(--bg)',
                    color: activeTab === t.key ? '#fff' : 'var(--muted)',
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all .15s',
                  }}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label} ({t.count})
                </button>
              ))}
            </div>
          </div>

          {tabReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>
              No {activeTab} reports
            </div>
          ) : (
            tabReports.map((report) => {
              const device = findDevice(report.deviceId, devices);
              const devEvts = events.filter((e) => e.reportId === report.id);

              return (
                <div
                  key={report.id}
                  style={{ padding: '14px 0', borderBottom: '1px solid var(--muted-3)' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: 'var(--ink)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 7,
                        }}
                      >
                        {deviceIcon(device?.type)} {device?.make} {device?.model}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                        <FiMapPin size={10} /> {report.date} · {report.location.split(',')[0]}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--muted-2)',
                        }}
                      >
                        {report.id}
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 5,
                        alignItems: 'flex-end',
                      }}
                    >
                      <Badge status={report.status} />
                      {report.status === 'pending' && (
                        <button
                          className="btn btn-amber btn-sm"
                          onClick={() => setVerifyId(report.id)}
                        >
                          Review &amp; Verify →
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Network detections summary */}
                  {devEvts.length > 0 && (
                    <div
                      style={{
                        padding: '8px 12px',
                        background: 'var(--red-pale)',
                        borderRadius: 8,
                        fontSize: 11,
                        color: 'var(--red)',
                        fontWeight: 700,
                      }}
                    >
                      <FiRadio size={11} /> {devEvts.length} detection
                      {devEvts.length > 1 ? 's' : ''} · Latest: {devEvts[devEvts.length - 1].tower}
                    </div>
                  )}

                  {report.caseNumber && (
                    <div
                      style={{
                        fontSize: 11,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--blue)',
                        marginTop: 6,
                        fontWeight: 700,
                      }}
                    >
                      {report.caseNumber}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ── Live intelligence feed ── */}
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiRadio size={15} /> Live Intelligence Feed
            </div>
            <div className="live-badge">● LIVE</div>
          </div>

          {/* Network status bar */}
          <div
            style={{
              padding: '10px 14px',
              background: 'var(--navy)',
              borderRadius: 10,
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}>
              Network Monitoring Active
            </span>
            <span style={{ fontSize: 12, color: 'var(--green-2)', fontWeight: 800 }}>
              Airtel ● TNM ●
            </span>
          </div>

          {events
            .slice()
            .reverse()
            .map((ev) => {
              const report = reports.find((r) => r.id === ev.reportId);
              const device = report ? findDevice(report.deviceId, devices) : null;

              return (
                <div
                  key={ev.id}
                  style={{ padding: '12px 0', borderBottom: '1px solid var(--muted-3)' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 800,
                        background: ev.operator === 'Airtel' ? 'var(--red-pale)' : '#EBF3FF',
                        color: ev.operator === 'Airtel' ? 'var(--red)' : 'var(--blue)',
                      }}
                    >
                      {ev.operator}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--muted)',
                      }}
                    >
                      {ev.detectedAt}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>
                    {device?.make} {device?.model}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
                    <FiMapPin size={11} /> <strong>{ev.tower}</strong> · ±{ev.radiusMeters}m
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    <FiSmartphone size={11} /> Active SIM:{' '}
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: 'var(--blue)',
                      }}
                    >
                      {ev.activeSim}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--muted-2)',
                      fontFamily: 'var(--font-mono)',
                      marginTop: 2,
                    }}
                  >
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
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiMap size={15} /> Active Device Tracking Intelligence
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            Real-time geographic visualization of stolen hardware signals
          </div>
        </div>

        {active.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>
            No active device alerts at this time
          </div>
        ) : (
          <div
            style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 340px', gap: 24 }}
          >
            {/* Left: The Map */}
            <MalawiMap points={activeEvents} type="events" />

            {/* Right: Quick List */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                maxHeight: 600,
                overflowY: 'auto',
                paddingRight: 4,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: 'var(--muted)',
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                TARGETS IN VICINITY
              </div>
              {active.map((report) => {
                const device = findDevice(report.deviceId, devices);
                const devEvts = events.filter((e) => e.reportId === report.id);
                const latest = devEvts[devEvts.length - 1];
                if (!latest) return null;

                return (
                  <div
                    key={report.id}
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--muted-3)',
                      borderRadius: 12,
                      padding: 14,
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                      {device?.make} {device?.model}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>Last: {latest.tower}</div>
                    <div
                      style={{
                        marginTop: 8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: 10, color: 'var(--red)', fontWeight: 800 }}>
                        ● ACTIVE SIGNAL
                      </span>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: 10, padding: '4px 8px' }}
                        onClick={() =>
                          showToast('Dispatch initiated.', 'Units notified of coordinates.')
                        }
                      >
                        Dispatch
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Verify modal */}
      {verifyId && <VerifyReportModal reportId={verifyId} onClose={() => setVerifyId(null)} />}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CITIZEN REMINDERS PANEL
   Shows all follow-up reminders sent by citizens when police
   are slow to act. Each reminder shows:
     - Which citizen sent it and when
     - The case number and device
     - How many times the device was detected on the network
     - The general area of last detection
     - The full reminder message
     - An Acknowledge button to mark it as actioned
══════════════════════════════════════════════════════════════ */
function CitizenReminders({ reminders, reports, devices, users, onAcknowledge }) {
  const [expanded, setExpanded] = useState(null);

  const unread = reminders.filter((r) => !r.acknowledged);
  const all = [...reminders].reverse(); // newest first

  if (reminders.length === 0) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      {/* ── Section header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              fontWeight: 800,
              color: 'var(--ink)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <FiBell size={16} /> Citizen Follow-up Reminders
          </div>
          {unread.length > 0 && (
            <div
              style={{
                background: 'var(--red)',
                color: '#fff',
                borderRadius: 20,
                padding: '2px 10px',
                fontSize: 11,
                fontWeight: 800,
                animation: 'ping 2s infinite',
              }}
            >
              {unread.length} NEW
            </div>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          {reminders.length} total · {reminders.filter((r) => r.acknowledged).length} acknowledged
        </div>
      </div>

      {/* ── Reminder cards ── */}
      {all.map((reminder) => {
        const report = reports.find((r) => r.id === reminder.reportId);
        const device = devices.find((d) => d.id === report?.deviceId);
        const citizen = users.find((u) => u.id === reminder.fromUserId);
        const isOpen = expanded === reminder.id;

        return (
          <div
            key={reminder.id}
            style={{
              borderRadius: 'var(--radius-2)',
              border: `2px solid ${reminder.acknowledged ? 'var(--muted-3)' : 'var(--red-2)'}`,
              marginBottom: 12,
              overflow: 'hidden',
              opacity: reminder.acknowledged ? 0.7 : 1,
              transition: 'all .2s',
            }}
          >
            {/* Card header — always visible */}
            <div
              style={{
                padding: '14px 18px',
                background: reminder.acknowledged
                  ? 'var(--bg-2)'
                  : 'linear-gradient(135deg, #2d0505, var(--navy))',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                flexWrap: 'wrap',
                cursor: 'pointer',
              }}
              onClick={() => setExpanded(isOpen ? null : reminder.id)}
            >
              {/* Unread dot */}
              {!reminder.acknowledged && (
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: 'var(--red-2)',
                    flexShrink: 0,
                  }}
                />
              )}
              {reminder.acknowledged && (
                <div style={{ fontSize: 16, flexShrink: 0, color: 'var(--green)' }}>
                  <FiCheckCircle />
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 13,
                    color: reminder.acknowledged ? 'var(--ink)' : '#fff',
                  }}
                >
                  {citizen?.name || 'Citizen'} is following up on {device?.make} {device?.model}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: reminder.acknowledged ? 'var(--muted)' : 'rgba(255,255,255,0.55)',
                    marginTop: 3,
                  }}
                >
                  Case:{' '}
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: reminder.acknowledged ? 'var(--blue)' : 'var(--amber-2)',
                    }}
                  >
                    {reminder.caseNumber || 'Pending'}
                  </span>
                  &nbsp;·&nbsp;
                  <FiRadio size={11} /> Detected{' '}
                  <strong style={{ color: reminder.acknowledged ? 'var(--ink)' : '#fff' }}>
                    {reminder.detectionCount}×
                  </strong>{' '}
                  on {reminder.operator}
                  &nbsp;·&nbsp;
                  <FiMapPin size={11} /> {reminder.area}
                  &nbsp;·&nbsp;
                  {reminder.sentAt}
                </div>
              </div>

              <div
                style={{ display: 'flex', gap: 8, flexShrink: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {!reminder.acknowledged && (
                  <button
                    className="btn btn-green btn-sm"
                    onClick={() => onAcknowledge(reminder.id)}
                  >
                    <FiCheckCircle size={14} /> Acknowledge
                  </button>
                )}
                <button className="btn btn-surface btn-sm" style={{ fontSize: 11 }}>
                  {isOpen ? '▲ Hide' : '▼ View Message'}
                </button>
              </div>
            </div>

            {/* Expanded — full message + context */}
            {isOpen && (
              <div style={{ padding: '16px 18px', background: 'var(--surface)' }}>
                {/* Context row */}
                <div className="grid-2" style={{ gap: 12, marginBottom: 16 }}>
                  <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 14px' }}>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                        marginBottom: 4,
                      }}
                    >
                      From Citizen
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{citizen?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                      {citizen?.phone}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 14px' }}>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                        marginBottom: 4,
                      }}
                    >
                      Device
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>
                      {device?.make} {device?.model}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--muted)',
                        marginTop: 2,
                      }}
                    >
                      {device?.imei || device?.serial || '—'}
                    </div>
                  </div>
                  <div
                    style={{
                      background: 'var(--amber-pale)',
                      border: '1px solid var(--amber)',
                      borderRadius: 8,
                      padding: '10px 14px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: 'var(--amber)',
                        textTransform: 'uppercase',
                        marginBottom: 4,
                      }}
                    >
                      Network Detections
                    </div>
                    <div
                      style={{
                        fontWeight: 900,
                        fontSize: 22,
                        color: 'var(--amber)',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {reminder.detectionCount}×
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                      via {reminder.operator}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 14px' }}>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                        marginBottom: 4,
                      }}
                    >
                      Last Detected Area
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>
                      <FiMapPin size={12} /> {reminder.area}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                      Sent: {reminder.sentAt}
                    </div>
                  </div>
                </div>

                {/* Full message */}
                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'var(--muted)',
                      textTransform: 'uppercase',
                      marginBottom: 8,
                    }}
                  >
                    Full Message from Citizen
                  </div>
                  <div
                    style={{
                      background: 'var(--bg)',
                      borderRadius: 8,
                      padding: '12px 14px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--ink-2)',
                      lineHeight: 1.8,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      borderLeft: '3px solid var(--blue)',
                    }}
                  >
                    {reminder.message}
                  </div>
                </div>

                {/* Action buttons */}
                {!reminder.acknowledged ? (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button className="btn btn-green" onClick={() => onAcknowledge(reminder.id)}>
                      <FiCheckCircle size={14} /> Acknowledge — I am working on this case
                    </button>
                    <button
                      className="btn btn-surface"
                      onClick={() => {
                        navigator.clipboard?.writeText(reminder.message).catch(() => {});
                      }}
                    >
                      <FiClipboard size={14} /> Copy Message
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16, color: 'var(--green)' }}>
                      <FiCheckCircle />
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>
                      Acknowledged {reminder.acknowledgedAt}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

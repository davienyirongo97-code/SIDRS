/**
 * src/components/pages/MacraAdminPage.js
 * ─────────────────────────────────────────────
 * MACRA national administration dashboard.
 * Shows system-wide stats, activity bar chart, district breakdown,
 * and the full national device registry.
 */

import React from 'react';
import { useAppStore, useAppDispatch, useToast } from '../../store/useAppStore';
import { CHART_DATA } from '../../data/mockData';
import StatCard from '../ui/StatCard';
import Badge from '../ui/Badge';
import DeviceLookup from '../ui/DeviceLookup';
import { deviceIcon } from '../../utils/helpers';
import {
  FiSmartphone,
  FiAlertCircle,
  FiCheckCircle,
  FiZap,
  FiBarChart2,
  FiMap,
  FiClipboard,
  FiGrid,
  FiUserCheck,
  FiXCircle,
} from 'react-icons/fi';

// District breakdown mock data
const DISTRICTS = [
  { name: 'Lilongwe', total: 4, stolen: 2 },
  { name: 'Blantyre', total: 2, stolen: 1 },
  { name: 'Zomba', total: 2, stolen: 1 },
  { name: 'Mzuzu', total: 1, stolen: 0 },
  { name: 'Kasungu', total: 1, stolen: 0 },
];

export default function MacraAdminPage() {
  const devices = useAppStore((state) => state.devices);
  const reports = useAppStore((state) => state.reports);
  const events = useAppStore((state) => state.events);
  const users = useAppStore((state) => state.users);

  const citizens = users.filter((u) => u.role === 'citizen').length;
  const recovered = devices.filter((d) => d.status === 'recovered').length;
  const active = reports.filter((r) => r.status === 'active').length;
  const pendingRegistrations = devices.filter((d) => d.status === 'pending_verification');

  const dispatch = useAppDispatch();
  const showToast = useToast();

  const maxBar = Math.max(
    ...CHART_DATA.map((d) => Math.max(d.registrations, d.stolen, d.recovered)),
    1
  );

  return (
    <div className="fade-up">
      {/* ── Admin banner ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #172554 0%, #1e3a8a 50%, #1a2870 100%)',
          borderRadius: '20px',
          padding: '28px 32px',
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(59, 130, 246, 0.15)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Scan line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background:
              'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), rgba(245, 158, 11, 0.3), transparent)',
            animation: 'scanLine 5s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        {/* Ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: '-40%',
            right: '-5%',
            width: '35%',
            height: '180%',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
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
            Administration Dashboard
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 24,
              fontWeight: 800,
              color: '#fff',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <FiGrid size={22} /> SDIRS National Command Centre
          </div>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            {[
              [devices.length, 'Devices', '#93c5fd'],
              [reports.length, 'Reports', '#f87171'],
              [events.length, 'Net Events', '#fbbf24'],
              [citizens, 'Citizens', '#4ade80'],
            ].map(([n, l, c]) => (
              <div key={l}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 28,
                    fontWeight: 800,
                    color: c,
                    textShadow: `0 0 20px ${c}44`,
                  }}
                >
                  {n}
                </span>
                <div
                  style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.45)',
                    marginTop: 2,
                    fontWeight: 600,
                  }}
                >
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid-stat stagger-reveal">
        <StatCard
          icon={<FiSmartphone />}
          value={devices.length}
          label="Total Devices"
          sub="Nationally registered"
          color="var(--blue)"
        />
        <StatCard
          icon={<FiAlertCircle />}
          value={active}
          label="Active Alerts"
          sub="Network monitoring on"
          color="var(--red)"
        />
        <StatCard
          icon={<FiCheckCircle />}
          value={recovered}
          label="Recovered"
          sub="Via SDIRS intelligence"
          color="var(--green)"
        />
        <StatCard
          icon={<FiZap />}
          value={events.length}
          label="Network Events"
          sub="Telecom detections"
          color="var(--amber)"
        />
      </div>

      {/* ── Pending Registrations ── */}
      {pendingRegistrations.length > 0 && (
        <div
          className="card"
          style={{ marginBottom: 20, borderColor: 'var(--amber)', borderWidth: 2 }}
        >
          <div className="card-header">
            <div
              className="card-title"
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--amber)' }}
            >
              <FiUserCheck size={16} /> Pending Device Registrations ({pendingRegistrations.length})
            </div>
          </div>
          <div>
            {pendingRegistrations.map((device) => {
              const owner = users.find((u) => u.id === device.ownerId);
              return (
                <div
                  key={device.id}
                  style={{
                    padding: '16px',
                    borderBottom: '1px solid var(--muted-3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    background: 'var(--bg)',
                    borderRadius: 'var(--radius-2)',
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>
                        {deviceIcon(device.type)} {device.make} {device.model}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                        Requested by:{' '}
                        <strong style={{ color: 'var(--ink-2)' }}>{owner?.name}</strong> (
                        {owner?.phone})
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--blue)',
                          marginTop: 4,
                        }}
                      >
                        IMEI: {device.imei}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn btn-ghost-red btn-sm"
                        onClick={() => {
                          dispatch({
                            type: 'REJECT_REGISTRATION',
                            payload: { deviceId: device.id },
                          });
                          showToast(
                            'Registration Rejected',
                            'The citizen has been notified.',
                            'warn'
                          );
                        }}
                      >
                        <FiXCircle size={14} /> Reject
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          dispatch({
                            type: 'APPROVE_REGISTRATION',
                            payload: { deviceId: device.id, adminId: 'MACRA' },
                          });
                          showToast(
                            'Registration Approved',
                            'Device is now active in the national registry.',
                            'success'
                          );
                        }}
                      >
                        <FiCheckCircle size={14} /> Approve & Activate
                      </button>
                    </div>
                  </div>

                  {/* ID Review Section */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 12,
                      marginTop: 8,
                    }}
                  >
                    <div
                      style={{
                        border: '1px solid var(--muted-3)',
                        borderRadius: 8,
                        padding: 10,
                        textAlign: 'center',
                        background: 'var(--surface)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: 'var(--muted)',
                          textTransform: 'uppercase',
                          marginBottom: 6,
                        }}
                      >
                        National ID (Front)
                      </div>
                      <div style={{ fontSize: 24, padding: '10px 0' }}>🖼️</div>
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: 11,
                          color: 'var(--blue)',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                        onClick={(e) => e.preventDefault()}
                      >
                        View Document
                      </button>
                    </div>
                    <div
                      style={{
                        border: '1px solid var(--muted-3)',
                        borderRadius: 8,
                        padding: 10,
                        textAlign: 'center',
                        background: 'var(--surface)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: 'var(--muted)',
                          textTransform: 'uppercase',
                          marginBottom: 6,
                        }}
                      >
                        National ID (Back)
                      </div>
                      <div style={{ fontSize: 24, padding: '10px 0' }}>🖼️</div>
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: 11,
                          color: 'var(--blue)',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                        onClick={(e) => e.preventDefault()}
                      >
                        View Document
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Device Owner Lookup ── search by IMEI / serial / MAC ── */}
      <DeviceLookup />

      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Bar chart */}
        <div className="card">
          <div
            className="card-title"
            style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <FiBarChart2 size={15} /> Monthly Activity
          </div>
          <div
            style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160, paddingTop: 10 }}
          >
            {CHART_DATA.map((d) => (
              <div
                key={d.month}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  height: '100%',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 2,
                    width: '100%',
                  }}
                >
                  <div
                    title={`Registrations: ${d.registrations}`}
                    style={{
                      flex: 1,
                      background: 'var(--blue)',
                      borderRadius: '4px 4px 0 0',
                      height: `${(d.registrations / maxBar) * 100}%`,
                      minHeight: 4,
                      opacity: 0.85,
                    }}
                  />
                  <div
                    title={`Reports: ${d.stolen}`}
                    style={{
                      flex: 1,
                      background: 'var(--red)',
                      borderRadius: '4px 4px 0 0',
                      height: `${(d.stolen / maxBar) * 100}%`,
                      minHeight: d.stolen ? 4 : 0,
                      opacity: 0.85,
                    }}
                  />
                  <div
                    title={`Recovered: ${d.recovered}`}
                    style={{
                      flex: 1,
                      background: 'var(--green)',
                      borderRadius: '4px 4px 0 0',
                      height: `${(d.recovered / maxBar) * 100}%`,
                      minHeight: d.recovered ? 4 : 0,
                      opacity: 0.85,
                    }}
                  />
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>
                  {d.month}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12, justifyContent: 'center' }}>
            {[
              ['var(--blue)', 'Registrations'],
              ['var(--red)', 'Reports'],
              ['var(--green)', 'Recovered'],
            ].map(([c, l]) => (
              <div
                key={l}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11,
                  color: 'var(--muted)',
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* District breakdown */}
        <div className="card">
          <div
            className="card-title"
            style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <FiMap size={15} /> District Breakdown
          </div>
          {DISTRICTS.map((row) => (
            <div key={row.name} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>
                  {row.name}
                </span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {row.total} devices · {row.stolen} stolen
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${(row.total / 10) * 100}%`,
                    background: 'var(--blue)',
                    opacity: 0.7,
                  }}
                />
              </div>
              {row.stolen > 0 && (
                <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 3, fontWeight: 700 }}>
                  {row.stolen} active alert{row.stolen > 1 ? 's' : ''}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Full registry table */}
      <div className="card">
        <div
          className="card-title"
          style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <FiClipboard size={15} /> National Device Registry
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Device</th>
                <th>Type</th>
                <th>Identifier</th>
                <th>Owner</th>
                <th>Reg Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => {
                const owner = users.find((u) => u.id === d.ownerId);
                return (
                  <tr key={d.id}>
                    <td>
                      <strong>
                        {d.make} {d.model}
                      </strong>
                      <br />
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{d.color}</span>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>
                      {deviceIcon(d.type)} {d.type}
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                        {d.imei || d.serial || d.mac}
                      </span>
                    </td>
                    <td>
                      {owner?.name}
                      <br />
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{owner?.location}</span>
                    </td>
                    <td>{d.registeredDate}</td>
                    <td>
                      <Badge status={d.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

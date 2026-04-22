/**
 * src/components/pages/MacraAdminPage.js
 * ─────────────────────────────────────────────
 * MACRA national administration dashboard.
 * Shows system-wide stats, activity bar chart, district breakdown,
 * and the full national device registry.
 */

import React from 'react';
import { useAppStore } from '../../store/useAppStore';
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

  const maxBar = Math.max(
    ...CHART_DATA.map((d) => Math.max(d.registrations, d.stolen, d.recovered)),
    1
  );

  return (
    <div className="fade-up">
      {/* ── Admin banner ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--navy), #1a3a7b)',
          borderRadius: 'var(--radius)',
          padding: '24px 28px',
          marginBottom: 24,
        }}
      >
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
            [devices.length, 'Devices', 'var(--blue-3)'],
            [reports.length, 'Reports', 'var(--red-2)'],
            [events.length, 'Net Events', 'var(--amber-2)'],
            [citizens, 'Citizens', '#80E890'],
          ].map(([n, l, c]) => (
            <div key={l}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 26,
                  fontWeight: 800,
                  color: c,
                }}
              >
                {n}
              </span>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid-stat">
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

/**
 * src/components/pages/MyDevicesPage.js
 * ─────────────────────────────────────────────
 * Citizen device management page.
 * Shows the current user's registered devices and their theft reports.
 * Allows: register new device, report stolen, initiate transfer.
 */

import React, { useState } from 'react';
import { useCurrentUser, useMyDevices, useMyReports, useAppState } from '../../context/AppContext';
import { deviceIcon, primaryIdentifier } from '../../utils/helpers';
import Badge from '../ui/Badge';
import StatCard from '../ui/StatCard';
import RegisterDeviceModal from '../modals/RegisterDeviceModal';
import ReportTheftModal from '../modals/ReportTheftModal';
import TransferInitiateModal from '../modals/TransferInitiateModal';

export default function MyDevicesPage() {
  const user      = useCurrentUser();
  const devices   = useMyDevices();
  const reports   = useMyReports();
  const { devices: allDevices } = useAppState();

  // Which modal is open
  const [modal, setModal]       = useState(null);   // 'register' | 'report' | 'transfer'
  const [selectedDevice, setSelectedDevice] = useState(null);

  function openReport(device) {
    setSelectedDevice(device);
    setModal('report');
  }

  function openTransfer(device) {
    setSelectedDevice(device);
    setModal('transfer');
  }

  return (
    <div className="fade-up">

      {/* ── User banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--navy), var(--navy-3))',
        borderRadius: 'var(--radius)', padding: '24px 28px', marginBottom: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Citizen Account</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: '#fff' }}>{user?.name}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>📍 {user?.location} · {user?.phone}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ width: 58, height: 58, borderRadius: '50%', background: user?.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)' }}>
            {user?.avatarText}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>{user?.email}</div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <StatCard icon="📱" value={devices.length} label="My Devices" sub={`${devices.filter(d=>d.status==='stolen').length} currently stolen`} color="var(--blue)" />
        <StatCard icon="🚨" value={reports.length} label="Reports Filed" sub={`${reports.filter(r=>r.status==='active').length} active`} color="var(--amber)" />
        <StatCard icon="✅" value={devices.filter(d=>d.status==='registered').length} label="Protected" sub="Clean & monitored" color="var(--green)" />
      </div>

      <div className="grid-2">

        {/* ── Devices list ── */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">📱 Registered Devices</div>
              <div className="card-subtitle">Your device ownership portfolio</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setModal('register')}>
              + Register Device
            </button>
          </div>

          {devices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>📱</div>
              <div style={{ fontWeight: 700, color: 'var(--ink-2)', marginBottom: 8 }}>No devices registered yet</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Register your phone or laptop to get protected</div>
              <button className="btn btn-primary" onClick={() => setModal('register')}>Register First Device</button>
            </div>
          ) : (
            devices.map(device => (
              <div className="device-row" key={device.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                  <div className="device-icon-box">{deviceIcon(device.type)}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{device.make} {device.model}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{primaryIdentifier(device)}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 2 }}>Registered {device.registeredDate}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Badge status={device.status} />
                  {device.status === 'registered' && (
                    <>
                      <button className="btn btn-ghost-red btn-sm" title="Report Stolen" onClick={() => openReport(device)}>🚨</button>
                      <button className="btn btn-ghost btn-sm" title="Transfer Ownership" onClick={() => openTransfer(device)}>🔄</button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Reports list ── */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">📋 My Theft Reports</div>
              <div className="card-subtitle">Track your report statuses</div>
            </div>
          </div>

          {reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
              No reports submitted yet
            </div>
          ) : (
            reports.map(report => {
              const device = allDevices.find(d => d.id === report.deviceId);
              return (
                <div key={report.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--muted-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{device?.make} {device?.model}</div>
                      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginTop: 2 }}>{report.id}</div>
                    </div>
                    <Badge status={report.status} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>📅 {report.date} · 📍 {report.location.split(',')[0]}</div>
                  {report.caseNumber && (
                    <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--blue)', marginTop: 4, fontWeight: 700 }}>{report.caseNumber}</div>
                  )}
                  {report.dispatched && (
                    <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 4, fontWeight: 700 }}>📡 Network alert active on Airtel &amp; TNM</div>
                  )}
                  {report.status === 'pending' && (
                    <div style={{ fontSize: 11, color: 'var(--amber)', marginTop: 4 }}>⏳ Awaiting police verification</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {modal === 'register' && <RegisterDeviceModal onClose={() => setModal(null)} />}
      {modal === 'report'   && <ReportTheftModal    onClose={() => setModal(null)} preselectedDeviceId={selectedDevice?.id} />}
      {modal === 'transfer' && <TransferInitiateModal onClose={() => setModal(null)} device={selectedDevice} />}
    </div>
  );
}

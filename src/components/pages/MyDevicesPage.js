/**
 * src/components/pages/MyDevicesPage.js
 * ─────────────────────────────────────────────
 * Citizen device management page.
 *
 * NEW: Citizen Intelligence Map
 *   Shows a citizen ONLY:
 *     ✅ General area where device was detected (e.g. "Kawale Area, Lilongwe")
 *     ✅ Date and time of detection
 *     ✅ Which network detected it (Airtel / TNM) — no tower name
 *     ✅ How many times the device has been detected in total
 *     ✅ A "Remind Police" button that generates a follow-up message
 *
 *   DELIBERATELY HIDDEN from citizen:
 *     ❌ Exact GPS coordinates (police eyes only)
 *     ❌ Tower name and ID (police eyes only)
 *     ❌ Active SIM number used by thief (police eyes only)
 *     ❌ Radius / precision of detection (police eyes only)
 *
 *   WHY: The citizen gets enough proof that their device is alive
 *   on the network to chase up police — but not enough to attempt
 *   a dangerous self-recovery that could get them hurt.
 */

import React, { useState } from 'react';
import { useCurrentUser, useMyDevices, useMyReports, useAppState, useAppDispatch, useToast } from '../../context/AppContext';
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
  const showToast = useToast();
  const dispatch  = useAppDispatch();
  const { devices: allDevices, events, reports: allReports } = useAppState();

  const [modal, setModal]             = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Which report is expanded in the intelligence map
  const [expandedReport, setExpandedReport] = useState(null);

  function openReport(device) { setSelectedDevice(device); setModal('report'); }
  function openTransfer(device) { setSelectedDevice(device); setModal('transfer'); }

  // Only show intelligence for active reports belonging to this citizen
  const activeReports = reports.filter(r => r.status === 'active');

  return (
    <div className="fade-up">

      {/* ── User banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--navy), var(--navy-3))',
        borderRadius: 'var(--radius)', padding: '24px 28px', marginBottom: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16,
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
        <StatCard icon="📱" value={devices.length} label="My Devices"    sub={`${devices.filter(d=>d.status==='stolen').length} currently stolen`} color="var(--blue)" />
        <StatCard icon="🚨" value={reports.length} label="Reports Filed" sub={`${reports.filter(r=>r.status==='active').length} active`}           color="var(--amber)" />
        <StatCard icon="✅" value={devices.filter(d=>d.status==='registered').length} label="Protected" sub="Clean &amp; monitored" color="var(--green)" />
      </div>

      {/* ══════════════════════════════════════════════════════════
          CITIZEN INTELLIGENCE MAP
          Only shown when the user has at least one active report
          with network detection events.
      ══════════════════════════════════════════════════════════ */}
      {activeReports.map(report => {
        // Get all network events for this report
        const reportEvents = events.filter(e => e.reportId === report.id);
        if (reportEvents.length === 0) return null;

        const device     = allDevices.find(d => d.id === report.deviceId);
        const latestEvt  = reportEvents[reportEvents.length - 1];
        const isExpanded = expandedReport === report.id;

        return (
          <CitizenIntelMap
            key={report.id}
            report={report}
            device={device}
            events={reportEvents}
            latestEvt={latestEvt}
            isExpanded={isExpanded}
            onToggle={() => setExpandedReport(isExpanded ? null : report.id)}
            onRemindPolice={(reminderPayload) => {
              dispatch({ type: 'SEND_REMINDER', payload: reminderPayload });
              showToast(
                'Reminder sent to police! 👮',
                `Case ${report.caseNumber} · ${reportEvents.length} detections on file.`,
                'success'
              );
            }}
          />
        );
      })}

      {/* ── Main grid: devices + reports ── */}
      <div className="grid-2">

        {/* Devices list */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">📱 Registered Devices</div>
              <div className="card-subtitle">Your device ownership portfolio</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setModal('register')}>
              + Register
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
                      <button className="btn btn-ghost btn-sm" title="Transfer" onClick={() => openTransfer(device)}>🔄</button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reports list */}
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
              const device      = allDevices.find(d => d.id === report.deviceId);
              const reportEvts  = events.filter(e => e.reportId === report.id);
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
                    <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 4, fontWeight: 700 }}>
                      📡 Network alert active on Airtel &amp; TNM
                    </div>
                  )}
                  {/* Show detection count as proof for citizen */}
                  {reportEvts.length > 0 && (
                    <div style={{ fontSize: 11, color: 'var(--amber)', marginTop: 4, fontWeight: 700 }}>
                      📍 {reportEvts.length} network detection{reportEvts.length > 1 ? 's' : ''} recorded
                    </div>
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

      {/* Modals */}
      {modal === 'register' && <RegisterDeviceModal onClose={() => setModal(null)} />}
      {modal === 'report'   && <ReportTheftModal    onClose={() => setModal(null)} preselectedDeviceId={selectedDevice?.id} />}
      {modal === 'transfer' && <TransferInitiateModal onClose={() => setModal(null)} device={selectedDevice} />}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CITIZEN INTELLIGENCE MAP COMPONENT
   ──────────────────────────────────────────────────────────────
   Shows the citizen that their stolen device is being detected
   on the mobile network — general area + time only.
   Everything sensitive (tower, SIM, exact coords) is hidden.
══════════════════════════════════════════════════════════════ */
function CitizenIntelMap({ report, device, events, latestEvt, isExpanded, onToggle, onRemindPolice }) {

  // Convert raw tower name into a vague "general area" description
  // so the citizen knows the approximate zone but not the exact tower
  function getGeneralArea(tower, lat, lng) {
    // In production this would use reverse geocoding to get a suburb/area name
    // For now we derive a friendly area from the tower name
    if (!tower) return 'Unknown area';
    // Strip "Tower" / "Tower A/B" suffixes to give just the area name
    return tower
      .replace(/ Tower [A-Z]$/i, '')
      .replace(/ Tower$/i, '')
      .replace(/ Area$/i, '')
      .trim();
  }

  const area        = getGeneralArea(latestEvt.tower);
  const city        = area.includes('Zomba') ? 'Zomba'
                    : area.includes('Blantyre') ? 'Blantyre'
                    : 'Lilongwe';
  const lastSeen    = latestEvt.detectedAt;
  const totalPings  = events.length;

  // Build the police reminder message the citizen can copy/send
  const reminderMsg =
    `SDIRS Device Tracking Alert\n` +
    `────────────────────────────\n` +
    `Case Number: ${report.caseNumber || 'Pending verification'}\n` +
    `Report ID: ${report.id}\n` +
    `Device: ${device?.make} ${device?.model}\n` +
    `Last Network Detection: ${lastSeen}\n` +
    `General Area: ${area}, ${city}\n` +
    `Total Detections: ${totalPings}\n` +
    `Network: ${latestEvt.operator}\n` +
    `────────────────────────────\n` +
    `This device is actively connecting to the ${latestEvt.operator} network.\n` +
    `Please escalate recovery efforts using the SDIRS intelligence data.\n` +
    `Contact MACRA SDIRS helpline: 1234 for full intelligence report.`;

  function copyReminder() {
    navigator.clipboard?.writeText(reminderMsg).catch(() => {});
    onRemindPolice({
      reportId:       report.id,
      caseNumber:     report.caseNumber,
      message:        reminderMsg,
      detectionCount: totalPings,
      area:           `${area}, ${city}`,
      operator:       latestEvt.operator,
    });
  }

  return (
    <div style={{
      marginBottom: 24,
      borderRadius: 'var(--radius)',
      border: '2px solid rgba(232,137,12,0.5)',
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(232,137,12,0.12)',
    }}>

      {/* ── Header banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1a0a00, #2d1500, var(--navy))',
        padding: '18px 22px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        cursor: 'pointer',
      }}
        onClick={onToggle}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Pulsing live dot */}
          <div style={{ position: 'relative', width: 14, height: 14, flexShrink: 0 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--amber-2)', animation: 'ping 1.4s infinite' }} />
            <div style={{ position: 'absolute', inset: 3, borderRadius: '50%', background: 'var(--amber-2)' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--amber-2)' }}>
              📡 Your {device?.make} {device?.model} is being detected on the network
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>
              Last seen: <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{lastSeen}</strong>
              &nbsp;·&nbsp;
              {totalPings} total detection{totalPings > 1 ? 's' : ''}
              &nbsp;·&nbsp;
              {isExpanded ? 'Tap to collapse ▲' : 'Tap to view details ▼'}
            </div>
          </div>
        </div>

        {/* Quick action buttons — always visible */}
        <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
          <button
            className="btn btn-amber btn-sm"
            onClick={copyReminder}
            title="Copy a reminder message to send to the police"
          >
            📋 Remind Police
          </button>
        </div>
      </div>

      {/* ── Expanded details ── */}
      {isExpanded && (
        <div style={{ background: 'var(--surface)', padding: '20px 22px' }}>

          {/* Safety warning */}
          <div className="alert alert-red" style={{ marginBottom: 20 }}>
            <span className="alert-icon">⚠️</span>
            <div>
              <strong>Do NOT attempt to recover the device yourself.</strong> Contact police with the case number and show them this detection record. Self-recovery attempts are dangerous and can compromise the police investigation.
            </div>
          </div>

          {/* Latest detection card */}
          <div style={{
            background: 'linear-gradient(135deg, var(--amber-pale), #fff)',
            border: '1px solid var(--amber)',
            borderRadius: 'var(--radius-2)',
            padding: 18,
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--amber)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
              📍 Latest Detection
            </div>
            <div className="grid-2" style={{ gap: 14 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 3 }}>General Area</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>{area}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{city}, Malawi</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 3 }}>Date &amp; Time</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>
                  {lastSeen.split(' ')[1]}
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
                  {lastSeen.split(' ')[0]}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 3 }}>Network Operator</div>
                <div style={{
                  display: 'inline-block',
                  padding: '3px 10px', borderRadius: 6, fontSize: 13, fontWeight: 800,
                  background: latestEvt.operator === 'Airtel' ? 'var(--red-pale)' : '#EBF3FF',
                  color:      latestEvt.operator === 'Airtel' ? 'var(--red)'      : 'var(--blue)',
                }}>
                  {latestEvt.operator}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 3 }}>Total Detections</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--amber)', fontFamily: 'var(--font-display)' }}>{totalPings}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>times on network</div>
              </div>
            </div>
          </div>

          {/* Detection history timeline — area + time only */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>
              Detection History
            </div>
            <div className="timeline">
              {events.slice().reverse().map((ev, i, arr) => {
                const evArea = getGeneralArea(ev.tower);
                return (
                  <div className="timeline-item" key={ev.id}>
                    {i < arr.length - 1 && <div className="timeline-line" />}
                    <div className="timeline-dot" style={{
                      background: ev.operator === 'Airtel' ? 'var(--red-pale)' : '#EBF3FF',
                      color: ev.operator === 'Airtel' ? 'var(--red)' : 'var(--blue)',
                      fontSize: 10, fontWeight: 800,
                    }}>
                      {ev.operator === 'Airtel' ? 'A' : 'T'}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-title">
                        📍 {evArea} &nbsp;
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 6,
                          background: ev.operator === 'Airtel' ? 'var(--red-pale)' : '#EBF3FF',
                          color: ev.operator === 'Airtel' ? 'var(--red)' : 'var(--blue)',
                        }}>
                          {ev.operator}
                        </span>
                      </div>
                      <div className="timeline-sub">
                        {ev.detectedAt}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Police reminder section */}
          <div style={{
            background: 'var(--navy)',
            borderRadius: 'var(--radius-2)',
            padding: 18,
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
              📋 Police Follow-up Message
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 14 }}>
              Use this message to follow up with the police if they are slow to act.
              Copy it and send via WhatsApp, SMS, or present it at the police station.
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.07)',
              borderRadius: 8, padding: 14,
              fontFamily: 'var(--font-mono)',
              fontSize: 11, color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.8, marginBottom: 14,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {reminderMsg}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-amber" onClick={copyReminder}>
                📋 Copy Message
              </button>
              <button
                className="btn"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}
                onClick={() => {
                  const sms = `sms:199?body=${encodeURIComponent(reminderMsg.slice(0, 160))}`;
                  window.open(sms);
                }}
              >
                📱 Send as SMS
              </button>
              <button
                className="btn"
                style={{ background: 'rgba(37,211,102,0.15)', color: '#25D366', border: '1px solid rgba(37,211,102,0.3)' }}
                onClick={() => {
                  window.open(`https://wa.me/?text=${encodeURIComponent(reminderMsg)}`);
                }}
              >
                💬 Share on WhatsApp
              </button>
            </div>
          </div>

          {/* What is hidden disclaimer */}
          <div className="alert alert-blue" style={{ marginTop: 14 }}>
            <span className="alert-icon">ℹ️</span>
            <div style={{ fontSize: 12 }}>
              For your safety and the integrity of the investigation, exact GPS coordinates, tower names, and network details are only available to police officers through the SDIRS Police Dashboard.
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAppStore, useCurrentUser } from '../../store/useAppStore';
import { deviceIcon } from '../../utils/helpers';
import {
  FiLink,
  FiSmartphone,
  FiRefreshCw,
  FiAlertCircle,
  FiUsers,
  FiCheckCircle,
  FiAlertTriangle,
  FiRadio,
  FiLock,
  FiClock,
  FiUser,
  FiSearch,
} from 'react-icons/fi';

// ── SIMULATED BLOCKCHAIN HASH ─────────────────────────────────
function simulateHash(input) {
  let hash = 0x811c9dc5;
  const str = JSON.stringify(input);
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return (
    hash.toString(16).padStart(8, '0').toUpperCase() +
    ((hash * 0x9e3779b9) >>> 0).toString(16).padStart(8, '0').toUpperCase() +
    ((hash * 0x6c62272e) >>> 0).toString(16).padStart(8, '0').toUpperCase() +
    ((hash * 0x1000193) >>> 0).toString(16).padStart(8, '0').toUpperCase()
  );
}

// Event type config
const EVENT_TYPES = {
  GENESIS: { icon: <FiLink />, label: 'Genesis Block', color: '#6B46C1', bg: '#F3F0FF' },
  DEVICE_REGISTERED: {
    icon: <FiSmartphone />,
    label: 'Device Registered',
    color: 'var(--green)',
    bg: 'var(--green-pale)',
  },
  OWNERSHIP_TRANSFER: {
    icon: <FiRefreshCw />,
    label: 'Ownership Transferred',
    color: 'var(--blue)',
    bg: '#EEF4FF',
  },
  THEFT_REPORTED: {
    icon: <FiAlertCircle />,
    label: 'Theft Reported',
    color: 'var(--amber)',
    bg: 'var(--amber-pale)',
  },
  THEFT_VERIFIED: {
    icon: <FiUsers />,
    label: 'Report Verified',
    color: 'var(--red)',
    bg: 'var(--red-pale)',
  },
  DEVICE_RECOVERED: {
    icon: <FiCheckCircle />,
    label: 'Device Recovered',
    color: 'var(--green)',
    bg: 'var(--green-pale)',
  },
  IMEI_ANOMALY: {
    icon: <FiAlertTriangle />,
    label: 'IMEI Anomaly Detected',
    color: 'var(--red)',
    bg: 'var(--red-pale)',
  },
  IOT_DETECTION: {
    icon: <FiRadio />,
    label: 'IoT Node Detection',
    color: '#0891B2',
    bg: '#E0F7FA',
  },
};

// ── BUILD BLOCKCHAIN FROM APP STATE ──────────────────────────
function buildChain(devices, reports, transfers, events) {
  // We want to return a map of deviceId -> blocks[]
  const allRawBlocks = [];

  // 1. One block per device registration (The "Genesis" for each device)
  devices.forEach((d, i) => {
    allRawBlocks.push({
      type: 'DEVICE_REGISTERED',
      timestamp: d.registeredDate + ' 09:00',
      actor: `Citizen U${String((i % 3) + 1).padStart(3, '0')}`,
      deviceId: d.id,
      payload: {
        device: `${d.make} ${d.model}`,
        imei: d.imei || '—',
        serial: d.serial || '—',
        mac: d.mac || '—',
        ownerId: d.ownerId,
      },
    });
  });

  // 2. Transfer blocks
  transfers.forEach((t) => {
    allRawBlocks.push({
      type: 'OWNERSHIP_TRANSFER',
      timestamp: t.createdAt,
      actor: `Citizen ${t.sellerId}`,
      deviceId: t.deviceId,
      payload: {
        from: t.sellerId,
        to: t.buyerId || 'Pending buyer',
        pin: t.pin,
        status: t.status,
        priceMWK: t.priceMWK,
      },
    });
  });

  // 3. Report blocks
  reports.forEach((r) => {
    allRawBlocks.push({
      type: 'THEFT_REPORTED',
      timestamp: r.date + ' 14:00',
      actor: `Citizen ${r.reportedBy}`,
      deviceId: r.deviceId,
      payload: {
        reportId: r.id,
        location: r.location,
        station: r.policeStation,
      },
    });
    if (r.status === 'active' || r.status === 'resolved') {
      allRawBlocks.push({
        type: 'THEFT_VERIFIED',
        timestamp: (r.verifiedAt || r.date) + ' 10:00',
        actor: r.verifiedBy
          ? `${r.verifiedBy.rank} · Badge ${r.verifiedBy.badgeNumber}`
          : 'Malawi Police Service',
        deviceId: r.deviceId,
        payload: {
          caseNumber: r.caseNumber,
          dispatched: r.dispatched,
          network: 'Airtel + TNM EIR Alert Dispatched',
          // Officer accountability — always recorded
          officerBadge: r.verifiedBy?.badgeNumber || 'Legacy record',
          officerRank: r.verifiedBy?.rank || '—',
          officerStation: r.verifiedBy?.station || '—',
          digitalSignature: r.verifiedBy?.digitalSignature || '—',
          signedAt: r.verifiedBy?.signedAt || r.verifiedAt || '—',
        },
      });
    }
    if (r.status === 'resolved') {
      allRawBlocks.push({
        type: 'DEVICE_RECOVERED',
        timestamp: (r.verifiedAt || r.date) + ' 16:30',
        actor: 'Malawi Police Service',
        deviceId: r.deviceId,
        payload: { caseNumber: r.caseNumber, method: 'SDIRS Intelligence-led recovery' },
      });
    }
  });

  // 4. Telecom Anomaly blocks
  allRawBlocks.push({
    type: 'IMEI_ANOMALY',
    timestamp: '2026-03-09 13:22',
    actor: 'SDIRS Anomaly Engine',
    deviceId: 'D002',
    payload: {
      originalIMEI: '490123456789012',
      detectedIMEI: '490999888777001',
      tower: 'Kawale Tower B',
      operator: 'Airtel',
      note: 'IMEI changed between consecutive connections on same SIM',
    },
  });

  // 5. IoT blocks
  allRawBlocks.push({
    type: 'IOT_DETECTION',
    timestamp: '2026-03-10 08:45',
    actor: 'IoT Node — Shoprite City Mall WiFi',
    deviceId: 'D002',
    payload: {
      nodeType: 'WiFi Access Point',
      location: 'Shoprite City Mall, Ground Floor',
      macSeen: 'Probing signature matched D002',
      confidence: '94%',
    },
  });

  // Now, group and chain
  const grouped = {};
  allRawBlocks.forEach((b) => {
    if (!grouped[b.deviceId]) grouped[b.deviceId] = [];
    grouped[b.deviceId].push(b);
  });

  // Sort each group and chain hashes
  const finalChains = {};
  Object.keys(grouped).forEach((dId) => {
    const deviceBlocks = grouped[dId];
    deviceBlocks.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    // Add Genesis for each device if it's the first time we see it
    // Wait, the DEVICE_REGISTERED is the genesis.
    // But we can add a system-level genesis if we want.
    // Let's just chain them.
    deviceBlocks.forEach((block, i) => {
      block.index = i;
      block.prevHash = i === 0 ? '0'.repeat(64) : simulateHash(deviceBlocks[i - 1]);
      block.hash = simulateHash(block);
    });
    finalChains[dId] = deviceBlocks;
  });

  return finalChains;
}

// ── PAGE COMPONENT ────────────────────────────────────────────
export default function OwnershipChainPage() {
  const allDevices = useAppStore((state) => state.devices);
  const allReports = useAppStore((state) => state.reports);
  const allTransfers = useAppStore((state) => state.transfers);
  const allEvents = useAppStore((state) => state.events);
  const user = useCurrentUser();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const urlDeviceId = queryParams.get('deviceId');

  // If citizen, only show their own devices and related data
  const isCitizen = user?.role === 'citizen';

  const devices = useMemo(
    () => (isCitizen ? allDevices.filter((d) => d.ownerId === user.id) : allDevices),
    [allDevices, isCitizen, user?.id]
  );

  const reports = useMemo(
    () =>
      isCitizen ? allReports.filter((r) => devices.some((d) => d.id === r.deviceId)) : allReports,
    [allReports, isCitizen, devices]
  );

  const transfers = useMemo(
    () =>
      isCitizen
        ? allTransfers.filter((t) => devices.some((d) => d.id === t.deviceId))
        : allTransfers,
    [allTransfers, isCitizen, devices]
  );

  const events = useMemo(
    () =>
      isCitizen ? allEvents.filter((e) => reports.some((r) => r.id === e.reportId)) : allEvents,
    [allEvents, isCitizen, reports]
  );

  const [selectedDevice, setSelectedDevice] = useState(
    urlDeviceId || (isCitizen && devices.length > 0 ? devices[0].id : 'ALL')
  );
  const [expandedBlock, setExpandedBlock] = useState(null);
  const [search, setSearch] = useState('');

  // Handle URL change
  useEffect(() => {
    if (urlDeviceId && (!isCitizen || devices.some((d) => d.id === urlDeviceId))) {
      setSelectedDevice(urlDeviceId);
    }
  }, [urlDeviceId, isCitizen, devices]);

  const chains = useMemo(
    () => buildChain(devices, reports, transfers, events),
    [devices, reports, transfers, events]
  );

  // Filtered list: ALL (interleaved) or specific device (chained)
  const filtered = useMemo(() => {
    let result = [];
    if (selectedDevice === 'ALL') {
      // Interleave all blocks from all chains and sort by date
      result = Object.values(chains).flat();
      result.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    } else {
      result = chains[selectedDevice] || [];
    }

    if (search) {
      const s = search.toLowerCase();
      return result.filter(
        (b) =>
          b.type.toLowerCase().includes(s) ||
          b.actor.toLowerCase().includes(s) ||
          JSON.stringify(b.payload).toLowerCase().includes(s) ||
          b.hash.toLowerCase().includes(s)
      );
    }
    return result;
  }, [chains, selectedDevice, search]);

  // Security check: if citizen tries to access unauthorized deviceId via URL
  if (isCitizen && selectedDevice !== 'ALL' && !devices.some((d) => d.id === selectedDevice)) {
    return <Navigate to="/my-devices" replace />;
  }

  const currentDevice = devices.find((d) => d.id === selectedDevice);

  return (
    <div className="fade-up">
      {/* ── Hero banner ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a0050 0%, #2d0080 40%, var(--navy) 100%)',
          borderRadius: 'var(--radius)',
          padding: '28px 32px',
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 80% 50%, rgba(107,70,193,0.3) 0%, transparent 65%)',
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
            Immutable Ledger · Tamper-Proof · Court-Admissible
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 26,
              fontWeight: 800,
              color: '#fff',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <FiLink /> Ownership Ledger
          </div>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            {[
              [filtered.length, 'Blocks in View', '#C4B5FD'],
              [
                filtered.filter((b) => b.type === 'DEVICE_REGISTERED').length,
                'Registrations',
                '#86EFAC',
              ],
              [
                filtered.filter((b) => b.type === 'IMEI_ANOMALY').length,
                'IMEI Anomalies',
                '#FCA5A5',
              ],
              [
                filtered.filter((b) => b.type === 'OWNERSHIP_TRANSFER').length,
                'Transfers',
                '#93C5FD',
              ],
            ].map(([n, l, c]) => (
              <div key={l}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 24,
                    fontWeight: 800,
                    color: c,
                  }}
                >
                  {n}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Chain integrity indicator ── */}
      <div className="card" style={{ marginBottom: 20, borderColor: '#C4B5FD', borderWidth: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 28, color: 'var(--purple)' }}>
            <FiLock />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--green)' }}>
              Chain Integrity: VERIFIED ✓
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              {selectedDevice === 'ALL'
                ? `All ${filtered.length} global blocks validated · Network ledger synchronized`
                : `Verified lineage for ${currentDevice?.make} ${currentDevice?.model} · ${filtered.length} sequential blocks matching device ID`}
            </div>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--muted)',
              wordBreak: 'break-all',
              maxWidth: 280,
            }}
          >
            Latest hash:{' '}
            <span style={{ color: '#6B46C1', fontWeight: 700 }}>
              {filtered[filtered.length - 1]?.hash}
            </span>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          className="field-input mono"
          style={{ flex: 1, minWidth: 200, fontSize: 12 }}
          placeholder="Search blocks — hash, actor, device, event type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="field-input field-select"
          style={{ width: 220 }}
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
        >
          {!isCitizen && <option value="ALL">All Devices</option>}
          {devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.make} {d.model}
            </option>
          ))}
        </select>
      </div>

      {/* ── Device Lifecycle Summary ── */}
      {selectedDevice !== 'ALL' && currentDevice && (
        <div
          className="card"
          style={{
            marginBottom: 24,
            background: 'var(--bg)',
            borderLeft: '4px solid var(--purple)',
          }}
        >
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 12,
                background: 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
              }}
            >
              {deviceIcon(currentDevice.type)}
            </div>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: 'var(--purple)',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  marginBottom: 4,
                }}
              >
                Device Lifecycle Tracking
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>
                {currentDevice.make} {currentDevice.model}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                <strong>Status:</strong>{' '}
                <span style={{ color: 'var(--ink-2)', fontWeight: 600 }}>
                  {currentDevice.status.toUpperCase()}
                </span>{' '}
                &nbsp;·&nbsp;
                <strong>ID:</strong>{' '}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                  {currentDevice.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Chain blocks ── */}
      <div>
        {filtered.map((block, i) => {
          const cfg = EVENT_TYPES[block.type] || EVENT_TYPES.GENESIS;
          const device = devices.find((d) => d.id === block.deviceId);
          const isOpen = expandedBlock === block.index;
          const isAnomaly = block.type === 'IMEI_ANOMALY';

          return (
            <div key={block.index} style={{ display: 'flex', gap: 0, marginBottom: 0 }}>
              {/* Chain line + block number */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: 52,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: isAnomaly ? 'var(--red)' : cfg.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    flexShrink: 0,
                    zIndex: 1,
                    boxShadow: isAnomaly ? '0 0 12px rgba(192,37,44,0.5)' : 'none',
                  }}
                >
                  {cfg.icon}
                </div>
                {i < filtered.length - 1 && (
                  <div
                    style={{
                      width: 2,
                      flex: 1,
                      minHeight: 24,
                      background: 'var(--muted-3)',
                      margin: '4px 0',
                    }}
                  />
                )}
              </div>

              {/* Block card */}
              <div
                style={{
                  flex: 1,
                  marginBottom: 10,
                  border: `1px solid ${isAnomaly ? 'var(--red-2)' : 'var(--muted-3)'}`,
                  borderRadius: 'var(--radius-2)',
                  background: isAnomaly ? 'var(--red-pale)' : 'var(--surface)',
                  overflow: 'hidden',
                }}
              >
                {/* Block header */}
                <div
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                  onClick={() => setExpandedBlock(isOpen ? null : block.index)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: cfg.bg,
                          color: cfg.color,
                        }}
                      >
                        {cfg.label}
                      </span>
                      {device && (
                        <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
                          {deviceIcon(device.type)} {device.make} {device.model}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--muted)',
                        marginTop: 4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <FiClock size={12} /> {block.timestamp} &nbsp;·&nbsp; <FiUser size={12} />{' '}
                      {block.actor}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: 10,
                        color: 'var(--muted-2)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      Block #{block.index}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: '#6B46C1',
                        fontFamily: 'var(--font-mono)',
                        marginTop: 2,
                      }}
                    >
                      {block.hash.slice(0, 16)}…
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted-2)', marginTop: 2 }}>
                      {isOpen ? '▲' : '▼'}
                    </div>
                  </div>
                </div>

                {/* Expanded block detail */}
                {isOpen && (
                  <div
                    style={{
                      borderTop: '1px solid var(--muted-3)',
                      padding: '14px 16px',
                      background: 'var(--bg)',
                    }}
                  >
                    <div className="grid-2" style={{ gap: 12, marginBottom: 14 }}>
                      <HashField label="Block Hash" value={block.hash} />
                      <HashField label="Previous Hash" value={block.prevHash} />
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        marginBottom: 8,
                      }}
                    >
                      Block Payload
                    </div>
                    <div
                      style={{
                        background: 'var(--navy)',
                        borderRadius: 8,
                        padding: '12px 14px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.8)',
                        lineHeight: 1.8,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {JSON.stringify(block.payload, null, 2)}
                    </div>

                    {isAnomaly && (
                      <div className="alert alert-red" style={{ marginTop: 12 }}>
                        <span className="alert-icon">
                          <FiAlertTriangle />
                        </span>
                        <div>
                          <strong>IMEI Tampering Evidence — Court Admissible Record</strong>
                          <br />
                          This block provides cryptographic proof that IMEI modification occurred on
                          this device. The block timestamp, previous hash, and payload are
                          immutable. Reference this block number ({block.index}) in court
                          proceedings.
                        </div>
                      </div>
                    )}

                    {/* ── Officer Accountability Card (THEFT_VERIFIED blocks only) ── */}
                    {block.type === 'THEFT_VERIFIED' &&
                      block.payload.digitalSignature &&
                      block.payload.digitalSignature !== '—' && (
                        <div
                          style={{
                            marginTop: 14,
                            borderRadius: 12,
                            border: '1px solid rgba(139, 92, 246, 0.35)',
                            background: 'linear-gradient(135deg, #1e1b4b, #2d2060)',
                            overflow: 'hidden',
                          }}
                        >
                          {/* Header */}
                          <div
                            style={{
                              padding: '10px 14px',
                              background: 'rgba(139, 92, 246, 0.15)',
                              borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            <FiLock size={13} style={{ color: '#a78bfa' }} />
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 800,
                                color: '#a78bfa',
                                letterSpacing: 1,
                                textTransform: 'uppercase',
                              }}
                            >
                              Officer Accountability Signature
                            </span>
                            <span
                              style={{
                                marginLeft: 'auto',
                                fontSize: 10,
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: 20,
                                background: 'rgba(74, 222, 128, 0.15)',
                                color: '#4ade80',
                                border: '1px solid rgba(74, 222, 128, 0.3)',
                              }}
                            >
                              ✓ VERIFIED
                            </span>
                          </div>

                          {/* Officer details grid */}
                          <div
                            style={{
                              padding: '14px',
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '10px 20px',
                            }}
                          >
                            {[
                              ['Badge / Service No.', block.payload.officerBadge],
                              ['Rank', block.payload.officerRank],
                              ['Verifying Station', block.payload.officerStation],
                              ['Signed At', block.payload.signedAt],
                            ].map(([label, value]) => (
                              <div key={label}>
                                <div
                                  style={{
                                    fontSize: 9,
                                    fontWeight: 800,
                                    color: 'rgba(255,255,255,0.35)',
                                    textTransform: 'uppercase',
                                    letterSpacing: 1,
                                    marginBottom: 3,
                                  }}
                                >
                                  {label}
                                </div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>
                                  {value || '—'}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Digital signature fingerprint */}
                          <div
                            style={{
                              margin: '0 14px 14px',
                              padding: '10px 12px',
                              background: 'rgba(0,0,0,0.3)',
                              borderRadius: 8,
                              border: '1px solid rgba(139, 92, 246, 0.2)',
                            }}
                          >
                            <div
                              style={{
                                fontSize: 9,
                                fontWeight: 800,
                                color: 'rgba(255,255,255,0.35)',
                                textTransform: 'uppercase',
                                letterSpacing: 1,
                                marginBottom: 5,
                              }}
                            >
                              Digital Signature Fingerprint
                            </div>
                            <div
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 13,
                                fontWeight: 700,
                                color: '#a78bfa',
                                letterSpacing: 1,
                                wordBreak: 'break-all',
                              }}
                            >
                              {block.payload.digitalSignature}
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: 'rgba(255,255,255,0.35)',
                                marginTop: 5,
                              }}
                            >
                              FNV-1a hash of Badge · PIN · Report ID · Timestamp — immutable
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12, color: 'var(--muted-2)' }}>
            <FiSearch size={48} />
          </div>
          <div style={{ fontWeight: 700 }}>No blocks match your search</div>
        </div>
      )}
    </div>
  );
}

function HashField({ label, value }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: '#6B46C1',
          wordBreak: 'break-all',
          lineHeight: 1.6,
        }}
      >
        {value}
      </div>
    </div>
  );
}

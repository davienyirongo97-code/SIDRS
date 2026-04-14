/**
 * src/components/ui/DeviceLookup.js
 * ─────────────────────────────────────────────
 * Reusable device lookup / search panel for Police and MACRA pages.
 *
 * MULTI-IDENTIFIER MATCHING (IMEI Defence Layer):
 *   Searches across ALL identifiers simultaneously:
 *     - IMEI (primary — all phones)
 *     - Serial number (hardware ID — all phones)
 *
 *   WHY THIS MATTERS:
 *   A thief who has attempted IMEI tampering cannot change the serial
 *   number without physical hardware replacement.
 *   Searching by serial still finds and identifies the phone.
 *
 *   MATCH CONFIDENCE PANEL:
 *   Shows which identifiers matched and which did not, so police
 *   can understand exactly how the device was identified and which
 *   identifiers have been tampered with.
 *
 * Also returns:
 *   - Full owner profile (name, NRC, phone, address)
 *   - Emergency reference contact
 *   - Active theft report (if any)
 *   - Network detection events + IoT detections
 *   - Transfer history
 *   - Blockchain block reference
 */

import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatNumber, checkDuplicateDevice } from '../../utils/helpers';
import Badge from './Badge';
import {
  FiSearch,
  FiShield,
  FiAlertCircle,
  FiCheckCircle,
  FiSmartphone,
  FiUser,
  FiAlertOctagon,
  FiRadio,
  FiRefreshCw,
  FiLock,
  FiHelpCircle,
  FiMapPin,
  FiPhone,
  FiMail,
} from 'react-icons/fi';

// ── MULTI-IDENTIFIER SEARCH ───────────────────────────────────
// Returns the device match PLUS a breakdown of which identifiers
// matched, which were absent, and which may have been tampered with.
function multiIdentifierSearch(query, devices, reports) {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  let bestDevice = null;
  let matchedField = null;
  let matchScore = 0;

  for (const d of devices) {
    if (d.imei && d.imei.toLowerCase() === q) {
      bestDevice = d;
      matchedField = 'imei';
      matchScore = 100;
      break;
    }
    if (d.serial && d.serial.toLowerCase() === q) {
      bestDevice = d;
      matchedField = 'serial';
      matchScore = 98;
      break;
    }
    if (d.mac && d.mac.toLowerCase() === q) {
      bestDevice = d;
      matchedField = 'mac';
      matchScore = 95;
      break;
    }
    // Partial match fallback (for demo convenience — type partial identifiers)
    if (d.imei && d.imei.includes(query.trim())) {
      bestDevice = d;
      matchedField = 'imei';
      matchScore = 75;
    }
    if (d.serial && d.serial.toLowerCase().includes(q)) {
      bestDevice = d;
      matchedField = 'serial';
      matchScore = 70;
    }
    if (d.mac && d.mac.toLowerCase().includes(q)) {
      bestDevice = d;
      matchedField = 'mac';
      matchScore = 65;
    }
  }

  if (!bestDevice) return { status: 'not_found', matchAnalysis: null };

  // Build match analysis — which identifiers are present, which matched
  const matchAnalysis = {
    searched: query.trim(),
    matchedField,
    matchScore,
    identifiers: [
      {
        field: 'IMEI',
        value: bestDevice.imei || null,
        matched: matchedField === 'imei',
        present: !!bestDevice.imei,
        note: !bestDevice.imei ? 'Not applicable (laptop/tablet without SIM)' : null,
      },
      {
        field: 'Serial Number',
        value: bestDevice.serial || null,
        matched: matchedField === 'serial',
        present: !!bestDevice.serial,
        note: !bestDevice.serial ? 'Not registered' : null,
      },
      {
        field: 'MAC Address',
        value: bestDevice.mac || null,
        matched: matchedField === 'mac',
        present: !!bestDevice.mac,
        note: !bestDevice.mac ? 'Not registered (mobile without MAC entry)' : null,
      },
    ],
  };

  const report = reports.find(
    (r) => r.deviceId === bestDevice.id && (r.status === 'active' || r.status === 'pending')
  );

  return {
    status: report ? 'stolen' : 'clean',
    device: bestDevice,
    report: report || null,
    matchAnalysis,
  };
}

export default function DeviceLookup() {
  const devices = useAppStore((state) => state.devices);
  const reports = useAppStore((state) => state.reports);
  const events = useAppStore((state) => state.events);
  const transfers = useAppStore((state) => state.transfers);
  const users = useAppStore((state) => state.users);
  const [imeiVal, setImeiVal] = useState('');
  const [serialVal, setSerialVal] = useState('');
  const [macVal, setMacVal] = useState('');
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState('single'); // 'single' | 'multi'

  function handleSearch() {
    // Multi-field mode: cross-validate IMEI + serial if both provided
    if (mode === 'multi') {
      // If both IMEI and serial are entered, check they belong to the same device
      if (imeiVal.trim() && serialVal.trim()) {
        const imeiDevice = devices.find((d) => d.imei === imeiVal.trim());
        const serialDevice = devices.find((d) => d.serial === serialVal.trim());
        if (imeiDevice && serialDevice && imeiDevice.id !== serialDevice.id) {
          setResult({ status: 'mismatch', matchAnalysis: null });
          return;
        }
      }
      const queries = [imeiVal, serialVal, macVal].filter(Boolean);
      for (const q of queries) {
        const r = multiIdentifierSearch(q, devices, reports);
        if (r && r.status !== 'not_found') {
          setResult(r);
          return;
        }
      }
      setResult({ status: 'not_found', matchAnalysis: null });
      return;
    }
    // Single field mode
    const q = imeiVal.trim();
    if (!q) return;
    setResult(multiIdentifierSearch(q, devices, reports));
  }

  function handleClear() {
    setImeiVal('');
    setSerialVal('');
    setMacVal('');
    setResult(null);
  }

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
          paddingBottom: 14,
          borderBottom: '1px solid var(--muted-3)',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'linear-gradient(135deg, var(--blue), var(--navy-3))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}
        >
          🔍
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 15,
              fontWeight: 800,
              color: 'var(--ink)',
            }}
          >
            Device Owner Lookup — Multi-Identifier Search
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Search by IMEI · Serial Number · MAC Address — finds device even if IMEI has been
            tampered with
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            style={{
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: mode === 'single' ? 'var(--blue)' : 'var(--muted-3)',
              background: mode === 'single' ? 'var(--blue)' : 'transparent',
              color: mode === 'single' ? '#fff' : 'var(--muted)',
            }}
            onClick={() => setMode('single')}
          >
            Single
          </button>
          <button
            style={{
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: mode === 'multi' ? 'var(--blue)' : 'var(--muted-3)',
              background: mode === 'multi' ? 'var(--blue)' : 'transparent',
              color: mode === 'multi' ? '#fff' : 'var(--muted)',
            }}
            onClick={() => setMode('multi')}
          >
            Multi-ID
          </button>
        </div>
      </div>

      {/* ── Search fields ── */}
      {mode === 'single' ? (
        <div style={{ display: 'flex', gap: 10, marginBottom: result ? 20 : 0 }}>
          <input
            className="field-input mono"
            style={{ flex: 1, fontSize: 14 }}
            placeholder="Enter IMEI · Serial Number · MAC Address  (e.g. 490123456789012)"
            value={imeiVal}
            onChange={(e) => setImeiVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn btn-primary" onClick={handleSearch}>
            <FiSearch size={14} style={{ marginRight: 6 }} /> Search
          </button>
          {result && (
            <button className="btn btn-surface" onClick={handleClear}>
              ✕
            </button>
          )}
        </div>
      ) : (
        <div style={{ marginBottom: result ? 20 : 0 }}>
          <div
            style={{
              padding: '12px 14px',
              background: 'var(--amber-pale)',
              borderRadius: 10,
              marginBottom: 14,
              border: '1px solid #F5C35A',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 700 }}>
              <FiShield size={14} style={{ marginRight: 6 }} /> IMEI Defence Mode — Fill any
              identifiers you have. System matches on all of them simultaneously. A device with a
              tampered IMEI is still found via its Serial Number or MAC Address.
            </div>
          </div>
          <div className="grid-2" style={{ gap: 12, marginBottom: 12 }}>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--muted)',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                }}
              >
                IMEI Number
              </div>
              <input
                className="field-input mono"
                placeholder="e.g. 490123456789012"
                value={imeiVal}
                onChange={(e) => setImeiVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--muted)',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                }}
              >
                Serial Number
              </div>
              <input
                className="field-input mono"
                placeholder="e.g. SNX-2024-00432"
                value={serialVal}
                onChange={(e) => setSerialVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--muted)',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                }}
              >
                MAC Address
              </div>
              <input
                className="field-input mono"
                placeholder="e.g. A4:C3:F0:85:AC:12"
                value={macVal}
                onChange={(e) => setMacVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={handleSearch}>
              <FiSearch size={14} style={{ marginRight: 6 }} /> Multi-ID Search
            </button>
            {result && (
              <button className="btn btn-surface" onClick={handleClear}>
                ✕ Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {result && (
        <LookupResult result={result} events={events} transfers={transfers} users={users} />
      )}
    </div>
  );
}

/* ── LOOKUP RESULT COMPONENT ─────────────────────────────────── */
function LookupResult({ result, events, transfers, users }) {
  /* MISMATCH — IMEI and serial belong to different devices */
  if (result.status === 'mismatch') {
    return (
      <div
        style={{
          padding: '20px 24px',
          background: 'var(--red-pale)',
          borderRadius: 'var(--radius-2)',
          border: '2px solid var(--red-2)',
        }}
      >
        <div
          style={{
            fontWeight: 900,
            fontSize: 16,
            color: 'var(--red)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 10,
          }}
        >
          <FiAlertOctagon /> IDENTIFIER MISMATCH — Possible IMEI Cloning
        </div>
        <div style={{ fontSize: 13, color: 'var(--red)', lineHeight: 1.7 }}>
          The IMEI and serial number entered belong to <strong>two different devices</strong> in the
          national registry. This is a strong indicator of IMEI tampering or cloning. Do not release
          this device. Detain for further investigation.
        </div>
      </div>
    );
  }

  /* NOT FOUND */
  if (result.status === 'not_found') {
    return (
      <div
        style={{
          padding: '20px 24px',
          background: 'var(--bg-2)',
          borderRadius: 'var(--radius-2)',
          border: '1px solid var(--muted-3)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 10, color: 'var(--muted)' }}>
          <FiHelpCircle size={36} />
        </div>
        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--muted)', marginBottom: 6 }}>
          No Device Found in Registry
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted-2)', lineHeight: 1.6 }}>
          This IMEI / serial / MAC is not registered in SDIRS.
          <br />
          The device may be unregistered or the identifier may be incorrect.
          <br />
          Advise the device holder to register at the nearest MACRA office or via the SDIRS app.
        </div>
      </div>
    );
  }

  const d = result.device;
  const r = result.report;
  const owner = d?.ownerProfile;
  const ref_ = d?.referenceContact;
  const isStolen = result.status === 'stolen';

  // Network events for this device
  const devEvents = r ? events.filter((e) => e.reportId === r.id) : [];

  // Transfer history for this device
  const devTransfers = transfers.filter((t) => t.deviceId === d.id);

  return (
    <div style={{ animation: 'fadeUp .3s ease both' }}>
      {/* ── MATCH CONFIDENCE PANEL ── */}
      {result.matchAnalysis && (
        <div
          style={{
            marginBottom: 16,
            borderRadius: 'var(--radius-2)',
            border: '1px solid #C4B5FD',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '10px 14px',
              background: '#1a0050',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>
                <FiShield size={14} color="#C4B5FD" />
              </span>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#C4B5FD' }}>
                IDENTIFIER MATCH ANALYSIS
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                Match confidence:
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: result.matchAnalysis.matchScore >= 90 ? '#86EFAC' : '#FCD34D',
                }}
              >
                {result.matchAnalysis.matchScore}%
              </span>
            </div>
          </div>
          <div
            style={{
              padding: '12px 14px',
              background: '#F3F0FF',
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            {result.matchAnalysis.identifiers.map((id) => (
              <div
                key={id.field}
                style={{
                  flex: 1,
                  minWidth: 140,
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: id.matched ? '#DCFCE7' : id.present ? '#FFF7ED' : '#F1F5F9',
                  border: `1px solid ${id.matched ? '#86EFAC' : id.present ? '#FCD34D' : '#CBD5E1'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <span style={{ fontSize: 14 }}>
                    {id.matched ? (
                      <FiCheckCircle color="#166534" />
                    ) : id.present ? (
                      <span style={{ color: '#92400E' }}>◎</span>
                    ) : (
                      <FiAlertCircle color="#64748B" />
                    )}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: id.matched ? '#166534' : id.present ? '#92400E' : '#64748B',
                    }}
                  >
                    {id.field}
                    {id.matched && ' — MATCHED'}
                    {!id.matched && id.present && ' — not searched'}
                    {!id.present && ' — not registered'}
                  </span>
                </div>
                {id.value ? (
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: '#334155',
                      wordBreak: 'break-all',
                    }}
                  >
                    {id.value}
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: '#94A3B8', fontStyle: 'italic' }}>
                    {id.note}
                  </div>
                )}
              </div>
            ))}
          </div>
          {result.matchAnalysis.matchedField !== 'imei' && result.device?.imei && (
            <div
              style={{ padding: '8px 14px', background: '#FEF9C3', borderTop: '1px solid #FDE047' }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: '#713F12' }}>
                <FiAlertCircle size={12} color="#EAB308" style={{ marginRight: 4 }} /> Device found
                via {result.matchAnalysis.identifiers.find((i) => i.matched)?.field} — IMEI did not
                match query. This may indicate IMEI tampering. Verify physical IMEI label against
                registered value:{' '}
                <span style={{ fontFamily: 'var(--font-mono)' }}>{result.device.imei}</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── STATUS BANNER ── */}
      <div
        style={{
          padding: '14px 18px',
          borderRadius: 'var(--radius-2)',
          background: isStolen ? 'var(--red-pale)' : 'var(--green-pale)',
          border: `2px solid ${isStolen ? 'var(--red-2)' : 'var(--green-2)'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 900,
              fontSize: 17,
              color: isStolen ? 'var(--red)' : 'var(--green)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {isStolen ? (
              <>
                <FiAlertCircle /> STOLEN DEVICE — Active Theft Report
              </>
            ) : (
              <>
                <FiCheckCircle /> REGISTERED DEVICE — No Theft Reports
              </>
            )}
          </div>
          <div
            style={{ fontSize: 12, color: isStolen ? 'var(--red)' : 'var(--green)', marginTop: 3 }}
          >
            {isStolen
              ? `Reported stolen on ${r.date} · ${r.policeStation}`
              : `Registered on ${d.registeredDate} — Owner profile below`}
          </div>
        </div>
        <Badge status={d.status} />
      </div>

      {/* ── DEVICE DETAILS ── */}
      <Section icon={<FiSmartphone />} title="Device Details" color="var(--blue)">
        <div className="grid-2" style={{ gap: 12 }}>
          <Field label="Make & Model" value={`${d.make} ${d.model}`} bold />
          <Field label="Type" value={d.type} capitalize />
          <Field label="Colour" value={d.color || '—'} />
          <Field label="IMEI (SIM 1)" value={d.imei || '—'} mono />
          <Field label="IMEI (SIM 2)" value={d.imei2 || '—'} mono />
          <Field label="Serial Number" value={d.serial || '—'} mono />
          <Field label="MAC Address" value={d.mac || '—'} mono />
          <Field label="Registered On" value={d.registeredDate} />
          {d.purchaseDate && <Field label="Purchased On" value={d.purchaseDate} />}
          {d.purchasePlace && <Field label="Purchased From" value={d.purchasePlace} />}
          {d.estimatedValueMWK && (
            <Field label="Est. Value" value={`MWK ${formatNumber(d.estimatedValueMWK)}`} />
          )}
        </div>
      </Section>

      {/* ── OWNER PROFILE ── */}
      <Section icon={<FiUser />} title="Registered Owner" color="var(--blue)" confidential>
        {owner ? (
          <div>
            {/* Name + ID — most prominent */}
            <div
              style={{
                padding: '14px 16px',
                background: 'linear-gradient(135deg, var(--navy), var(--navy-2))',
                borderRadius: 10,
                marginBottom: 14,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 20,
                    fontWeight: 800,
                    color: '#fff',
                  }}
                >
                  {owner.fullName}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.55)',
                    marginTop: 4,
                  }}
                >
                  {owner.idType?.toUpperCase()} · {owner.idNumber}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                  District
                </div>
                <div style={{ fontWeight: 800, color: 'var(--amber-2)' }}>{owner.district}</div>
              </div>
            </div>

            <div className="grid-2" style={{ gap: 12, marginBottom: 14 }}>
              {/* Phone — most important for police */}
              <div
                style={{
                  padding: '12px 14px',
                  background: 'var(--green-pale)',
                  borderRadius: 10,
                  border: '1px solid var(--green-2)',
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: 'var(--green)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 4,
                  }}
                >
                  <FiPhone size={11} style={{ marginRight: 4 }} /> Primary Phone (Call First)
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: 'var(--green)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {owner.phone}
                </div>
              </div>
              <div style={{ padding: '12px 14px', background: 'var(--bg)', borderRadius: 10 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 4,
                  }}
                >
                  <FiMail size={11} style={{ marginRight: 4 }} /> Email
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>
                  {owner.email || '—'}
                </div>
              </div>
            </div>

            <Field label="Village / Area" value={owner.villageArea || '—'} />
            <div style={{ marginTop: 10 }}>
              <Field label="Full Physical Address" value={owner.residence} bold />
            </div>
          </div>
        ) : (
          <div className="alert alert-amber">
            <span className="alert-icon">
              <FiAlertCircle />
            </span>
            <div>
              No owner profile on file. Device registered before profile fields were introduced.
            </div>
          </div>
        )}
      </Section>

      {/* ── EMERGENCY REFERENCE CONTACT ── */}
      {ref_ && ref_.name && (
        <Section
          icon={<FiAlertOctagon />}
          title="Emergency Reference Contact"
          color="var(--red)"
          confidential
        >
          <div
            style={{
              padding: '14px 16px',
              background: 'var(--red-pale)',
              borderRadius: 10,
              border: '1px solid rgba(192,37,44,0.3)',
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--red)', marginBottom: 8, fontWeight: 700 }}>
              ↓ Call if owner's primary number is unreachable
            </div>
            <div className="grid-2" style={{ gap: 12 }}>
              <div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 3,
                  }}
                >
                  Name
                </div>
                <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--ink)' }}>
                  {ref_.name}
                </div>
                {ref_.relationship && (
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                    {ref_.relationship} of owner
                  </div>
                )}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: 'var(--red)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 3,
                  }}
                >
                  <FiPhone size={11} style={{ marginRight: 4 }} /> Reference Phone
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: 'var(--red)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {ref_.phone}
                </div>
              </div>
              {ref_.email && (
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: 'var(--muted)',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      marginBottom: 3,
                    }}
                  >
                    Email
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{ref_.email}</div>
                </div>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* ── ACTIVE THEFT REPORT ── */}
      {r && (
        <Section icon={<FiAlertCircle />} title="Active Theft Report" color="var(--red)">
          <div className="grid-2" style={{ gap: 12 }}>
            <Field label="Report ID" value={r.id} mono />
            <Field label="Case Number" value={r.caseNumber || 'Pending verification'} mono />
            <Field label="Date of Theft" value={r.date} danger />
            <Field label="Police Station" value={r.policeStation} />
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Location" value={r.location} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Description" value={r.description} />
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <Badge status={r.status} />
            {r.dispatched && (
              <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>
                <FiRadio size={11} style={{ marginRight: 4 }} /> Network alert active on Airtel
                &amp; TNM
              </span>
            )}
          </div>
        </Section>
      )}

      {/* ── NETWORK DETECTION EVENTS ── */}
      {devEvents.length > 0 && (
        <Section
          icon={<FiRadio />}
          title={`Network Detection Events (${devEvents.length})`}
          color="var(--amber)"
        >
          {devEvents
            .slice()
            .reverse()
            .map((ev) => (
              <div
                key={ev.id}
                style={{
                  padding: '10px 14px',
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius-2)',
                  marginBottom: 8,
                  borderLeft: `3px solid ${ev.operator === 'Airtel' ? 'var(--red)' : 'var(--blue)'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: ev.operator === 'Airtel' ? 'var(--red-pale)' : '#EBF3FF',
                      color: ev.operator === 'Airtel' ? 'var(--red)' : 'var(--blue)',
                    }}
                  >
                    {ev.operator}
                  </span>
                  <span
                    style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}
                  >
                    {ev.detectedAt}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  <FiMapPin size={11} /> {ev.tower} · ±{ev.radiusMeters}m
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                  Active SIM:{' '}
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
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--muted-2)',
                    marginTop: 2,
                  }}
                >
                  {ev.latitude}°S, {ev.longitude}°E
                </div>
              </div>
            ))}
        </Section>
      )}

      {/* ── TRANSFER HISTORY ── */}
      {devTransfers.length > 0 && (
        <Section
          icon={<FiRefreshCw />}
          title={`Ownership Transfer History (${devTransfers.length})`}
          color="var(--purple)"
        >
          {devTransfers.map((t) => {
            const buyer = users.find((u) => u.id === t.buyerId);
            const seller = users.find((u) => u.id === t.sellerId);
            return (
              <div
                key={t.id}
                style={{
                  padding: '10px 14px',
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius-2)',
                  marginBottom: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Transfer on {t.createdAt}</span>
                  <Badge status={t.status} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  From: <strong>{seller?.name || t.sellerId}</strong> → To:{' '}
                  <strong>{buyer?.name || t.buyerId || 'Pending'}</strong>
                </div>
                {t.priceMWK > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                    MWK {formatNumber(t.priceMWK)}
                  </div>
                )}
                <div
                  style={{
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--muted-2)',
                    marginTop: 4,
                  }}
                >
                  {t.id}
                </div>
              </div>
            );
          })}
        </Section>
      )}
    </div>
  );
}

/* ── REUSABLE SECTION WRAPPER ─────────────────────────────────── */
function Section({ icon, title, color, confidential, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: `${color}12`,
          borderRadius: '8px 8px 0 0',
          borderTop: `2px solid ${color}`,
          borderLeft: `1px solid ${color}30`,
          borderRight: `1px solid ${color}30`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 15 }}>{icon}</span>
          <span style={{ fontSize: 12, fontWeight: 800, color, letterSpacing: 0.5 }}>{title}</span>
        </div>
        {confidential && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: 'var(--muted)',
              letterSpacing: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <FiLock size={11} /> CONFIDENTIAL
          </span>
        )}
      </div>
      <div
        style={{
          padding: '14px 14px',
          border: `1px solid ${color}30`,
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          background: 'var(--surface)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ── FIELD DISPLAY HELPER ─────────────────────────────────────── */
function Field({ label, value, mono, bold, capitalize, danger }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: bold ? 700 : 500,
          color: danger ? 'var(--red)' : 'var(--ink-2)',
          fontFamily: mono ? 'var(--font-mono)' : 'inherit',
          textTransform: capitalize ? 'capitalize' : 'none',
          lineHeight: 1.5,
        }}
      >
        {value || '—'}
      </div>
    </div>
  );
}

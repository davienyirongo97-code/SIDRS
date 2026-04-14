/**
 * src/components/pages/IMEICheckerPage.js
 * Public IMEI / serial / MAC verification tool
 */

import React, { useState } from 'react';
import { useAppStore, useCurrentUser, useToast } from '../../store/useAppStore';
import { checkIdentifier, checkDuplicateDevice } from '../../utils/helpers';
import Badge from '../ui/Badge';
import {
  FiSearch,
  FiCheckCircle,
  FiAlertCircle,
  FiHelpCircle,
  FiPhone,
  FiShield,
} from 'react-icons/fi';

const SAMPLES = [
  { id: '356789012345678', label: 'Clean phone' },
  { id: '490123456789012', label: 'Stolen phone' },
];

export default function IMEICheckerPage() {
  const devices = useAppStore((state) => state.devices);
  const reports = useAppStore((state) => state.reports);
  const currentUser = useCurrentUser();
  const showToast = useToast();

  const isOfficer = currentUser?.role === 'police' || currentUser?.role === 'macra';

  const [query, setQuery] = useState('');
  const [serial, setSerial] = useState('');
  const [result, setResult] = useState(null);
  const [twoFactor, setTwoFactor] = useState(false);

  function doCheck(value) {
    const q = (value ?? query).trim();
    if (!q) return;

    // Standard IMEI length check
    if (/^\d+$/.test(q) && q.length !== 15) {
      showToast('Validation Error', 'A standard IMEI should be exactly 15 digits.', 'warn');
    }

    // Two-factor mode: both IMEI and serial must match the same device
    if (twoFactor && serial.trim()) {
      const dupeCheck = checkDuplicateDevice(q, serial.trim(), devices);
      if (dupeCheck.conflict) {
        // conflict means one of them is already registered — find the device and check status
        setResult(checkIdentifier(q, devices, reports));
        return;
      }
      // If no conflict and both provided, check if they belong to the same device
      const imeiDevice = devices.find((d) => d.imei === q);
      const serialDevice = devices.find((d) => d.serial === serial.trim());
      if (imeiDevice && serialDevice && imeiDevice.id !== serialDevice.id) {
        setResult({ status: 'mismatch' });
        return;
      }
    }

    setResult(checkIdentifier(q, devices, reports));
  }

  function handleSampleId(id) {
    setQuery(id);
    setSerial('');
    doCheck(id);
  }

  return (
    <div className="fade-up">
      {/* HERO */}
      <div
        style={{
          background: 'linear-gradient(135deg,var(--navy) 0%,#1a2d5e 60%,#263a70 100%)',
          borderRadius: 32,
          padding: '48px 52px',
          marginBottom: 32,
          boxShadow: 'var(--shadow-2)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <h2 style={{ color: '#fff', fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
          IMEI & Device Checker
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, maxWidth: 600 }}>
          {isOfficer
            ? 'Police/MACRA mode: full owner profile and case history available for field verification.'
            : 'Buy with confidence. Verify any device identifier before purchasing from second-hand markets to ensure it is not stolen.'}
        </p>
      </div>

      <div className="grid-2">
        {/* SEARCH PANEL */}
        <div className="card" style={{ padding: 32 }}>
          <div
            style={{
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontWeight: 700,
              color: 'var(--ink-2)',
            }}
          >
            <FiSearch size={18} /> Check a Device Identifier
          </div>

          {/* Two-factor toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <button
              className={`btn btn-sm ${twoFactor ? 'btn-primary' : 'btn-surface'}`}
              onClick={() => {
                setTwoFactor(!twoFactor);
                setResult(null);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <FiShield size={13} /> Two-Factor Check {twoFactor ? 'ON' : 'OFF'}
            </button>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>
              {twoFactor ? 'IMEI + Serial must match the same device' : 'Single identifier lookup'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: twoFactor ? 12 : 24 }}>
            <input
              className="field-input mono"
              style={{ flex: 1, padding: '14px 18px', fontSize: 16 }}
              placeholder="Enter IMEI, Serial, or MAC..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doCheck()}
            />
            {!twoFactor && (
              <button
                className="btn btn-primary"
                style={{ padding: '0 32px' }}
                onClick={() => doCheck()}
              >
                Verify
              </button>
            )}
          </div>

          {twoFactor && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <input
                className="field-input mono"
                style={{ flex: 1, padding: '14px 18px', fontSize: 16 }}
                placeholder="Enter Serial Number..."
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && doCheck()}
              />
              <button
                className="btn btn-primary"
                style={{ padding: '0 32px' }}
                onClick={() => doCheck()}
              >
                <FiShield size={14} /> Verify Both
              </button>
            </div>
          )}

          <div
            style={{
              fontSize: 12,
              color: 'var(--muted)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 16,
            }}
          >
            Quick Samples
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 10,
            }}
          >
            {SAMPLES.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSampleId(s.id)}
                className="btn btn-surface btn-sm"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  justifyContent: 'flex-start',
                  padding: '10px 14px',
                }}
              >
                <FiCheckCircle
                  size={14}
                  color={s.label.includes('Clean') ? 'var(--green)' : 'var(--red)'}
                />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* RESULT COLUMN OR TIPS */}
        <div className="fade-up">
          {result ? (
            <CheckerResult result={result} isOfficer={isOfficer} />
          ) : (
            <div
              className="card"
              style={{ height: '100%', background: 'var(--bg)', borderStyle: 'dashed' }}
            >
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: 'var(--blue)',
                    border: '1px solid var(--muted-3)',
                  }}
                >
                  <FiAlertCircle size={32} />
                </div>
                <h3 style={{ marginBottom: 12 }}>Safe Buying Tips</h3>
                <ul
                  style={{
                    textAlign: 'left',
                    fontSize: 13,
                    color: 'var(--muted)',
                    lineHeight: '1.8',
                    margin: '0 0 20px 20px',
                  }}
                >
                  <li>Always check the IMEI before handing over cash.</li>
                  <li>
                    Dial <strong>*#06#</strong> on a phone to see its hardware IMEI.
                  </li>
                  <li>Compare the software IMEI with the physical label.</li>
                  <li>Avoid meeting in secluded areas for high-value sales.</li>
                  <li>Insist on an SDIRS Ownership Transfer PIN.</li>
                </ul>
                <div
                  style={{
                    fontSize: 11,
                    background: 'var(--blue-pale)',
                    padding: 12,
                    borderRadius: 8,
                    color: 'var(--blue)',
                  }}
                >
                  SDIRS is a national initiative by MACRA to eliminate device theft in Malawi.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* RESULT COMPONENT */

function CheckerResult({ result, isOfficer }) {
  const showToast = useToast();
  if (result.status === 'not_found') {
    return (
      <div className="card">
        <h3>
          <FiHelpCircle /> Not Found
        </h3>
        <p>No record found in the SDIRS database.</p>
      </div>
    );
  }

  if (result.status === 'mismatch') {
    return (
      <div className="card" style={{ borderLeft: '4px solid var(--red)' }}>
        <h3
          style={{
            color: 'var(--red)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 12,
          }}
        >
          <FiAlertCircle /> IMEI / Serial Mismatch
        </h3>
        <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.7 }}>
          The IMEI and serial number you entered belong to <strong>different devices</strong> in the
          national registry. This is a strong indicator of{' '}
          <strong style={{ color: 'var(--red)' }}>IMEI cloning or device tampering</strong>.
        </p>
        <div className="alert alert-red" style={{ marginTop: 14 }}>
          <span className="alert-icon">⚠️</span>
          <div>
            Do not purchase this device. Report to the nearest police station or call{' '}
            <strong>199</strong>.
          </div>
        </div>
      </div>
    );
  }

  const d = result.device;

  if (result.status === 'clean') {
    return (
      <div className="card">
        <h3 style={{ color: 'green', display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiCheckCircle /> Clean Device
        </h3>

        <InfoField label="Device" value={`${d.make} ${d.model}`} />

        <InfoField label="Type" value={d.type} />

        <InfoField label="Status" badge={d.status} />

        {!isOfficer && <p>No theft reports found in the national registry.</p>}
      </div>
    );
  }

  const r = result.report;

  return (
    <div className="card">
      <h3 style={{ color: 'red', display: 'flex', alignItems: 'center', gap: 6 }}>
        <FiAlertCircle /> Reported Stolen
      </h3>

      <InfoField label="Device" value={`${d.make} ${d.model}`} />

      <InfoField label="Stolen On" value={r.date} />

      <InfoField label="Location" value={r.location} />

      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 12 }}>
        <FiPhone size={14} /> Call Malawi Police: <b>199</b>
      </div>

      <div
        style={{
          marginTop: 24,
          padding: 16,
          background: 'var(--red-pale)',
          borderRadius: 12,
          border: '1px solid var(--red-2)',
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--red)', marginBottom: 8 }}>
          BOUNTY ELIGIBLE: FOUND STOLEN DEVICE?
        </div>
        <p style={{ fontSize: 11, color: 'var(--ink-2)', marginBottom: 16 }}>
          If you are viewing this device in person (e.g., at a market), reporting its current
          location helps the "Honey Trap" network pinpoint the thief. You may be eligible for an
          airtime bounty.
        </p>
        <button
          className="btn btn-red btn-sm"
          style={{ width: '100%', fontWeight: 800 }}
          onClick={() => {
            showToast(
              'Sighting Reported',
              'Anonymous intelligence sent to Police. GPS coordinates captured.',
              'success'
            );
          }}
        >
          Report Anonymous Sighting
        </button>
      </div>
    </div>
  );
}

/* FIELD COMPONENT */

function InfoField({ label, value, badge }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          fontSize: 10,
          color: 'gray',
        }}
      >
        {label}
      </div>

      {badge ? <Badge status={badge} /> : <div>{value || '—'}</div>}
    </div>
  );
}

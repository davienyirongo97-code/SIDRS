/**
 * src/components/pages/IMEICheckerPage.js
 */

import React, { useState } from 'react';
import { useAppState, useCurrentUser } from '../../context/AppContext';
import { checkIdentifier } from '../../utils/helpers';
import Badge from '../ui/Badge';

const SAMPLES = [
  { id: '356789012345678', label: '✅ Clean phone' },
  { id: '490123456789012', label: '🚨 Stolen phone' },
  { id: 'LNV-X1C-2024-7721', label: '✅ Clean laptop' },
  { id: 'DEL-INS-2024-5541', label: '✅ Recovered laptop' },
];

export default function IMEICheckerPage() {

  const { devices, reports } = useAppState();
  const currentUser = useCurrentUser();

  const isOfficer =
    currentUser?.role === 'police' || currentUser?.role === 'macra';

  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);

  function doCheck(value) {
    const q = (value ?? query).trim();
    if (!q) return;
    setResult(checkIdentifier(q, devices, reports));
  }

  /* FIXED FUNCTION NAME (not starting with use) */
  function applySampleId(id) {
    setQuery(id);
    doCheck(id);
  }

  return (
    <div className="fade-up">

      <div
        style={{
          background:
            'linear-gradient(135deg,var(--navy) 0%,var(--navy-3) 60%,#1A2870 100%)',
          borderRadius: 24,
          padding: '40px 48px',
          marginBottom: 28,
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 30,
            fontWeight: 800,
            color: '#fff',
          }}
        >
          IMEI & Device Checker
        </h2>

        <p style={{ color: 'rgba(255,255,255,0.7)' }}>
          Verify any device before purchasing from a second-hand market.
        </p>
      </div>

      <div className="grid-2">

        {/* SEARCH */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>

            <div
              style={{ display: 'flex', gap: 10, marginBottom: 14 }}
            >
              <input
                className="field-input mono"
                style={{ flex: 1 }}
                placeholder="IMEI, Serial Number, or MAC Address"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && doCheck()}
              />

              <button
                className="btn btn-primary"
                onClick={() => doCheck()}
              >
                Check Now
              </button>
            </div>

            {/* SAMPLE BUTTONS */}
            <div style={{ marginBottom: 16 }}>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {SAMPLES.map((s) => (
                  <button
                    key={s.id}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: '1px solid var(--muted-3)',
                      background: 'var(--bg-2)',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                    onClick={() => applySampleId(s.id)}
                  >
                    {s.id} {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {result && (
            <CheckerResult
              result={result}
              isOfficer={isOfficer}
              devices={devices}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* RESULT COMPONENT */

function CheckerResult({ result, isOfficer }) {

  if (result.status === 'not_found') {
    return (
      <div className="card">
        <h3>❓ Not Found in Registry</h3>
        <p>No record found for this identifier.</p>
      </div>
    );
  }

  const d = result.device;
  const owner = d?.ownerProfile;
  const ref = d?.referenceContact;

  if (result.status === 'clean') {
    return (
      <div className="card">

        <h3 style={{ color: 'green' }}>
          ✅ CLEAN DEVICE — Safe to Purchase
        </h3>

        <InfoField label="Device" value={`${d.make} ${d.model}`} />
        <InfoField label="Type" value={d.type} />
        <InfoField label="Colour" value={d.color} />

        {isOfficer && (
          <OwnerProfile owner={owner} ref_={ref} device={d} />
        )}
      </div>
    );
  }

  const r = result.report;

  return (
    <div className="card">

      <h3 style={{ color: 'red' }}>
        ⚠️ REPORTED STOLEN
      </h3>

      <InfoField label="Device" value={`${d.make} ${d.model}`} />
      <InfoField label="Stolen On" value={r.date} />
      <InfoField label="Location" value={r.location} />

      {isOfficer && (
        <OwnerProfile owner={owner} ref_={ref} device={d} stolen />
      )}
    </div>
  );
}

/* OWNER PROFILE */

function OwnerProfile({ owner, ref_, device }) {

  if (!owner) {
    return (
      <div>
        ⚠️ No owner profile available
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20 }}>

      <h4>Owner Profile</h4>

      <InfoField label="Full Name" value={owner.fullName} />
      <InfoField label="Phone" value={owner.phone} />
      <InfoField label="District" value={owner.district} />

      {ref_ && (
        <>
          <h4>Emergency Contact</h4>

          <InfoField label="Name" value={ref_.name} />
          <InfoField label="Phone" value={ref_.phone} />
        </>
      )}
    </div>
  );
}

/* FIELD COMPONENT */

function InfoField({ label, value, badge }) {

  return (
    <div style={{ marginBottom: 10 }}>

      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'gray',
        }}
      >
        {label}
      </div>

      {badge ? (
        <Badge status={badge} />
      ) : (
        <div style={{ fontSize: 13 }}>
          {value || '—'}
        </div>
      )}
    </div>
  );
}
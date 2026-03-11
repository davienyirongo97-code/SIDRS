/**
 * src/components/pages/IMEICheckerPage.js
 * Public IMEI / serial / MAC verification tool
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
    currentUser?.role === 'police' ||
    currentUser?.role === 'macra';

  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);

  function doCheck(value) {
    const q = (value ?? query).trim();
    if (!q) return;
    setResult(checkIdentifier(q, devices, reports));
  }

  /* FIXED: renamed from useSampleId */
  function handleSampleId(id) {
    setQuery(id);
    doCheck(id);
  }

  return (
    <div className="fade-up">

      {/* HERO */}
      <div
        style={{
          background:
            'linear-gradient(135deg,var(--navy) 0%,var(--navy-3) 60%,#1A2870 100%)',
          borderRadius: 24,
          padding: '40px 48px',
          marginBottom: 28,
        }}
      >
        <h2 style={{ color: '#fff' }}>IMEI & Device Checker</h2>

        <p style={{ color: 'rgba(255,255,255,0.65)' }}>
          {isOfficer
            ? 'Police/MACRA mode: full owner profile available'
            : 'Verify any device before purchasing from a second-hand market'}
        </p>
      </div>

      <div className="grid-2">

        {/* SEARCH PANEL */}
        <div>

          <div className="card">

            <div style={{ marginBottom: 10 }}>
              🔍 Check a Device Identifier
            </div>

            <div style={{ display: 'flex', gap: 10 }}>

              <input
                className="field-input mono"
                style={{ flex: 1 }}
                placeholder="IMEI / Serial / MAC"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && doCheck()
                }
              />

              <button
                className="btn btn-primary"
                onClick={() => doCheck()}
              >
                Check
              </button>

            </div>

            {/* SAMPLE BUTTONS */}
            <div style={{ marginTop: 14 }}>

              {SAMPLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSampleId(s.id)}
                  style={{
                    marginRight: 6,
                    marginTop: 6,
                    padding: '4px 10px',
                    fontSize: 11,
                  }}
                >
                  {s.id} {s.label}
                </button>
              ))}

            </div>

          </div>

          {result && (
            <CheckerResult
              result={result}
              isOfficer={isOfficer}
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
        <h3>❓ Not Found</h3>
        <p>
          No record found in the SDIRS database.
        </p>
      </div>
    );
  }

  const d = result.device;

  if (result.status === 'clean') {
    return (
      <div className="card">
        <h3 style={{ color: 'green' }}>
          ✅ Clean Device
        </h3>

        <InfoField
          label="Device"
          value={`${d.make} ${d.model}`}
        />

        <InfoField
          label="Type"
          value={d.type}
        />

        <InfoField
          label="Status"
          badge={d.status}
        />

        {!isOfficer && (
          <p>
            No theft reports found in the
            national registry.
          </p>
        )}
      </div>
    );
  }

  const r = result.report;

  return (
    <div className="card">
      <h3 style={{ color: 'red' }}>
        🚨 Reported Stolen
      </h3>

      <InfoField
        label="Device"
        value={`${d.make} ${d.model}`}
      />

      <InfoField
        label="Stolen On"
        value={r.date}
      />

      <InfoField
        label="Location"
        value={r.location}
      />

      <div style={{ marginTop: 10 }}>
        🚔 Call Malawi Police: <b>199</b>
      </div>
    </div>
  );
}

/* FIELD COMPONENT */

function InfoField({
  label,
  value,
  badge,
}) {

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

      {badge ? (
        <Badge status={badge} />
      ) : (
        <div>{value || '—'}</div>
      )}

    </div>
  );
}
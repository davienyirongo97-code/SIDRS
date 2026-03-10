/**
 * src/components/pages/IMEICheckerPage.js
 * ─────────────────────────────────────────────
 * Public IMEI / serial / MAC verification tool.
 * Anyone can enter a device identifier to check if it's stolen.
 *
 * Features:
 *   - Text input with sample identifiers to try
 *   - Returns: Clean ✅ / Stolen 🚨 / Not Found ❓
 *   - USSD code display (*858*IMEI#)
 *   - Trader guide panel
 */

import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { checkIdentifier } from '../../utils/helpers';
import Badge from '../ui/Badge';

// Quick-try sample identifiers with descriptions
const SAMPLES = [
  { id: '356789012345678', label: '✅ Clean phone' },
  { id: '490123456789012', label: '🚨 Stolen phone' },
  { id: 'LNV-X1C-2024-7721', label: '✅ Clean laptop' },
  { id: 'DEL-INS-2024-5541', label: '✅ Recovered laptop' },
];

export default function IMEICheckerPage() {
  const { devices, reports } = useAppState();
  const [query,  setQuery]   = useState('');
  const [result, setResult]  = useState(null);   // { status, device?, report? }

  function doCheck(value) {
    const q = value ?? query;
    if (!q.trim()) return;
    setResult(checkIdentifier(q.trim(), devices, reports));
  }

  function handleSample(id) {
    setQuery(id);
    setResult(checkIdentifier(id, devices, reports));
  }

  return (
    <div className="fade-up">

      {/* ── HERO ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-3) 60%, #1A2870 100%)',
        borderRadius: 24, padding: '40px 48px', marginBottom: 28, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at 80% 50%,rgba(26,92,219,.25) 0%,transparent 65%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Free Public Verification Tool</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: '#fff', margin: '0 0 10px' }}>IMEI &amp; Device Checker</h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, margin: 0 }}>Verify any device before purchasing from a second-hand market. Instant results.</p>
        </div>
      </div>

      <div className="grid-2">

        {/* ── LEFT: Search + Result ── */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 16 }}>🔍 Check a Device Identifier</div>

            {/* Search bar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <input
                className="field-input mono"
                style={{ flex: 1 }}
                placeholder="IMEI, Serial Number, or MAC Address"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doCheck()}
              />
              <button className="btn btn-primary" onClick={() => doCheck()}>
                Check Now
              </button>
            </div>

            {/* Sample identifiers */}
            <div style={{ marginBottom: 16 }}>
              <div className="field-label" style={{ marginBottom: 8 }}>Try a sample:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {SAMPLES.map(s => (
                  <button
                    key={s.id}
                    style={{
                      padding: '4px 10px', borderRadius: 6, border: '1px solid var(--muted-3)',
                      background: 'var(--bg-2)', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                      color: 'var(--muted)', fontFamily: 'var(--font-mono)', transition: 'all .15s',
                    }}
                    onClick={() => handleSample(s.id)}
                    onMouseOver={e => { e.currentTarget.style.background='var(--blue)'; e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='var(--blue)'; }}
                    onMouseOut={e =>  { e.currentTarget.style.background='var(--bg-2)'; e.currentTarget.style.color='var(--muted)'; e.currentTarget.style.borderColor='var(--muted-3)'; }}
                  >
                    {s.id} <span style={{ fontFamily: 'var(--font-body)' }}>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="alert alert-amber">
              <span className="alert-icon">💡</span>
              <div>Dial <strong>*#06#</strong> on any phone to reveal its IMEI. For laptops, check Settings → About.</div>
            </div>
          </div>

          {/* ── RESULT PANEL ── */}
          {result && <CheckerResult result={result} />}
        </div>

        {/* ── RIGHT: USSD + Info ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* USSD panel */}
          <div className="ussd-box">
            <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
              USSD — No Internet Needed
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>Dial from any phone:</div>
            <span className="ussd-code">*858*IMEI#</span>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>
              Receive result via SMS within 5 seconds. Free. Works on all networks.
            </div>
          </div>

          {/* Trader guide */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>🏪 For Market Traders</div>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, margin: '0 0 14px' }}>
              Registered dealers can use the bulk verification API to screen multiple devices before stock purchase.
            </p>
            {[
              'Verify before accepting devices',
              'Build customer trust & credibility',
              'Protect your business from liability',
              'Free public tool — no registration needed',
            ].map(text => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-2)', marginBottom: 6 }}>
                <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span>{text}
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="card" style={{ background: 'var(--navy)', borderColor: 'transparent' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>How It Works</div>
            <div className="timeline">
              {[
                ['🔢', 'Enter IMEI, serial, or MAC into the checker'],
                ['📡', 'SDIRS queries the national stolen device registry'],
                ['📊', 'Result returned: Clean ✅ or Stolen 🚨'],
                ['📱', 'If stolen — contact police on 199 immediately'],
              ].map(([icon, text], i, arr) => (
                <div className="timeline-item" key={text}>
                  {i < arr.length - 1 && <div className="timeline-line" />}
                  <div className="timeline-dot" style={{ background: 'rgba(255,255,255,0.1)' }}>{icon}</div>
                  <div className="timeline-content">
                    <div className="timeline-title" style={{ color: '#fff' }}>{text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── RESULT SUB-COMPONENT ──────────────────────────────────────
function CheckerResult({ result }) {
  if (result.status === 'not_found') {
    return (
      <div className="card" style={{ borderColor: 'var(--muted-2)' }}>
        <div style={{ padding: '14px 18px', background: 'var(--bg-2)', borderRadius: 10, marginBottom: 14 }}>
          <div style={{ fontWeight: 900, fontSize: 17, color: 'var(--muted)' }}>❓ Not Found in Registry</div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
          No record found for this identifier. The device may be legitimate but not yet registered in SDIRS.
          Ask the seller for proof of purchase.
        </p>
      </div>
    );
  }

  if (result.status === 'clean') {
    const d = result.device;
    return (
      <div className="card fade-up" style={{ borderColor: 'var(--green-2)', borderWidth: 2 }}>
        <div style={{ padding: '14px 18px', background: 'var(--green-pale)', borderRadius: 10, marginBottom: 16 }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--green)' }}>✅ CLEAN DEVICE — Safe to Purchase</div>
        </div>
        <div className="grid-2" style={{ marginBottom: 16 }}>
          {[['Device', `${d.make} ${d.model}`], ['Type', d.type], ['Colour', d.color], ['Status', null]].map(([k, v]) => (
            <div key={k}>
              <div className="field-label">{k}</div>
              {k === 'Status' ? <Badge status={d.status} /> : <div style={{ fontWeight: 700, marginTop: 3 }}>{v}</div>}
            </div>
          ))}
        </div>
        <div className="alert alert-green">
          <span className="alert-icon">✓</span>
          No theft reports found in the national registry for this device.
          Checked {new Date().toLocaleDateString('en-MW')}.
        </div>
      </div>
    );
  }

  // stolen
  const d = result.device;
  const r = result.report;
  return (
    <div className="card fade-up" style={{ borderColor: 'var(--red-2)', borderWidth: 2 }}>
      <div style={{ padding: '14px 18px', background: 'var(--red-pale)', borderRadius: 10, marginBottom: 16 }}>
        <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--red)' }}>⚠️ REPORTED STOLEN</div>
        <div style={{ fontSize: 13, color: 'var(--red)', marginTop: 4 }}>DO NOT purchase this device</div>
      </div>
      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div><div className="field-label">Device</div><div style={{ fontWeight: 700, marginTop: 3 }}>{d.make} {d.model}</div></div>
        <div><div className="field-label">Stolen On</div><div style={{ fontWeight: 700, marginTop: 3, color: 'var(--red)' }}>{r.date}</div></div>
        <div style={{ gridColumn: '1 / -1' }}><div className="field-label">Location of Theft</div><div style={{ fontWeight: 700, marginTop: 3 }}>{r.location}</div></div>
      </div>
      <div style={{ background: 'var(--red)', borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
        <div style={{ fontWeight: 900, fontSize: 14, color: '#fff', marginBottom: 4 }}>🚔 Call Malawi Police: 199</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
          Report reference: <span style={{ fontFamily: 'var(--font-mono)' }}>{r.id}</span>
        </div>
        {r.caseNumber && (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
            Case number: <span style={{ fontFamily: 'var(--font-mono)' }}>{r.caseNumber}</span>
          </div>
        )}
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
        If you believe you have already purchased this device, contact the police with your receipt.
        Possessing a known stolen device is a criminal offence.
      </div>
    </div>
  );
}

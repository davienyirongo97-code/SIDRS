/**
 * src/components/pages/IMEICheckerPage.js
 * ─────────────────────────────────────────────
 * Public IMEI / serial / MAC verification tool.
 *
 * TWO MODES based on who is checking:
 *
 *   PUBLIC / CITIZEN:
 *     Returns only clean ✅ or stolen 🚨 status.
 *     No personal owner info is ever shown publicly.
 *
 *   POLICE / MACRA (role-based):
 *     Returns the full owner profile — name, NRC number,
 *     phone, address, district, and the emergency reference
 *     contact — so police can reunite a found device with
 *     its owner even if the report hasn't been filed yet.
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

  // Police and MACRA get to see owner profile details
  const isOfficer = currentUser?.role === 'police' || currentUser?.role === 'macra';

  const [query,  setQuery]  = useState('');
  const [result, setResult] = useState(null);

  function doCheck(value) {
    const q = (value ?? query).trim();
    if (!q) return;
    setResult(checkIdentifier(q, devices, reports));
  }

  function useSampleId(id) {
    setQuery(id);
    doCheck(id);
  }

  return (
    <div className="fade-up">

      {/* ── Hero banner ── */}
      <div style={{
        background:'linear-gradient(135deg,var(--navy) 0%,var(--navy-3) 60%,#1A2870 100%)',
        borderRadius:24, padding:'40px 48px', marginBottom:28,
        position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at 80% 50%,rgba(26,92,219,.25) 0%,transparent 65%)' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.4)', letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>
            {isOfficer ? '🔐 Police / MACRA Access — Full Owner Profile Mode' : 'Free Public Verification Tool'}
          </div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:30, fontWeight:800, color:'#fff', margin:'0 0 10px' }}>
            IMEI &amp; Device Checker
          </h2>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:15, margin:0 }}>
            {isOfficer
              ? 'Enter any IMEI, serial, or MAC address to retrieve full device ownership and owner contact details.'
              : 'Verify any device before purchasing from a second-hand market. Instant results.'}
          </p>
        </div>
      </div>

      <div className="grid-2">

        {/* ── LEFT: Search + Result ── */}
        <div>
          <div className="card" style={{ marginBottom:20 }}>
            <div className="card-title" style={{ marginBottom:16 }}>🔍 Check a Device Identifier</div>

            <div style={{ display:'flex', gap:10, marginBottom:14 }}>
              <input
                className="field-input mono"
                style={{ flex:1 }}
                placeholder="IMEI, Serial Number, or MAC Address"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doCheck()}
              />
              <button className="btn btn-primary" onClick={() => doCheck()}>Check Now</button>
            </div>

            {/* Sample quick-try buttons */}
            <div style={{ marginBottom:16 }}>
              <div className="field-label" style={{ marginBottom:8 }}>Try a sample:</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {SAMPLES.map(s => (
                  <button
                    key={s.id}
                    style={{
                      padding:'4px 10px', borderRadius:6, border:'1px solid var(--muted-3)',
                      background:'var(--bg-2)', cursor:'pointer', fontSize:11, fontWeight:700,
                      color:'var(--muted)', fontFamily:'var(--font-mono)', transition:'all .15s',
                    }}
                    onClick={() => useSampleId(s.id)}
                    onMouseOver={e => { e.currentTarget.style.background='var(--blue)'; e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='var(--blue)'; }}
                    onMouseOut={e =>  { e.currentTarget.style.background='var(--bg-2)'; e.currentTarget.style.color='var(--muted)'; e.currentTarget.style.borderColor='var(--muted-3)'; }}
                  >
                    {s.id} <span style={{ fontFamily:'var(--font-body)' }}>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="alert alert-amber">
              <span className="alert-icon">💡</span>
              <div>Dial <strong>*#06#</strong> on any phone to reveal its IMEI. For laptops, check Settings → About.</div>
            </div>
          </div>

          {/* Result panel */}
          {result && (
            <CheckerResult result={result} isOfficer={isOfficer} devices={devices} users={[]} />
          )}
        </div>

        {/* ── RIGHT: USSD + info panels ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          <div className="ussd-box">
            <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.4)', letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>USSD — No Internet Needed</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:14, color:'rgba(255,255,255,0.6)', marginBottom:2 }}>Dial from any phone:</div>
            <span className="ussd-code">*858*IMEI#</span>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', marginTop:6 }}>
              Receive result via SMS within 5 seconds. Free. Works on Airtel &amp; TNM.
            </div>
          </div>

          {/* Access level info */}
          <div className="card">
            <div className="card-title" style={{ marginBottom:12 }}>🔐 Access Levels</div>
            {[
              { icon:'👤', role:'Public / Any User',   color:'var(--muted)',  info:'Device status only: Clean ✅ or Stolen 🚨. No personal info shown.' },
              { icon:'🏪', role:'Market Traders',       color:'var(--green)',  info:'Same as public. Verify before buying. Use bulk API for stock screening.' },
              { icon:'👮', role:'Police Officers',      color:'var(--blue)',   info:'Full owner profile: name, NRC, phone, address, emergency contact.' },
              { icon:'🏛️', role:'MACRA Administrators', color:'var(--amber)',  info:'Full profile + transfer history + network detection events.' },
            ].map(a => (
              <div key={a.role} style={{ display:'flex', gap:12, marginBottom:12, alignItems:'flex-start' }}>
                <span style={{ fontSize:18, flexShrink:0 }}>{a.icon}</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:12, color:a.color }}>{a.role}</div>
                  <div style={{ fontSize:11, color:'var(--muted)', lineHeight:1.5, marginTop:2 }}>{a.info}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ background:'var(--navy)', borderColor:'transparent' }}>
            <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.35)', letterSpacing:2, textTransform:'uppercase', marginBottom:14 }}>How It Works</div>
            <div className="timeline">
              {[
                ['🔢','Enter IMEI, serial, or MAC into the checker'],
                ['📡','SDIRS queries the national stolen device registry'],
                ['📊','Result: Clean ✅, Stolen 🚨, or Full Profile 👮'],
                ['📱','If stolen — contact police on 199 immediately'],
              ].map(([icon, text], i, arr) => (
                <div className="timeline-item" key={text}>
                  {i < arr.length - 1 && <div className="timeline-line" />}
                  <div className="timeline-dot" style={{ background:'rgba(255,255,255,0.1)' }}>{icon}</div>
                  <div className="timeline-content">
                    <div className="timeline-title" style={{ color:'#fff' }}>{text}</div>
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

/* ── RESULT COMPONENT ────────────────────────────────────────── */
function CheckerResult({ result, isOfficer }) {

  /* NOT FOUND */
  if (result.status === 'not_found') {
    return (
      <div className="card" style={{ borderColor:'var(--muted-2)' }}>
        <div style={{ padding:'14px 18px', background:'var(--bg-2)', borderRadius:10, marginBottom:14 }}>
          <div style={{ fontWeight:900, fontSize:17, color:'var(--muted)' }}>❓ Not Found in Registry</div>
        </div>
        <p style={{ fontSize:13, color:'var(--muted)', lineHeight:1.7 }}>
          No record found for this identifier. The device may be legitimate but not yet registered in SDIRS.
          Ask the seller for proof of purchase and encourage them to register their device.
        </p>
      </div>
    );
  }

  const d = result.device;
  const owner = d?.ownerProfile;
  const ref   = d?.referenceContact;

  /* CLEAN DEVICE */
  if (result.status === 'clean') {
    return (
      <div className="card fade-up" style={{ borderColor:'var(--green-2)', borderWidth:2 }}>
        <div style={{ padding:'14px 18px', background:'var(--green-pale)', borderRadius:10, marginBottom:16 }}>
          <div style={{ fontWeight:900, fontSize:18, color:'var(--green)' }}>✅ CLEAN DEVICE — Safe to Purchase</div>
        </div>

        {/* Device info — always visible */}
        <div className="grid-2" style={{ marginBottom:16 }}>
          <InfoField label="Device"  value={`${d.make} ${d.model}`} />
          <InfoField label="Type"    value={d.type} capitalize />
          <InfoField label="Colour"  value={d.color} />
          <InfoField label="Status"  value={null} badge={d.status} />
        </div>

        {/* Public result */}
        {!isOfficer && (
          <div className="alert alert-green">
            <span className="alert-icon">✓</span>
            No theft reports found in the national registry for this device. Checked {new Date().toLocaleDateString('en-MW')}.
          </div>
        )}

        {/* Police / MACRA — full owner profile */}
        {isOfficer && (
          <OwnerProfile owner={owner} ref_={ref} device={d} />
        )}
      </div>
    );
  }

  /* STOLEN DEVICE */
  const r = result.report;
  return (
    <div className="card fade-up" style={{ borderColor:'var(--red-2)', borderWidth:2 }}>
      <div style={{ padding:'14px 18px', background:'var(--red-pale)', borderRadius:10, marginBottom:16 }}>
        <div style={{ fontWeight:900, fontSize:18, color:'var(--red)' }}>⚠️ REPORTED STOLEN</div>
        <div style={{ fontSize:13, color:'var(--red)', marginTop:4 }}>DO NOT purchase this device</div>
      </div>

      <div className="grid-2" style={{ marginBottom:16 }}>
        <InfoField label="Device"     value={`${d.make} ${d.model}`} />
        <InfoField label="Stolen On"  value={r.date} danger />
        <div style={{ gridColumn:'1 / -1' }}>
          <InfoField label="Location of Theft" value={r.location} />
        </div>
      </div>

      {/* Police contact box */}
      <div style={{ background:'var(--red)', borderRadius:10, padding:'14px 16px', marginBottom:12 }}>
        <div style={{ fontWeight:900, fontSize:14, color:'#fff', marginBottom:4 }}>🚔 Call Malawi Police: 199</div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.8)' }}>
          Report ref: <span style={{ fontFamily:'var(--font-mono)' }}>{r.id}</span>
        </div>
        {r.caseNumber && (
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.8)' }}>
            Case: <span style={{ fontFamily:'var(--font-mono)' }}>{r.caseNumber}</span>
          </div>
        )}
      </div>

      {/* Police / MACRA — full owner profile */}
      {isOfficer && (
        <OwnerProfile owner={owner} ref_={ref} device={d} stolen />
      )}

      {!isOfficer && (
        <div style={{ fontSize:12, color:'var(--muted)' }}>
          If you believe you have already purchased this device, contact the police with your receipt.
          Possessing a known stolen device is a criminal offence.
        </div>
      )}
    </div>
  );
}

/* ── OWNER PROFILE PANEL (police / MACRA only) ────────────────── */
function OwnerProfile({ owner, ref_, device, stolen }) {
  if (!owner) {
    return (
      <div className="alert alert-amber" style={{ marginTop:12 }}>
        <span className="alert-icon">⚠️</span>
        <div>No owner profile on file. Device registered before owner profile fields were added, or registered via legacy system.</div>
      </div>
    );
  }

  return (
    <div style={{ marginTop:16 }}>
      {/* Confidential banner */}
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 12px', background:'var(--navy)', borderRadius:8, marginBottom:14 }}>
        <span>🔐</span>
        <span style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.7)', letterSpacing:1, textTransform:'uppercase' }}>
          Confidential — Police / MACRA Access Only
        </span>
      </div>

      {/* Owner personal details */}
      <div style={{ background:'var(--bg)', borderRadius:'var(--radius-2)', padding:16, marginBottom:12 }}>
        <div style={{ fontSize:11, fontWeight:800, color:'var(--blue)', letterSpacing:1, textTransform:'uppercase', marginBottom:12 }}>
          👤 Registered Owner
        </div>
        <div className="grid-2" style={{ gap:12 }}>
          <InfoField label="Full Name"    value={owner.fullName} bold />
          <InfoField label="ID / NRC"     value={`${owner.idType?.toUpperCase()} · ${owner.idNumber}`} mono />
          <InfoField label="Phone"        value={owner.phone} bold highlight="var(--blue)" />
          <InfoField label="Email"        value={owner.email || '—'} />
          <InfoField label="District"     value={owner.district} />
          <InfoField label="Village/Area" value={owner.villageArea || '—'} />
          <div style={{ gridColumn:'1 / -1' }}>
            <InfoField label="Physical Address" value={owner.residence} />
          </div>
        </div>
      </div>

      {/* Reference / emergency contact */}
      {ref_ && ref_.name && (
        <div style={{ background:stolen ? 'var(--red-pale)' : 'var(--amber-pale)', border:`1px solid ${stolen ? '#F5A0A0' : '#F5C35A'}`, borderRadius:'var(--radius-2)', padding:16, marginBottom:12 }}>
          <div style={{ fontSize:11, fontWeight:800, color: stolen ? 'var(--red)' : 'var(--amber)', letterSpacing:1, textTransform:'uppercase', marginBottom:12 }}>
            🆘 Emergency Reference Contact
          </div>
          <div className="grid-2" style={{ gap:12 }}>
            <InfoField label="Name"         value={ref_.name} bold />
            <InfoField label="Relationship" value={ref_.relationship || '—'} />
            <InfoField label="Phone"        value={ref_.phone} bold highlight={stolen ? 'var(--red)' : 'var(--amber)'} />
            <InfoField label="Email"        value={ref_.email || '—'} />
          </div>
          {stolen && (
            <div style={{ fontSize:12, color:'var(--red)', fontWeight:700, marginTop:10 }}>
              ↑ Call this number if the owner's phone is unreachable
            </div>
          )}
        </div>
      )}

      {/* Device purchase info */}
      {(device?.purchaseDate || device?.purchasePlace || device?.estimatedValueMWK) && (
        <div style={{ background:'var(--bg)', borderRadius:'var(--radius-2)', padding:16 }}>
          <div style={{ fontSize:11, fontWeight:800, color:'var(--muted)', letterSpacing:1, textTransform:'uppercase', marginBottom:12 }}>
            🛒 Purchase Details
          </div>
          <div className="grid-2" style={{ gap:12 }}>
            {device.purchaseDate      && <InfoField label="Purchased On"    value={device.purchaseDate} />}
            {device.purchasePlace     && <InfoField label="Purchased From"  value={device.purchasePlace} />}
            {device.estimatedValueMWK && <InfoField label="Estimated Value" value={`MWK ${Number(device.estimatedValueMWK).toLocaleString()}`} />}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── SMALL HELPER: labelled field display ─────────────────────── */
function InfoField({ label, value, badge, mono, bold, capitalize, danger, highlight }) {
  return (
    <div>
      <div style={{ fontSize:10, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:.5, marginBottom:3 }}>{label}</div>
      {badge
        ? <Badge status={badge} />
        : <div style={{
            fontWeight: bold ? 700 : 500,
            fontSize: 13,
            color: danger ? 'var(--red)' : highlight || 'var(--ink-2)',
            fontFamily: mono ? 'var(--font-mono)' : 'inherit',
            textTransform: capitalize ? 'capitalize' : 'none',
            marginTop: 2,
          }}>
            {value || '—'}
          </div>
      }
    </div>
  );
}
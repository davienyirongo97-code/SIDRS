/**
 * src/components/ui/DeviceLookup.js
 * ─────────────────────────────────────────────
 * Reusable device lookup / search panel for Police and MACRA pages.
 *
 * Accepts any IMEI, serial number, or MAC address and returns:
 *   - Full device details
 *   - Complete registered owner profile (name, NRC, phone, address)
 *   - Emergency reference contact
 *   - Purchase details
 *   - Active theft report (if any)
 *   - Network detection events (if any)
 *   - Transfer history (if any)
 *
 * This is the "find owner by IMEI" tool that police use when they
 * recover a device — even one that hasn't been reported stolen yet.
 */

import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { checkIdentifier, deviceIcon, formatNumber } from '../../utils/helpers';
import Badge from './Badge';

export default function DeviceLookup() {
  const { devices, reports, events, transfers, users } = useAppState();
  const [query,  setQuery]  = useState('');
  const [result, setResult] = useState(null);  // null | { status, device, report }

  function handleSearch() {
    const q = query.trim();
    if (!q) return;
    setResult(checkIdentifier(q, devices, reports));
  }

  function handleClear() {
    setQuery('');
    setResult(null);
  }

  return (
    <div className="card" style={{ marginBottom: 24 }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 16, paddingBottom: 14,
        borderBottom: '1px solid var(--muted-3)',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'linear-gradient(135deg, var(--blue), var(--navy-3))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>
          🔍
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>
            Device Owner Lookup
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Enter any IMEI, serial number, or MAC address to retrieve full owner profile
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', background: 'rgba(26,92,219,0.1)',
            borderRadius: 20, border: '1px solid rgba(26,92,219,0.2)',
          }}>
            <span style={{ fontSize: 10 }}>🔐</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--blue)', letterSpacing: 0.5 }}>
              RESTRICTED ACCESS
            </span>
          </div>
        </div>
      </div>

      {/* ── Search bar ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: result ? 20 : 0 }}>
        <input
          className="field-input mono"
          style={{ flex: 1, fontSize: 14 }}
          placeholder="Enter IMEI · Serial Number · MAC Address (e.g. 356789012345678)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          🔍 Search
        </button>
        {result && (
          <button className="btn btn-surface" onClick={handleClear}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* ── Results ── */}
      {result && (
        <LookupResult
          result={result}
          events={events}
          transfers={transfers}
          users={users}
        />
      )}
    </div>
  );
}

/* ── LOOKUP RESULT COMPONENT ─────────────────────────────────── */
function LookupResult({ result, events, transfers, users }) {

  /* NOT FOUND */
  if (result.status === 'not_found') {
    return (
      <div style={{
        padding: '20px 24px',
        background: 'var(--bg-2)',
        borderRadius: 'var(--radius-2)',
        border: '1px solid var(--muted-3)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>❓</div>
        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--muted)', marginBottom: 6 }}>
          No Device Found in Registry
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted-2)', lineHeight: 1.6 }}>
          This IMEI / serial / MAC is not registered in SDIRS.<br />
          The device may be unregistered or the identifier may be incorrect.<br />
          Advise the device holder to register at the nearest MACRA office or via the SDIRS app.
        </div>
      </div>
    );
  }

  const d       = result.device;
  const r       = result.report;
  const owner   = d?.ownerProfile;
  const ref_    = d?.referenceContact;
  const isStolen = result.status === 'stolen';

  // Network events for this device
  const devEvents = r
    ? events.filter(e => e.reportId === r.id)
    : [];

  // Transfer history for this device
  const devTransfers = transfers.filter(t => t.deviceId === d.id);

  return (
    <div style={{ animation: 'fadeUp .3s ease both' }}>

      {/* ── STATUS BANNER ── */}
      <div style={{
        padding: '14px 18px',
        borderRadius: 'var(--radius-2)',
        background: isStolen ? 'var(--red-pale)' : 'var(--green-pale)',
        border: `2px solid ${isStolen ? 'var(--red-2)' : 'var(--green-2)'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <div>
          <div style={{
            fontWeight: 900, fontSize: 17,
            color: isStolen ? 'var(--red)' : 'var(--green)',
          }}>
            {isStolen ? '🚨 STOLEN DEVICE — Active Theft Report' : '✅ REGISTERED DEVICE — No Theft Reports'}
          </div>
          <div style={{ fontSize: 12, color: isStolen ? 'var(--red)' : 'var(--green)', marginTop: 3 }}>
            {isStolen
              ? `Reported stolen on ${r.date} · ${r.policeStation}`
              : `Registered on ${d.registeredDate} — Owner profile below`}
          </div>
        </div>
        <Badge status={d.status} />
      </div>

      {/* ── DEVICE DETAILS ── */}
      <Section icon="📱" title="Device Details" color="var(--blue)">
        <div className="grid-2" style={{ gap: 12 }}>
          <Field label="Make & Model"   value={`${d.make} ${d.model}`}   bold />
          <Field label="Type"           value={d.type}                   capitalize />
          <Field label="Colour"         value={d.color || '—'} />
          <Field label="IMEI (SIM 1)"   value={d.imei   || '—'}          mono />
          <Field label="IMEI (SIM 2)"   value={d.imei2  || '—'}          mono />
          <Field label="Serial Number"  value={d.serial || '—'}          mono />
          <Field label="MAC Address"    value={d.mac    || '—'}          mono />
          <Field label="Registered On"  value={d.registeredDate} />
          {d.purchaseDate  && <Field label="Purchased On"   value={d.purchaseDate} />}
          {d.purchasePlace && <Field label="Purchased From" value={d.purchasePlace} />}
          {d.estimatedValueMWK && (
            <Field label="Est. Value" value={`MWK ${formatNumber(d.estimatedValueMWK)}`} />
          )}
        </div>
      </Section>

      {/* ── OWNER PROFILE ── */}
      <Section icon="👤" title="Registered Owner" color="var(--blue)" confidential>
        {owner ? (
          <div>
            {/* Name + ID — most prominent */}
            <div style={{
              padding: '14px 16px',
              background: 'linear-gradient(135deg, var(--navy), var(--navy-2))',
              borderRadius: 10,
              marginBottom: 14,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#fff' }}>
                  {owner.fullName}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>
                  {owner.idType?.toUpperCase()} · {owner.idNumber}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>District</div>
                <div style={{ fontWeight: 800, color: 'var(--amber-2)' }}>{owner.district}</div>
              </div>
            </div>

            <div className="grid-2" style={{ gap: 12, marginBottom: 14 }}>
              {/* Phone — most important for police */}
              <div style={{
                padding: '12px 14px',
                background: 'var(--green-pale)',
                borderRadius: 10,
                border: '1px solid var(--green-2)',
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  📞 Primary Phone (Call First)
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>
                  {owner.phone}
                </div>
              </div>
              <div style={{ padding: '12px 14px', background: 'var(--bg)', borderRadius: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  📧 Email
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>
                  {owner.email || '—'}
                </div>
              </div>
            </div>

            <Field
              label="Village / Area"
              value={owner.villageArea || '—'}
            />
            <div style={{ marginTop: 10 }}>
              <Field
                label="Full Physical Address"
                value={owner.residence}
                bold
              />
            </div>
          </div>
        ) : (
          <div className="alert alert-amber">
            <span className="alert-icon">⚠️</span>
            <div>No owner profile on file. Device registered before profile fields were introduced.</div>
          </div>
        )}
      </Section>

      {/* ── EMERGENCY REFERENCE CONTACT ── */}
      {ref_ && ref_.name && (
        <Section icon="🆘" title="Emergency Reference Contact" color="var(--red)" confidential>
          <div style={{
            padding: '14px 16px',
            background: 'var(--red-pale)',
            borderRadius: 10,
            border: '1px solid rgba(192,37,44,0.3)',
            marginBottom: 12,
          }}>
            <div style={{ fontSize: 11, color: 'var(--red)', marginBottom: 8, fontWeight: 700 }}>
              ↓ Call if owner's primary number is unreachable
            </div>
            <div className="grid-2" style={{ gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Name</div>
                <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--ink)' }}>{ref_.name}</div>
                {ref_.relationship && (
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{ref_.relationship} of owner</div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>📞 Reference Phone</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>{ref_.phone}</div>
              </div>
              {ref_.email && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Email</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{ref_.email}</div>
                </div>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* ── ACTIVE THEFT REPORT ── */}
      {r && (
        <Section icon="🚨" title="Active Theft Report" color="var(--red)">
          <div className="grid-2" style={{ gap: 12 }}>
            <Field label="Report ID"       value={r.id}             mono />
            <Field label="Case Number"     value={r.caseNumber || 'Pending verification'} mono />
            <Field label="Date of Theft"   value={r.date}           danger />
            <Field label="Police Station"  value={r.policeStation} />
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Location"      value={r.location} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Description"   value={r.description} />
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <Badge status={r.status} />
            {r.dispatched && (
              <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>
                📡 Network alert active on Airtel &amp; TNM
              </span>
            )}
          </div>
        </Section>
      )}

      {/* ── NETWORK DETECTION EVENTS ── */}
      {devEvents.length > 0 && (
        <Section icon="📡" title={`Network Detection Events (${devEvents.length})`} color="var(--amber)">
          {devEvents.slice().reverse().map(ev => (
            <div key={ev.id} style={{
              padding: '10px 14px',
              background: 'var(--bg)',
              borderRadius: 'var(--radius-2)',
              marginBottom: 8,
              borderLeft: `3px solid ${ev.operator === 'Airtel' ? 'var(--red)' : 'var(--blue)'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{
                  fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 6,
                  background: ev.operator === 'Airtel' ? 'var(--red-pale)' : '#EBF3FF',
                  color:      ev.operator === 'Airtel' ? 'var(--red)'      : 'var(--blue)',
                }}>
                  {ev.operator}
                </span>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                  {ev.detectedAt}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>📍 {ev.tower} · ±{ev.radiusMeters}m</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                Active SIM: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--blue)' }}>{ev.activeSim}</span>
              </div>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted-2)', marginTop: 2 }}>
                {ev.latitude}°S, {ev.longitude}°E
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* ── TRANSFER HISTORY ── */}
      {devTransfers.length > 0 && (
        <Section icon="🔄" title={`Ownership Transfer History (${devTransfers.length})`} color="var(--purple)">
          {devTransfers.map(t => {
            const buyer  = users.find(u => u.id === t.buyerId);
            const seller = users.find(u => u.id === t.sellerId);
            return (
              <div key={t.id} style={{ padding: '10px 14px', background: 'var(--bg)', borderRadius: 'var(--radius-2)', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Transfer on {t.createdAt}</span>
                  <Badge status={t.status} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  From: <strong>{seller?.name || t.sellerId}</strong> → To: <strong>{buyer?.name || t.buyerId || 'Pending'}</strong>
                </div>
                {t.priceMWK > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>MWK {formatNumber(t.priceMWK)}</div>
                )}
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--muted-2)', marginTop: 4 }}>{t.id}</div>
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
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between',
        padding: '8px 12px',
        background: `${color}12`,
        borderRadius: '8px 8px 0 0',
        borderTop: `2px solid ${color}`,
        borderLeft: `1px solid ${color}30`,
        borderRight: `1px solid ${color}30`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 15 }}>{icon}</span>
          <span style={{ fontSize: 12, fontWeight: 800, color, letterSpacing: 0.5 }}>{title}</span>
        </div>
        {confidential && (
          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', letterSpacing: 1 }}>🔒 CONFIDENTIAL</span>
        )}
      </div>
      <div style={{
        padding: '14px 14px',
        border: `1px solid ${color}30`,
        borderTop: 'none',
        borderRadius: '0 0 8px 8px',
        background: 'var(--surface)',
      }}>
        {children}
      </div>
    </div>
  );
}

/* ── FIELD DISPLAY HELPER ─────────────────────────────────────── */
function Field({ label, value, mono, bold, capitalize, danger }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>
        {label}
      </div>
      <div style={{
        fontSize: 13,
        fontWeight: bold ? 700 : 500,
        color: danger ? 'var(--red)' : 'var(--ink-2)',
        fontFamily: mono ? 'var(--font-mono)' : 'inherit',
        textTransform: capitalize ? 'capitalize' : 'none',
        lineHeight: 1.5,
      }}>
        {value || '—'}
      </div>
    </div>
  );
}
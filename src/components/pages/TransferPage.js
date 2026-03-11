/**
 * src/components/pages/TransferPage.js
 * ─────────────────────────────────────────────
 * Device ownership transfer page.
 * Shows step flow, transfer form, anti-fraud protections, and history.
 */

import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { formatNumber } from '../../utils/helpers';
import Badge from '../ui/Badge';
import TransferInitiateModal from '../modals/TransferInitiateModal';

export default function TransferPage() {
  const { devices, transfers, currentUserId } = useAppState();

  const myDevices  = devices.filter(d => d.ownerId === currentUserId && d.status === 'registered');
  const myTransfers = transfers.filter(t => t.sellerId === currentUserId);

  const [modal, setModal]   = useState(false);
  const [selected, setSelected] = useState(null);

  const STEPS = ['Seller Initiates', 'PIN Generated', 'Buyer Enters PIN', 'Certificate Issued'];
  const STEP_COLORS = ['var(--blue)', 'var(--amber)', 'var(--green)', 'var(--purple)'];

  const PROTECTIONS = [
    ['🔒', 'Transfer blocked if active theft report exists on device'],
    ['🔑', 'PIN is single-use, bcrypt-hashed, expires in 48 hours'],
    ['🚫', 'Seller permanently blocked from reporting device stolen post-transfer'],
    ['📊', 'Devices transferred 2+ times in 30 days flagged for MACRA review'],
    ['⏪', '72-hour cooling-off reversal available via MACRA only'],
  ];

  function openTransfer(device) {
    setSelected(device);
    setModal(true);
  }

  return (
    <div className="fade-up">
      <div className="grid-2">

        {/* LEFT: Form */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 6 }}>🔄 Transfer Device Ownership</div>
            <div className="card-subtitle" style={{ marginBottom: 20 }}>Transfer ownership safely with a government-verified PIN</div>

            {/* Step flow */}
            <div className="section-title">How it works</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
              {STEPS.map((label, i) => (
                <React.Fragment key={label}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 80 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: STEP_COLORS[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: '#fff' }}>{i + 1}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.3, maxWidth: 70 }}>{label}</div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ width: 32, height: 1, background: 'var(--muted-3)', flexShrink: 0, position: 'relative', top: -10 }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {myDevices.length === 0 ? (
              <div className="alert alert-amber">
                <span className="alert-icon">⚠️</span>
                <div>No registered devices available to transfer. Stolen or recovered devices cannot be transferred.</div>
              </div>
            ) : (
              <div>
                <div className="field-label" style={{ marginBottom: 10 }}>Select device to transfer:</div>
                {myDevices.map(device => (
                  <div
                    key={device.id}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--bg)', borderRadius: 'var(--radius-2)', marginBottom: 8, cursor: 'pointer', border: '1px solid var(--muted-3)', transition: 'all .15s' }}
                    onClick={() => openTransfer(device)}
                    onMouseOver={e => e.currentTarget.style.borderColor = 'var(--blue)'}
                    onMouseOut={e =>  e.currentTarget.style.borderColor = 'var(--muted-3)'}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{device.make} {device.model}</div>
                      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>{device.imei || device.serial}</div>
                    </div>
                    <button className="btn btn-primary btn-sm">Transfer →</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transfer history */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>📜 Transfer History</div>
            {myTransfers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No transfers yet</div>
            ) : (
              myTransfers.map(t => {
                const device = devices.find(d => d.id === t.deviceId);
                return (
                  <div key={t.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--muted-3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{device?.make} {device?.model}</div>
                      <Badge status={t.status} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>📅 {t.createdAt}</div>
                    {t.priceMWK > 0 && <div style={{ fontSize: 11, color: 'var(--muted)' }}>💰 MWK {formatNumber(t.priceMWK)}</div>}
                    <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--blue)', marginTop: 4 }}>{t.id}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: Anti-fraud */}
        <div>
          <div className="card" style={{ background: 'var(--navy)', borderColor: 'transparent', marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Anti-Fraud Protections</div>
            {PROTECTIONS.map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 14 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{text}</span>
              </div>
            ))}
          </div>

          <div className="ussd-box">
            <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Transfer via USSD</div>
            <span className="ussd-code">*858*3#</span>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>No internet needed — available on all networks</div>
          </div>
        </div>
      </div>

      {modal && selected && (
        <TransferInitiateModal onClose={() => { setModal(false); setSelected(null); }} device={selected} />
      )}
    </div>
  );
}

/**
 * src/components/pages/TransferPage.js
 * ─────────────────────────────────────────────
 * Device ownership transfer page.
 * Shows step flow, transfer form, anti-fraud protections, and history.
 */

import React, { useState } from 'react';
import { useAppStore, useAppDispatch, useToast } from '../../store/useAppStore';
import Badge from '../ui/Badge';
import TransferInitiateModal from '../modals/TransferInitiateModal';
import {
  FiLock,
  FiKey,
  FiXOctagon,
  FiBarChart,
  FiRotateCcw,
  FiList,
  FiClock,
  FiSmartphone,
  FiArrowRight,
  FiCheckCircle,
} from 'react-icons/fi';

export default function TransferPage() {
  const devices = useAppStore((state) => state.devices);
  const transfers = useAppStore((state) => state.transfers);
  const currentUserId = useAppStore((state) => state.currentUserId);
  const dispatch = useAppDispatch();
  const showToast = useToast();

  const myDevices = devices.filter((d) => d.ownerId === currentUserId && d.status === 'registered');
  const myTransfers = transfers.filter((t) => t.sellerId === currentUserId);

  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [claimPin, setClaimPin] = useState('');

  const STEPS = ['Seller Initiates', 'PIN Generated', 'Buyer Enters PIN', 'Certificate Issued'];
  const STEP_COLORS = ['var(--blue)', 'var(--amber)', 'var(--green)', 'var(--purple)'];

  const PROTECTIONS = [
    { icon: <FiLock />, text: 'Transfer blocked if active theft report exists on device' },
    { icon: <FiKey />, text: 'PIN is single-use, expires in 48 hours' },
    { icon: <FiXOctagon />, text: 'Seller permanently loses ownership post-transfer' },
    { icon: <FiBarChart />, text: 'High-frequency transfers flagged for MACRA review' },
    { icon: <FiRotateCcw />, text: '72-hour cooling-off reversal via MACRA only' },
  ];

  function openTransfer(device) {
    setSelected(device);
    setModal(true);
  }

  function handleClaim() {
    const pin = claimPin.trim().toUpperCase();
    if (!pin) return;

    const transfer = transfers.find((t) => t.pin === pin && t.status === 'pending');

    if (!transfer) {
      showToast('Invalid PIN', 'This PIN does not exist or has already been used.', 'error');
      return;
    }

    // SECURITY CHECK: Block transfer if device is currently reported stolen
    const device = devices.find((d) => d.id === transfer.deviceId);
    if (device?.status === 'stolen') {
      showToast(
        'Transfer Blocked',
        'This device is currently reported stolen. Ownership cannot be transferred.',
        'error'
      );
      return;
    }

    if (transfer.sellerId === currentUserId) {
      showToast('Invalid Action', 'You cannot claim a device you already own.', 'warn');
      return;
    }

    dispatch({
      type: 'COMPLETE_TRANSFER',
      payload: { transferId: transfer.id, buyerId: currentUserId },
    });

    showToast('Success!', 'Device ownership successfully transferred to you.', 'success');
    setClaimPin('');
  }

  return (
    <div className="fade-up">
      <div className="grid-2">
        {/* LEFT: Actions */}
        <div>
          {/* SELLER: INITIATE */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div
              className="card-title"
              style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <FiRotateCcw /> Transfer Device Ownership
            </div>
            <div className="card-subtitle" style={{ marginBottom: 20 }}>
              Transfer ownership safely with a government-verified PIN
            </div>

            {/* Step flow */}
            <div className="section-title">How it works</div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 0,
                marginBottom: 24,
                overflowX: 'auto',
                paddingBottom: 4,
              }}
            >
              {STEPS.map((label, i) => (
                <React.Fragment key={label}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      minWidth: 80,
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        background: STEP_COLORS[i],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-display)',
                        fontSize: 16,
                        fontWeight: 800,
                        color: '#fff',
                      }}
                    >
                      {i + 1}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: 'var(--muted)',
                        textAlign: 'center',
                        lineHeight: 1.3,
                        maxWidth: 70,
                      }}
                    >
                      {label}
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      style={{
                        width: 32,
                        height: 1,
                        background: 'var(--muted-3)',
                        flexShrink: 0,
                        position: 'relative',
                        top: -10,
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {myDevices.length === 0 ? (
              <div className="alert alert-amber">
                <span className="alert-icon">
                  <FiXOctagon />
                </span>
                <div>
                  No registered devices available to transfer. Stolen or recovered devices cannot be
                  transferred.
                </div>
              </div>
            ) : (
              <div>
                <div className="field-label" style={{ marginBottom: 10 }}>
                  Select device to transfer:
                </div>
                {myDevices.map((device) => (
                  <div
                    key={device.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      background: 'var(--bg)',
                      borderRadius: 'var(--radius-2)',
                      marginBottom: 8,
                      cursor: 'pointer',
                      border: '1px solid var(--muted-3)',
                      transition: 'all .15s',
                    }}
                    onClick={() => openTransfer(device)}
                    onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--blue)')}
                    onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--muted-3)')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <FiSmartphone color="var(--blue)" />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>
                          {device.make} {device.model}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--muted)',
                          }}
                        >
                          {device.imei || device.serial}
                        </div>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      Transfer <FiArrowRight />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BUYER: CLAIM */}
          <div className="card" style={{ borderLeft: '4px solid var(--green)' }}>
            <div
              className="card-title"
              style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <FiCheckCircle color="var(--green)" /> Claim Device Ownership
            </div>
            <div className="card-subtitle" style={{ marginBottom: 20 }}>
              Have a Transfer PIN? Enter it below to claim ownership.
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <input
                className="field-input mono"
                placeholder="TRF-XXXX-XXXX"
                value={claimPin}
                onChange={(e) => setClaimPin(e.target.value.toUpperCase())}
                style={{ flex: 1, fontSize: 16, padding: '12px 14px' }}
              />
              <button className="btn btn-green" onClick={handleClaim}>
                Claim Device
              </button>
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 12 }}>
              The ownership change is instant and permanent. MACRA will issue a digital ownership
              certificate upon completion.
            </div>
          </div>
        </div>

        {/* RIGHT: History & Info */}
        <div>
          <div
            className="card"
            style={{ background: 'var(--navy)', borderColor: 'transparent', marginBottom: 20 }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginBottom: 14,
              }}
            >
              Anti-Fraud Protections
            </div>
            {PROTECTIONS.map((p, idx) => (
              <div
                key={idx}
                style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 14 }}
              >
                <span style={{ fontSize: 16, flexShrink: 0, color: 'var(--blue-3)' }}>
                  {p.icon}
                </span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                  {p.text}
                </span>
              </div>
            ))}
          </div>

          <div className="card">
            <div
              className="card-title"
              style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <FiList /> Recent Transfer Activity
            </div>
            {myTransfers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>
                No transfers yet
              </div>
            ) : (
              myTransfers.map((t) => {
                const device = devices.find((d) => d.id === t.deviceId);
                return (
                  <div
                    key={t.id}
                    style={{ padding: '12px 0', borderBottom: '1px solid var(--muted-3)' }}
                  >
                    <div
                      style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 13 }}>
                        {device?.make} {device?.model}
                      </div>
                      <Badge status={t.status} />
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <FiClock size={10} /> {t.createdAt}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--blue)',
                        marginTop: 4,
                      }}
                    >
                      {t.id}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {modal && selected && (
        <TransferInitiateModal
          onClose={() => {
            setModal(false);
            setSelected(null);
          }}
          device={selected}
        />
      )}
    </div>
  );
}

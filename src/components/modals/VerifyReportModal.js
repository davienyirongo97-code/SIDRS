/**
 * src/components/modals/VerifyReportModal.js
 * ─────────────────────────────────────────────
 * Two-step police officer verification modal.
 *
 * STEP 1 — Review: Shows full report + device details for the officer to read.
 * STEP 2 — Sign:   Captures officer badge number, rank, station & a 6-digit
 *                  signature PIN that is hashed into a unique digital fingerprint.
 *                  This makes every verification permanently attributable to a
 *                  named officer — full accountability for the audit trail.
 */

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useAppStore, useAppDispatch, useToast, useCurrentUser } from '../../store/useAppStore';
import { findDevice } from '../../utils/helpers';
import { POLICE_STATIONS } from '../../data/mockData';
import {
  FiShield,
  FiUser,
  FiHash,
  FiMapPin,
  FiLock,
  FiCheckCircle,
  FiAlertTriangle,
} from 'react-icons/fi';

const RANKS = [
  'Constable',
  'Lance Corporal',
  'Corporal',
  'Sergeant',
  'Inspector',
  'Detective Inspector',
  'Chief Inspector',
  'Superintendent',
  'Assistant Commissioner',
  'Commissioner',
];

export default function VerifyReportModal({ onClose, reportId }) {
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const currentUser = useCurrentUser();
  const reports = useAppStore((state) => state.reports);
  const devices = useAppStore((state) => state.devices);

  const report = reports.find((r) => r.id === reportId);
  const device = report ? findDevice(report.deviceId, devices) : null;

  // Two-step form state
  const [step, setStep] = useState(1); // 1 = review, 2 = sign

  // Officer credential fields
  const [badgeNumber, setBadgeNumber] = useState('');
  const [rank, setRank] = useState('');
  const [station, setStation] = useState(currentUser?.location || '');
  const [sigPin, setSigPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errors, setErrors] = useState({});

  if (!report) return null;

  // ── Validation ─────────────────────────────────────────────
  function validate() {
    const errs = {};
    if (!badgeNumber.trim()) errs.badgeNumber = 'Badge number is required';

    if (!rank) errs.rank = 'Please select your rank';

    if (!station) errs.station = 'Please select your station';

    if (!sigPin) errs.sigPin = 'Signature PIN is required';
    else if (!/^\d{6}$/.test(sigPin)) errs.sigPin = 'PIN must be exactly 6 digits';

    if (sigPin !== confirmPin) errs.confirmPin = 'PINs do not match';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Submit verification ─────────────────────────────────────
  function handleVerify() {
    if (!validate()) return;

    dispatch({
      type: 'VERIFY_REPORT',
      payload: {
        reportId,
        officerDetails: {
          badgeNumber: badgeNumber.trim().toUpperCase(),
          rank,
          station,
          sigPin, // used only for hashing — never stored in plaintext
        },
      },
    });

    showToast(
      'Report verified & signed!',
      `Signed by ${rank} ${currentUser?.name} · Badge ${badgeNumber.toUpperCase()}. IMEI alert dispatched.`,
      'success'
    );
    onClose();
  }

  function handleReject() {
    showToast('Report rejected.', 'The citizen has been notified.', 'warn');
    onClose();
  }

  // ── Field error helper ──────────────────────────────────────
  const FieldError = ({ name }) =>
    errors[name] ? (
      <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4, fontWeight: 600 }}>
        {errors[name]}
      </div>
    ) : null;

  // ════════════════════════════════════════════════════════════
  // STEP 1 — REVIEW REPORT
  // ════════════════════════════════════════════════════════════
  const step1 = (
    <>
      <div className="modal-body">
        {/* Step indicator */}
        <StepIndicator current={1} />

        {/* Report fields */}
        {[
          ['Report ID', report.id, true],
          ['Date of Theft', report.date, false],
          ['Location', report.location, false],
          ['Police Station Filed At', report.policeStation, false],
          ['Description', report.description, false],
        ].map(([label, value, mono]) => (
          <div
            key={label}
            style={{
              marginBottom: 10,
              padding: '10px 14px',
              background: 'var(--bg)',
              borderRadius: 'var(--radius-2)',
            }}
          >
            <div className="field-label" style={{ marginBottom: 3 }}>
              {label}
            </div>
            <div
              style={{
                fontWeight: 600,
                color: 'var(--ink)',
                fontFamily: mono ? 'var(--font-mono)' : 'inherit',
                fontSize: mono ? 12 : 13,
              }}
            >
              {value}
            </div>
          </div>
        ))}

        {/* Device info */}
        {device && (
          <div
            style={{
              marginBottom: 14,
              padding: '12px 14px',
              background: 'var(--bg)',
              borderRadius: 'var(--radius-2)',
              border: '1px solid rgba(37,99,235,0.15)',
            }}
          >
            <div className="field-label" style={{ marginBottom: 6 }}>
              Device
            </div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              {device.make} {device.model}
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 8, flexWrap: 'wrap' }}>
              {[
                ['IMEI', device.imei],
                ['Serial', device.serial],
                ['MAC', device.mac],
              ]
                .filter(([, v]) => v)
                .map(([label, val]) => (
                  <div key={label}>
                    <div
                      style={{
                        fontSize: 10,
                        color: 'var(--muted)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        color: 'var(--blue)',
                        fontWeight: 700,
                      }}
                    >
                      {val}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Honey-trap warning */}
        <div className="alert alert-amber">
          <span className="alert-icon">
            <FiAlertTriangle />
          </span>
          <div>
            Upon verification, the IMEI will be <strong>silently</strong> flagged on Airtel &amp;
            TNM EIR systems. The device remains active so the thief continues to use it — giving
            police live location data.
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn btn-ghost-red" onClick={handleReject}>
          ✗ Reject Report
        </button>
        <button className="btn btn-primary" onClick={() => setStep(2)}>
          Continue → Officer Signature
        </button>
      </div>
    </>
  );

  // ════════════════════════════════════════════════════════════
  // STEP 2 — OFFICER SIGNATURE
  // ════════════════════════════════════════════════════════════
  const step2 = (
    <>
      <div className="modal-body">
        {/* Step indicator */}
        <StepIndicator current={2} />

        {/* Accountability notice */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: 12,
            padding: '14px 16px',
            marginBottom: 20,
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
          }}
        >
          <FiShield size={20} style={{ color: '#a78bfa', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#a78bfa', marginBottom: 4 }}>
              OFFICER ACCOUNTABILITY SIGNATURE
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
              Your badge number and PIN will be hashed into a unique digital fingerprint permanently
              recorded in the audit trail. You are legally accountable for this verification.
            </div>
          </div>
        </div>

        {/* Badge Number */}
        <div className="form-group" style={{ marginBottom: 14 }}>
          <label className="field-label">
            <FiHash size={11} style={{ marginRight: 4 }} />
            Badge / Service Number *
          </label>
          <input
            className={`field-input${errors.badgeNumber ? ' field-input-error' : ''}`}
            placeholder="e.g. MPS-LLW-2847"
            value={badgeNumber}
            onChange={(e) => {
              setBadgeNumber(e.target.value);
              setErrors((p) => ({ ...p, badgeNumber: '' }));
            }}
            style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}
          />
          <FieldError name="badgeNumber" />
        </div>

        {/* Rank */}
        <div className="form-group" style={{ marginBottom: 14 }}>
          <label className="field-label">
            <FiUser size={11} style={{ marginRight: 4 }} />
            Rank *
          </label>
          <select
            className={`field-input field-select${errors.rank ? ' field-input-error' : ''}`}
            value={rank}
            onChange={(e) => {
              setRank(e.target.value);
              setErrors((p) => ({ ...p, rank: '' }));
            }}
          >
            <option value="">— Select rank —</option>
            {RANKS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <FieldError name="rank" />
        </div>

        {/* Station */}
        <div className="form-group" style={{ marginBottom: 14 }}>
          <label className="field-label">
            <FiMapPin size={11} style={{ marginRight: 4 }} />
            Verifying Station *
          </label>
          <select
            className={`field-input field-select${errors.station ? ' field-input-error' : ''}`}
            value={station}
            onChange={(e) => {
              setStation(e.target.value);
              setErrors((p) => ({ ...p, station: '' }));
            }}
          >
            <option value="">— Select station —</option>
            {POLICE_STATIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <FieldError name="station" />
        </div>

        {/* Signature PIN */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div className="form-group">
            <label className="field-label">
              <FiLock size={11} style={{ marginRight: 4 }} />
              Signature PIN (6 digits) *
            </label>
            <input
              className={`field-input${errors.sigPin ? ' field-input-error' : ''}`}
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="••••••"
              value={sigPin}
              onChange={(e) => {
                setSigPin(e.target.value.replace(/\D/g, ''));
                setErrors((p) => ({ ...p, sigPin: '' }));
              }}
              style={{ letterSpacing: 4, fontSize: 18 }}
            />
            <FieldError name="sigPin" />
          </div>
          <div className="form-group">
            <label className="field-label">Confirm PIN *</label>
            <input
              className={`field-input${errors.confirmPin ? ' field-input-error' : ''}`}
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="••••••"
              value={confirmPin}
              onChange={(e) => {
                setConfirmPin(e.target.value.replace(/\D/g, ''));
                setErrors((p) => ({ ...p, confirmPin: '' }));
              }}
              style={{ letterSpacing: 4, fontSize: 18 }}
            />
            <FieldError name="confirmPin" />
          </div>
        </div>

        {/* Preview of what will be recorded */}
        <div
          style={{
            background: 'var(--bg)',
            borderRadius: 10,
            padding: '12px 14px',
            border: '1px solid var(--muted-3)',
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            Audit Record Preview
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              ['Officer', currentUser?.name || '—'],
              ['Badge', badgeNumber ? badgeNumber.toUpperCase() : '—'],
              ['Rank', rank || '—'],
              ['Station', station || '—'],
              ['Signature', sigPin.length === 6 ? 'SIG-••••••••••••••••' : '—'],
              ['Timestamp', new Date().toLocaleString('en-GB')],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                <span style={{ color: 'var(--muted)', fontWeight: 700, minWidth: 70 }}>{k}</span>
                <span
                  style={{
                    color: 'var(--ink-2)',
                    fontFamily: k === 'Signature' ? 'var(--font-mono)' : 'inherit',
                  }}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn btn-surface" onClick={() => setStep(1)}>
          ← Back to Review
        </button>
        <button className="btn btn-primary" onClick={handleVerify} style={{ gap: 8 }}>
          <FiCheckCircle size={15} /> Sign & Dispatch Alert
        </button>
      </div>
    </>
  );

  return (
    <Modal
      title={step === 1 ? '📋 Review Theft Report' : '🔐 Officer Signature'}
      onClose={onClose}
      wide={false}
    >
      {step === 1 ? step1 : step2}
    </Modal>
  );
}

// ── Step indicator component ────────────────────────────────────
function StepIndicator({ current }) {
  const steps = ['Review Report', 'Officer Signature'];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        marginBottom: 20,
        background: 'var(--bg)',
        borderRadius: 10,
        padding: '10px 16px',
      }}
    >
      {steps.map((label, i) => {
        const num = i + 1;
        const done = num < current;
        const active = num === current;
        return (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: done ? 'var(--green)' : active ? 'var(--blue)' : 'var(--muted-3)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 800,
                  flexShrink: 0,
                  boxShadow: active ? '0 0 10px rgba(37,99,235,0.4)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {done ? '✓' : num}
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--ink)' : done ? 'var(--green)' : 'var(--muted)',
                }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: done ? 'var(--green)' : 'var(--muted-3)',
                  margin: '0 12px',
                  transition: 'background 0.3s',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/**
 * src/components/modals/VerifyReportModal.js
 * ─────────────────────────────────────────────
 * Modal for police officers to review and verify a pending theft report.
 * Upon verification: report becomes 'active', IMEI alert dispatched
 * to Airtel & TNM network monitoring.
 */

import React from 'react';
import Modal from '../ui/Modal';
import { useAppStore, useAppDispatch, useToast } from '../../store/useAppStore';
import { findDevice } from '../../utils/helpers';

export default function VerifyReportModal({ onClose, reportId }) {
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const reports = useAppStore((state) => state.reports);
  const devices = useAppStore((state) => state.devices);

  const report = reports.find((r) => r.id === reportId);
  const device = report ? findDevice(report.deviceId, devices) : null;

  if (!report) return null;

  const fields = [
    ['Report ID', report.id, true],
    ['Date of Theft', report.date, false],
    ['Location', report.location, false],
    ['Police Station', report.policeStation, false],
    ['Description', report.description, false],
  ];

  function handleVerify() {
    dispatch({ type: 'VERIFY_REPORT', payload: { reportId } });
    showToast(
      'Report verified!',
      'IMEI alert dispatched to Airtel & TNM. Network monitoring is now active.',
      'success'
    );
    onClose();
  }

  function handleReject() {
    showToast('Report rejected.', 'The citizen has been notified.', 'warn');
    onClose();
  }

  return (
    <Modal title="✅ Verify Theft Report" onClose={onClose}>
      <div className="modal-body">
        {/* Report detail fields */}
        {fields.map(([label, value, mono]) => (
          <div
            key={label}
            style={{
              marginBottom: 14,
              padding: '10px 14px',
              background: 'var(--bg)',
              borderRadius: 'var(--radius-2)',
            }}
          >
            <div className="field-label" style={{ marginBottom: 4 }}>
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
              marginBottom: 16,
              padding: '10px 14px',
              background: 'var(--bg)',
              borderRadius: 'var(--radius-2)',
            }}
          >
            <div className="field-label" style={{ marginBottom: 4 }}>
              Device
            </div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>
              {device.make} {device.model} — {device.imei || device.serial}
            </div>
          </div>
        )}

        {/* Warning about what verification does */}
        <div className="alert alert-amber">
          <span className="alert-icon">⚠️</span>
          <div>
            Upon verification, the IMEI will be <strong>silently</strong> flagged on Airtel &amp;
            TNM EIR systems. The device will remain active on the network so the thief continues to
            use it — giving police live location data.
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn btn-ghost-red" onClick={handleReject}>
          ✗ Reject Report
        </button>
        <button className="btn btn-primary" onClick={handleVerify}>
          ✅ Verify &amp; Dispatch Alert
        </button>
      </div>
    </Modal>
  );
}

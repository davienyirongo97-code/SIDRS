/**
 * src/components/modals/TransferPinModal.js
 * ─────────────────────────────────────────────
 * Displays the generated Transfer PIN after the seller initiates
 * a device ownership transfer. Shows a government-style certificate.
 */

import React from 'react';
import Modal from '../ui/Modal';
import { useToast } from '../../store/useAppStore';
import './TransferPinModal.css';

export default function TransferPinModal({ onClose, pin, device }) {
  const showToast = useToast();

  if (!pin || !device) return null;

  function handleDone() {
    showToast('Transfer PIN issued.', 'Waiting for buyer to claim ownership.', 'info');
    onClose();
  }

  return (
    <Modal title="🔑 Transfer PIN Generated" onClose={onClose}>
      <div className="modal-body">
        {/* Certificate display */}
        <div className="transfer-cert">
          <div className="cert-seal">🏛️</div>
          <div className="cert-label">MACRA SDIRS — Ownership Transfer Certificate</div>

          {/* The PIN itself - Force blue/white with inline styles for reliability */}
          <div
            className="cert-pin"
            style={{
              background: '#2563eb',
              color: '#ffffff',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)',
              border: 'none',
              fontSize: '32px',
              fontWeight: '800',
              margin: '20px 0',
              display: 'block',
              textAlign: 'center',
            }}
          >
            {pin}
          </div>

          <div className="cert-validity">
            Valid for 48 hours · Single use only · Expires after claim
          </div>

          {/* Device info */}
          {device && (
            <div className="cert-device">
              Device:{' '}
              <strong>
                {device.make} {device.model}
              </strong>
              <br />
              Issued: {new Date().toLocaleDateString('en-MW')} at{' '}
              {new Date().toLocaleTimeString('en-MW', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>

        {/* Instructions for buyer */}
        <div className="alert alert-green" style={{ marginTop: 16 }}>
          <span className="alert-icon">✓</span>
          <div>
            Share this PIN with the buyer. They open SDIRS → Transfer → Claim Device and enter this
            PIN to complete the ownership transfer.
          </div>
        </div>

        {/* SMS confirmation */}
        <div className="alert alert-blue" style={{ marginTop: 10 }}>
          <span className="alert-icon">📱</span>
          <div>This PIN has been sent to your registered phone number via SMS.</div>
        </div>

        {/* USSD alternative */}
        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
            Buyer can also claim via USSD:
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: 15,
              color: 'var(--navy)',
            }}
          >
            *858*3*{pin}#
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleDone}>
          Done
        </button>
      </div>
    </Modal>
  );
}

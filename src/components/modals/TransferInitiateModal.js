/**
 * src/components/modals/TransferInitiateModal.js
 * ─────────────────────────────────────────────
 * Seller initiates an ownership transfer.
 * Collects optional buyer phone and sale price,
 * then dispatches ADD_TRANSFER → shows the PIN.
 */

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useAppDispatch } from '../../store/useAppStore';
import { primaryIdentifier, generateTransferPin } from '../../utils/helpers';
import TransferPinModal from './TransferPinModal';

export default function TransferInitiateModal({ onClose, device }) {
  const dispatch = useAppDispatch();

  const [buyerPhone, setBuyerPhone] = useState('');
  const [priceMWK, setPriceMWK] = useState('');
  const [pin, setPin] = useState(null); // set after dispatch

  if (!device) return null;

  function handleGenerate() {
    const newPin = generateTransferPin();
    dispatch({
      type: 'ADD_TRANSFER',
      payload: {
        deviceId: device.id,
        buyerPhone,
        priceMWK: parseInt(priceMWK) || 0,
        pin: newPin,
      },
    });

    setPin(newPin);
  }

  // After PIN is generated, show the certificate modal
  if (pin) {
    return <TransferPinModal onClose={onClose} pin={pin} device={device} />;
  }

  return (
    <Modal title="🔄 Transfer Ownership" onClose={onClose}>
      <div className="modal-body">
        {/* Device summary */}
        <div
          style={{
            padding: '12px 14px',
            background: 'var(--bg)',
            borderRadius: 'var(--radius-2)',
            marginBottom: 18,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>
            Transferring: {device?.make} {device?.model}
          </div>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
            {primaryIdentifier(device)}
          </div>
        </div>

        <div className="field">
          <label className="field-label">Buyer Phone Number (optional)</label>
          <input
            className="field-input"
            placeholder="+265 9XX XXX XXX"
            value={buyerPhone}
            onChange={(e) => setBuyerPhone(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="field-label">Sale Price MWK (optional)</label>
          <input
            type="number"
            className="field-input"
            placeholder="e.g. 150000"
            value={priceMWK}
            onChange={(e) => setPriceMWK(e.target.value)}
          />
        </div>

        <div className="alert alert-amber">
          <span className="alert-icon">⚠️</span>
          <div>
            After transfer you permanently lose the ability to report this device stolen. This
            action is logged permanently in the national registry.
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn btn-surface" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={handleGenerate}>
          Generate Transfer PIN →
        </button>
      </div>
    </Modal>
  );
}

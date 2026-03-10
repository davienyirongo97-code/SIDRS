/**
 * src/components/modals/RegisterDeviceModal.js
 * ─────────────────────────────────────────────
 * Modal for registering a new device into the national registry.
 *
 * Fields:
 *   - Device type (mobile/laptop/tablet/desktop)
 *   - Make (brand) and model
 *   - Colour
 *   - IMEI (shown for mobile and tablet)
 *   - MAC address (shown for laptop, tablet, desktop)
 *   - Serial number
 */

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useAppDispatch, useToast } from '../../context/AppContext';

const DEVICE_TYPES = [
  { value: 'mobile',  label: '📱 Mobile Phone' },
  { value: 'laptop',  label: '💻 Laptop' },
  { value: 'tablet',  label: '📟 Tablet' },
  { value: 'desktop', label: '🖥️ Desktop' },
];

export default function RegisterDeviceModal({ onClose }) {
  const dispatch  = useAppDispatch();
  const showToast = useToast();

  // Form state
  const [form, setForm] = useState({
    type:   'mobile',
    make:   '',
    model:  '',
    color:  '',
    imei:   '',
    mac:    '',
    serial: '',
  });

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  // Show IMEI for phones and tablets
  const showImei = form.type === 'mobile' || form.type === 'tablet';
  // Show MAC for laptops, tablets, desktops
  const showMac  = form.type === 'laptop' || form.type === 'tablet' || form.type === 'desktop';

  function handleSubmit() {
    if (!form.make.trim() || !form.model.trim()) {
      showToast('Please fill in device make and model.', '', 'warn');
      return;
    }

    dispatch({
      type: 'REGISTER_DEVICE',
      payload: {
        type:   form.type,
        make:   form.make.trim(),
        model:  form.model.trim(),
        color:  form.color.trim(),
        imei:   form.imei.trim()   || null,
        mac:    form.mac.trim()    || null,
        serial: form.serial.trim() || null,
      },
    });

    showToast(
      `${form.make} ${form.model} registered!`,
      'Device is now protected in the national registry.',
      'success'
    );

    onClose();
  }

  return (
    <Modal title="📱 Register New Device" onClose={onClose}>
      <div className="modal-body">

        {/* Device type selector */}
        <div className="field">
          <label className="field-label">Device Type *</label>
          <select
            className="field-input field-select"
            value={form.type}
            onChange={e => update('type', e.target.value)}
          >
            {DEVICE_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Make + Model side by side */}
        <div className="grid-2">
          <div className="field">
            <label className="field-label">Make / Brand *</label>
            <input
              className="field-input"
              placeholder="Samsung, Apple, Lenovo..."
              value={form.make}
              onChange={e => update('make', e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label">Model *</label>
            <input
              className="field-input"
              placeholder="Galaxy A54, ThinkPad..."
              value={form.model}
              onChange={e => update('model', e.target.value)}
            />
          </div>
        </div>

        {/* Colour */}
        <div className="field">
          <label className="field-label">Colour</label>
          <input
            className="field-input"
            placeholder="e.g. Black, Silver, Blue"
            value={form.color}
            onChange={e => update('color', e.target.value)}
          />
        </div>

        {/* IMEI — only for mobile/tablet */}
        {showImei && (
          <div className="field">
            <label className="field-label">IMEI Number</label>
            <input
              className="field-input mono"
              placeholder="Dial *#06# to find your IMEI"
              value={form.imei}
              onChange={e => update('imei', e.target.value)}
            />
            <div className="field-hint">Dial *#06# on the phone to reveal the 15-digit IMEI number.</div>
          </div>
        )}

        {/* MAC address — only for laptop/tablet/desktop */}
        {showMac && (
          <div className="field">
            <label className="field-label">MAC Address (WiFi)</label>
            <input
              className="field-input mono"
              placeholder="A4:C3:F0:85:AC:12"
              value={form.mac}
              onChange={e => update('mac', e.target.value)}
            />
            <div className="field-hint">Found in Settings → About → WiFi MAC address.</div>
          </div>
        )}

        {/* Serial number */}
        <div className="field">
          <label className="field-label">Serial Number</label>
          <input
            className="field-input mono"
            placeholder="Found on the device sticker or box"
            value={form.serial}
            onChange={e => update('serial', e.target.value)}
          />
        </div>

        {/* Pre-registration tip */}
        <div className="alert alert-amber">
          <span className="alert-icon">💡</span>
          <div>
            Register all your devices <strong>before</strong> any theft occurs.
            Pre-registration is what makes SDIRS network tracking work.
          </div>
        </div>

      </div>

      <div className="modal-footer">
        <button className="btn btn-surface" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit}>
          ✅ Register Device
        </button>
      </div>
    </Modal>
  );
}

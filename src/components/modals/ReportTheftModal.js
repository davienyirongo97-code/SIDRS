/**
 * src/components/modals/ReportTheftModal.js
 * ─────────────────────────────────────────────
 * Modal for reporting a device as stolen.
 * Pre-fills the device if one is passed in (e.g. from My Devices page).
 */

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useAppDispatch, useAppState, useToast } from '../../context/AppContext';
import { primaryIdentifier, todayString } from '../../utils/helpers';
import { POLICE_STATIONS } from '../../data/mockData';
import { FiAlertCircle, FiAlertTriangle } from 'react-icons/fi';

export default function ReportTheftModal({ onClose, preselectedDeviceId = null }) {
  const dispatch  = useAppDispatch();
  const showToast = useToast();
  const { devices, currentUserId } = useAppState();

  // Only allow reporting registered devices owned by current user
  const myRegisteredDevices = devices.filter(
    d => d.ownerId === currentUserId && d.status === 'registered'
  );

  const [form, setForm] = useState({
    deviceId:     preselectedDeviceId || '',
    date:         todayString(),
    policeStation:'',
    location:     '',
    description:  '',
  });

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit() {
    const { deviceId, date, policeStation, location, description } = form;
    if (!deviceId || !date || !policeStation || !location || !description) {
      showToast('Please fill in all required fields.', '', 'warn');
      return;
    }

    dispatch({ type: 'SUBMIT_REPORT', payload: form });

    showToast(
      'Theft report submitted!',
      'Police will review and verify within 24 hours.',
      'info'
    );

    onClose();
  }

  if (myRegisteredDevices.length === 0) {
    return (
      <Modal title={<><FiAlertCircle style={{marginRight:8, color:'var(--red)'}} /> Report Stolen Device</>} onClose={onClose}>
        <div className="modal-body">
          <div className="alert alert-amber">
            <span className="alert-icon"><FiAlertTriangle /></span>
            <div>
              No registered devices available to report stolen.
              If your device was stolen before you registered it,
              contact your nearest police station directly.
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-surface" onClick={onClose}>Close</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={<><FiAlertCircle style={{marginRight:8, color:'var(--red)'}} /> Report Stolen Device</>} onClose={onClose}>
      <div className="modal-body">

        {/* Device selector */}
        <div className="field">
          <label className="field-label">Stolen Device *</label>
          <select
            className="field-input field-select"
            value={form.deviceId}
            onChange={e => update('deviceId', e.target.value)}
          >
            <option value="">— Select device —</option>
            {myRegisteredDevices.map(d => (
              <option key={d.id} value={d.id}>
                {d.make} {d.model} ({primaryIdentifier(d)})
              </option>
            ))}
          </select>
        </div>

        {/* Date + Police station */}
        <div className="grid-2">
          <div className="field">
            <label className="field-label">Date of Theft *</label>
            <input
              type="date"
              className="field-input"
              value={form.date}
              onChange={e => update('date', e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label">Police Station *</label>
            <select
              className="field-input field-select"
              value={form.policeStation}
              onChange={e => update('policeStation', e.target.value)}
            >
              <option value="">— Select station —</option>
              {POLICE_STATIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Location */}
        <div className="field">
          <label className="field-label">Location of Theft *</label>
          <input
            className="field-input"
            placeholder="e.g. Kawale Market, Lilongwe"
            value={form.location}
            onChange={e => update('location', e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="field">
          <label className="field-label">Description of Incident *</label>
          <textarea
            className="field-input"
            placeholder="Describe how the theft occurred — time, circumstances, what happened..."
            value={form.description}
            onChange={e => update('description', e.target.value)}
          />
        </div>

        {/* Warning */}
        <div className="alert alert-amber">
          <span className="alert-icon"><FiAlertTriangle /></span>
          <div>
            Filing a false theft report is a criminal offence under the Communications Act.
            All reports are police-verified before any network alert is activated.
          </div>
        </div>

      </div>

      <div className="modal-footer">
        <button className="btn btn-surface" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger" onClick={handleSubmit}>
          <FiAlertCircle style={{marginRight:6}} /> Submit Theft Report
        </button>
      </div>
    </Modal>
  );
}

/**
 * src/components/pages/ReportTheftPage.js
 * ─────────────────────────────────────────────
 * Standalone page for filing a theft report.
 * Mirrors the ReportTheftModal but as a full page.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppStore, useToast } from '../../store/useAppStore';
import { primaryIdentifier, todayString } from '../../utils/helpers';
import { POLICE_STATIONS } from '../../data/mockData';
import { FiAlertCircle, FiAlertTriangle } from 'react-icons/fi';

export default function ReportTheftPage() {
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const navigate = useNavigate();
  const devices = useAppStore((state) => state.devices);
  const currentUserId = useAppStore((state) => state.currentUserId);

  const myDevices = devices.filter((d) => d.ownerId === currentUserId && d.status === 'registered');

  const [form, setForm] = useState({
    deviceId: '',
    date: todayString(),
    policeStation: '',
    location: '',
    description: '',
  });

  function update(field, val) {
    setForm((p) => ({ ...p, [field]: val }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (
      !form.deviceId ||
      !form.date ||
      !form.policeStation ||
      !form.location ||
      !form.description
    ) {
      showToast('Please fill in all required fields.', '', 'warn');
      return;
    }
    dispatch({ type: 'SUBMIT_REPORT', payload: form });
    showToast('Theft report submitted!', 'Police will verify within 24 hours.', 'info');
    navigate('/my-devices');
  }

  return (
    <div className="fade-up" style={{ maxWidth: 600 }}>
      <div className="alert alert-red" style={{ marginBottom: 24 }}>
        <span className="alert-icon">
          <FiAlertCircle />
        </span>
        <div>
          Upon police verification, the stolen IMEI is <strong>silently</strong> flagged on Airtel
          &amp; TNM. Every network connection gives police live location data. Do NOT publicly
          announce your report.
        </div>
      </div>

      <div className="card">
        <div
          className="card-title"
          style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <FiAlertCircle /> Report a Stolen Device
        </div>

        {myDevices.length === 0 ? (
          <div className="alert alert-amber">
            <span className="alert-icon">
              <FiAlertTriangle />
            </span>
            <div>
              No registered devices available. Contact your nearest police station directly, or
              register your device first.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="field-label">Select Stolen Device *</label>
              <select
                className="field-input field-select"
                value={form.deviceId}
                onChange={(e) => update('deviceId', e.target.value)}
              >
                <option value="">— Select device —</option>
                {myDevices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.make} {d.model} ({primaryIdentifier(d)})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid-2">
              <div className="field">
                <label className="field-label">Date of Theft *</label>
                <input
                  type="date"
                  className="field-input"
                  value={form.date}
                  onChange={(e) => update('date', e.target.value)}
                />
              </div>
              <div className="field">
                <label className="field-label">Police Station *</label>
                <select
                  className="field-input field-select"
                  value={form.policeStation}
                  onChange={(e) => update('policeStation', e.target.value)}
                >
                  <option value="">— Select station —</option>
                  {POLICE_STATIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label className="field-label">Location of Theft *</label>
              <input
                className="field-input"
                placeholder="e.g. Kawale Market, Lilongwe"
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label">Description of Incident *</label>
              <textarea
                className="field-input"
                placeholder="Describe how the theft occurred..."
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
              />
            </div>
            <div className="alert alert-amber" style={{ marginBottom: 20 }}>
              <span className="alert-icon">
                <FiAlertTriangle />
              </span>
              <div>
                Filing a false theft report is a criminal offence under the Communications Act.
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-danger"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <FiAlertCircle /> Submit Theft Report
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

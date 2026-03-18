/**
 * src/components/pages/DeviceRegistryPage.js
 * ─────────────────────────────────────────────
 * Full national device registry with live search/filter.
 */

import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { deviceIcon, primaryIdentifier } from '../../utils/helpers';
import Badge from '../ui/Badge';
import StatCard from '../ui/StatCard';
import RegisterDeviceModal from '../modals/RegisterDeviceModal';
import { FiSmartphone, FiMonitor, FiTablet, FiTv, FiClipboard, FiSearch } from 'react-icons/fi';

export default function DeviceRegistryPage() {
  const { devices, users } = useAppState();

  const [query,       setQuery]       = useState('');
  const [typeFilter,  setTypeFilter]  = useState('all');
  const [statusFilter,setStatusFilter]= useState('all');
  const [showModal,   setShowModal]   = useState(false);

  // Filter devices based on search query and dropdowns
  const filtered = devices.filter(d => {
    const matchQuery  = !query || `${d.make} ${d.model} ${d.imei||''} ${d.serial||''} ${d.mac||''}`.toLowerCase().includes(query.toLowerCase());
    const matchType   = typeFilter   === 'all' || d.type   === typeFilter;
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchQuery && matchType && matchStatus;
  });

  return (
    <div className="fade-up">

      {/* ── Stats ── */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard icon={<FiSmartphone />} value={devices.filter(d=>d.type==='mobile').length}  label="Mobile Phones" color="var(--blue)"   />
        <StatCard icon={<FiMonitor />} value={devices.filter(d=>d.type==='laptop').length}  label="Laptops"       color="var(--purple)" />
        <StatCard icon={<FiTablet />} value={devices.filter(d=>d.type==='tablet').length}  label="Tablets"       color="var(--amber)"  />
        <StatCard icon={<FiTv />} value={devices.filter(d=>d.type==='desktop').length} label="Desktops"      color="var(--green)"  />
      </div>

      {/* ── Registry table ── */}
      <div className="card">
        <div className="card-header">
          <div>
              <div className="card-title" style={{display:'flex',alignItems:'center',gap:6}}><FiClipboard size={15}/> National Device Registry</div>
            <div className="card-subtitle">{filtered.length} of {devices.length} devices shown</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            + Register Device
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="field-input"
            style={{ width: 240, padding: '8px 12px' }}
            placeholder="🔍  Search make, model, IMEI..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <select className="field-input field-select" style={{ width: 160 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="all">All types</option>
            <option value="mobile">Mobile</option>
            <option value="laptop">Laptop</option>
            <option value="tablet">Tablet</option>
            <option value="desktop">Desktop</option>
          </select>
          <select className="field-input field-select" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="registered">Registered</option>
            <option value="stolen">Stolen</option>
            <option value="recovered">Recovered</option>
          </select>
          {(query || typeFilter !== 'all' || statusFilter !== 'all') && (
            <button className="btn btn-surface btn-sm" onClick={() => { setQuery(''); setTypeFilter('all'); setStatusFilter('all'); }}>
              ✕ Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Device</th><th>Type</th><th>Primary ID</th>
                <th>Registered Owner</th><th>Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>No devices match your filters</td></tr>
              ) : (
                filtered.map(d => {
                  const owner = users.find(u => u.id === d.ownerId);
                  return (
                    <tr key={d.id}>
                      <td>
                        <strong>{d.make} {d.model}</strong>
                        <br /><span style={{ fontSize: 11, color: 'var(--muted)' }}>{d.color}</span>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{deviceIcon(d.type)} {d.type}</td>
                      <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{primaryIdentifier(d)}</span></td>
                      <td>
                        {owner?.name}
                        <br /><span style={{ fontSize: 11, color: 'var(--muted)' }}>{owner?.location}</span>
                      </td>
                      <td>{d.registeredDate}</td>
                      <td><Badge status={d.status} /></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <RegisterDeviceModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

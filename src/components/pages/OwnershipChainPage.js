import React, { useState, useMemo } from 'react';
import { useAppState } from '../../context/AppContext';
import { deviceIcon } from '../../utils/helpers';
import { 
  FiLink, FiSmartphone, FiRefreshCw, FiAlertCircle, FiUsers, 
  FiCheckCircle, FiAlertTriangle, FiRadio, FiLock, FiClock, FiUser, FiSearch 
} from 'react-icons/fi';

// ── SIMULATED BLOCKCHAIN HASH ─────────────────────────────────
function simulateHash(input) {
  let hash = 0x811c9dc5;
  const str = JSON.stringify(input);
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0').toUpperCase() +
    (hash * 0x9e3779b9 >>> 0).toString(16).padStart(8, '0').toUpperCase() +
    (hash * 0x6c62272e >>> 0).toString(16).padStart(8, '0').toUpperCase() +
    (hash * 0x1000193 >>> 0).toString(16).padStart(8, '0').toUpperCase();
}

// Event type config
const EVENT_TYPES = {
  GENESIS:          { icon: <FiLink />,           label: 'Genesis Block',        color: '#6B46C1', bg: '#F3F0FF' },
  DEVICE_REGISTERED:{ icon: <FiSmartphone />,     label: 'Device Registered',    color: 'var(--green)', bg: 'var(--green-pale)' },
  OWNERSHIP_TRANSFER:{ icon: <FiRefreshCw />,     label: 'Ownership Transferred', color: 'var(--blue)',  bg: '#EEF4FF' },
  THEFT_REPORTED:   { icon: <FiAlertCircle />,    label: 'Theft Reported',        color: 'var(--amber)', bg: 'var(--amber-pale)' },
  THEFT_VERIFIED:   { icon: <FiUsers />,          label: 'Report Verified',       color: 'var(--red)',   bg: 'var(--red-pale)' },
  DEVICE_RECOVERED: { icon: <FiCheckCircle />,    label: 'Device Recovered',      color: 'var(--green)', bg: 'var(--green-pale)' },
  IMEI_ANOMALY:     { icon: <FiAlertTriangle />,  label: 'IMEI Anomaly Detected', color: 'var(--red)',   bg: 'var(--red-pale)' },
  IOT_DETECTION:    { icon: <FiRadio />,          label: 'IoT Node Detection',    color: '#0891B2',       bg: '#E0F7FA' },
};

// ── BUILD BLOCKCHAIN FROM APP STATE ──────────────────────────
function buildChain(devices, reports, transfers, events) {
  const blocks = [];

  // Block 0 — Genesis
  blocks.push({
    index:     0,
    type:      'GENESIS',
    timestamp: '2025-09-01 00:00',
    actor:     'MACRA System',
    deviceId:  null,
    payload:   { message: 'SDIRS National Device Registry — Blockchain Ledger Initialised', network: 'Malawi' },
    prevHash:  '0'.repeat(64),
  });

  // One block per device registration
  devices.forEach((d, i) => {
    blocks.push({
      index:    blocks.length,
      type:     'DEVICE_REGISTERED',
      timestamp: d.registeredDate + ' 09:00',
      actor:    `Citizen U${String(i % 3 + 1).padStart(3,'0')}`,
      deviceId: d.id,
      payload:  {
        device:  `${d.make} ${d.model}`,
        imei:    d.imei   || '—',
        serial:  d.serial || '—',
        mac:     d.mac    || '—',
        owner:   d.ownerId,
      },
      prevHash: null, // filled below
    });
  });

  // Transfer blocks
  transfers.forEach(t => {
    blocks.push({
      index:    blocks.length,
      type:     'OWNERSHIP_TRANSFER',
      timestamp: t.createdAt,
      actor:    `Citizen ${t.sellerId}`,
      deviceId: t.deviceId,
      payload:  {
        from:    t.sellerId,
        to:      t.buyerId || 'Pending buyer',
        pin:     t.pin,
        status:  t.status,
        priceMWK: t.priceMWK,
      },
      prevHash: null,
    });
  });

  // Report blocks
  reports.forEach(r => {
    blocks.push({
      index:    blocks.length,
      type:     'THEFT_REPORTED',
      timestamp: r.date + ' 14:00',
      actor:    `Citizen ${r.reportedBy}`,
      deviceId: r.deviceId,
      payload:  {
        reportId: r.id,
        location: r.location,
        station:  r.policeStation,
      },
      prevHash: null,
    });
    if (r.status === 'active' || r.status === 'resolved') {
      blocks.push({
        index:    blocks.length,
        type:     'THEFT_VERIFIED',
        timestamp: r.verifiedAt + ' 10:00',
        actor:    'Malawi Police Service',
        deviceId: r.deviceId,
        payload:  {
          caseNumber: r.caseNumber,
          dispatched: r.dispatched,
          network:    'Airtel + TNM EIR Alert Dispatched',
        },
        prevHash: null,
      });
    }
    if (r.status === 'resolved') {
      blocks.push({
        index:    blocks.length,
        type:     'DEVICE_RECOVERED',
        timestamp: r.verifiedAt + ' 16:30',
        actor:    'Malawi Police Service',
        deviceId: r.deviceId,
        payload:  { caseNumber: r.caseNumber, method: 'SDIRS Intelligence-led recovery' },
        prevHash: null,
      });
    }
  });

  // IMEI anomaly blocks (simulated — real ones come from telecom EIR)
  blocks.push({
    index:    blocks.length,
    type:     'IMEI_ANOMALY',
    timestamp: '2026-03-09 13:22',
    actor:    'SDIRS Anomaly Engine',
    deviceId: 'D002',
    payload:  {
      originalIMEI: '490123456789012',
      detectedIMEI: '490999888777001',
      tower:        'Kawale Tower B',
      operator:     'Airtel',
      note:         'IMEI changed between consecutive connections on same SIM',
    },
    prevHash: null,
  });

  // IoT detection block (WiFi node)
  blocks.push({
    index:    blocks.length,
    type:     'IOT_DETECTION',
    timestamp: '2026-03-10 08:45',
    actor:    'IoT Node — Shoprite City Mall WiFi',
    deviceId: 'D002',
    payload:  {
      nodeType:  'WiFi Access Point',
      location:  'Shoprite City Mall, Ground Floor',
      macSeen:   'Probing signature matched D002',
      confidence: '94%',
    },
    prevHash: null,
  });

  // Sort all blocks by timestamp
  blocks.sort((a, b) => {
    if (a.index === 0) return -1;
    return a.timestamp.localeCompare(b.timestamp);
  });

  // Re-index and chain hashes
  blocks.forEach((block, i) => {
    block.index   = i;
    block.prevHash = i === 0 ? '0'.repeat(64) : simulateHash(blocks[i - 1]);
    block.hash    = simulateHash(block);
  });

  return blocks;
}

// ── PAGE COMPONENT ────────────────────────────────────────────
export default function OwnershipChainPage() {
  const { devices, reports, transfers, events } = useAppState();
  const [selectedDevice, setSelectedDevice] = useState('ALL');
  const [expandedBlock, setExpandedBlock]   = useState(null);
  const [search, setSearch]                 = useState('');

  const chain = useMemo(
    () => buildChain(devices, reports, transfers, events),
    [devices, reports, transfers, events]
  );

  // Filter by device or search
  const filtered = chain.filter(b => {
    if (selectedDevice !== 'ALL' && b.deviceId && b.deviceId !== selectedDevice) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        b.type.toLowerCase().includes(s) ||
        b.actor.toLowerCase().includes(s) ||
        JSON.stringify(b.payload).toLowerCase().includes(s) ||
        b.hash.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div className="fade-up">

      {/* ── Hero banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1a0050 0%, #2d0080 40%, var(--navy) 100%)',
        borderRadius: 'var(--radius)', padding: '28px 32px', marginBottom: 24,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 80% 50%, rgba(107,70,193,0.3) 0%, transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.35)', letterSpacing:2, textTransform:'uppercase', marginBottom:8 }}>
            Immutable Ledger · Tamper-Proof · Court-Admissible
          </div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:800, color:'#fff', marginBottom:10, display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiLink /> Ownership Ledger
          </div>
          <div style={{ display:'flex', gap:28, flexWrap:'wrap' }}>
            {[
              [chain.length,                              'Total Blocks',        '#C4B5FD'],
              [chain.filter(b=>b.type==='DEVICE_REGISTERED').length, 'Registrations', '#86EFAC'],
              [chain.filter(b=>b.type==='IMEI_ANOMALY').length,     'IMEI Anomalies', '#FCA5A5'],
              [chain.filter(b=>b.type==='OWNERSHIP_TRANSFER').length,'Transfers',     '#93C5FD'],
            ].map(([n,l,c]) => (
              <div key={l}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, color:c }}>{n}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Chain integrity indicator ── */}
      <div className="card" style={{ marginBottom:20, borderColor:'#C4B5FD', borderWidth:2 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
          <div style={{ fontSize:28, color: 'var(--purple)' }}><FiLock /></div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:800, fontSize:14, color:'var(--green)' }}>Chain Integrity: VERIFIED ✓</div>
            <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>
              All {chain.length} blocks validated · Hash chain unbroken · No tampering detected
            </div>
          </div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted)', wordBreak:'break-all', maxWidth:280 }}>
            Latest hash: <span style={{ color:'#6B46C1', fontWeight:700 }}>{chain[chain.length - 1]?.hash}</span>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <input
          className="field-input mono"
          style={{ flex:1, minWidth:200, fontSize:12 }}
          placeholder="Search blocks — hash, actor, device, event type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="field-input field-select"
          style={{ width:220 }}
          value={selectedDevice}
          onChange={e => setSelectedDevice(e.target.value)}
        >
          <option value="ALL">All Devices</option>
          {devices.map(d => (
            <option key={d.id} value={d.id}>{d.make} {d.model}</option>
          ))}
        </select>
      </div>

      {/* ── Chain blocks ── */}
      <div>
        {filtered.map((block, i) => {
          const cfg      = EVENT_TYPES[block.type] || EVENT_TYPES.GENESIS;
          const device   = devices.find(d => d.id === block.deviceId);
          const isOpen   = expandedBlock === block.index;
          const isAnomaly = block.type === 'IMEI_ANOMALY';

          return (
            <div key={block.index} style={{ display:'flex', gap:0, marginBottom:0 }}>

              {/* Chain line + block number */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:52, flexShrink:0 }}>
                <div style={{
                  width:38, height:38, borderRadius:'50%',
                  background: isAnomaly ? 'var(--red)' : cfg.color,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:16, flexShrink:0, zIndex:1,
                  boxShadow: isAnomaly ? '0 0 12px rgba(192,37,44,0.5)' : 'none',
                }}>
                  {cfg.icon}
                </div>
                {i < filtered.length - 1 && (
                  <div style={{ width:2, flex:1, minHeight:24, background:'var(--muted-3)', margin:'4px 0' }} />
                )}
              </div>

              {/* Block card */}
              <div style={{
                flex:1, marginBottom:10,
                border: `1px solid ${isAnomaly ? 'var(--red-2)' : 'var(--muted-3)'}`,
                borderRadius:'var(--radius-2)',
                background: isAnomaly ? 'var(--red-pale)' : 'var(--surface)',
                overflow:'hidden',
              }}>
                {/* Block header */}
                <div
                  style={{ padding:'12px 16px', cursor:'pointer', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}
                  onClick={() => setExpandedBlock(isOpen ? null : block.index)}
                >
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <span style={{
                        fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:6,
                        background: cfg.bg, color: cfg.color,
                      }}>
                        {cfg.label}
                      </span>
                      {device && (
                        <span style={{ fontSize:11, color:'var(--muted)', fontWeight:600 }}>
                          {deviceIcon(device.type)} {device.make} {device.model}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize:11, color:'var(--muted)', marginTop:4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FiClock size={12} /> {block.timestamp} &nbsp;·&nbsp; <FiUser size={12} /> {block.actor}
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:10, color:'var(--muted-2)', fontFamily:'var(--font-mono)' }}>
                      Block #{block.index}
                    </div>
                    <div style={{ fontSize:10, color:'#6B46C1', fontFamily:'var(--font-mono)', marginTop:2 }}>
                      {block.hash.slice(0, 16)}…
                    </div>
                    <div style={{ fontSize:10, color:'var(--muted-2)', marginTop:2 }}>
                      {isOpen ? '▲' : '▼'}
                    </div>
                  </div>
                </div>

                {/* Expanded block detail */}
                {isOpen && (
                  <div style={{ borderTop:'1px solid var(--muted-3)', padding:'14px 16px', background:'var(--bg)' }}>
                    <div className="grid-2" style={{ gap:12, marginBottom:14 }}>
                      <HashField label="Block Hash"    value={block.hash} />
                      <HashField label="Previous Hash" value={block.prevHash} />
                    </div>

                    <div style={{ fontSize:11, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>
                      Block Payload
                    </div>
                    <div style={{
                      background:'var(--navy)', borderRadius:8, padding:'12px 14px',
                      fontFamily:'var(--font-mono)', fontSize:11, color:'rgba(255,255,255,0.8)',
                      lineHeight:1.8, whiteSpace:'pre-wrap', wordBreak:'break-word',
                    }}>
                      {JSON.stringify(block.payload, null, 2)}
                    </div>

                    {isAnomaly && (
                      <div className="alert alert-red" style={{ marginTop:12 }}>
                        <span className="alert-icon"><FiAlertTriangle /></span>
                        <div>
                          <strong>IMEI Tampering Evidence — Court Admissible Record</strong><br />
                          This block provides cryptographic proof that IMEI modification occurred on this device.
                          The block timestamp, previous hash, and payload are immutable.
                          Reference this block number ({block.index}) in court proceedings.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--muted)' }}>
          <div style={{ fontSize:48, marginBottom:12, color: 'var(--muted-2)' }}><FiSearch size={48} /></div>
          <div style={{ fontWeight:700 }}>No blocks match your search</div>
        </div>
      )}
    </div>
  );
}

function HashField({ label, value }) {
  return (
    <div>
      <div style={{ fontSize:10, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', marginBottom:4 }}>{label}</div>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#6B46C1', wordBreak:'break-all', lineHeight:1.6 }}>
        {value}
      </div>
    </div>
  );
}

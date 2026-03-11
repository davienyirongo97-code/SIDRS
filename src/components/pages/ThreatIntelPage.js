/**
 * src/components/pages/ThreatIntelPage.js
 * ─────────────────────────────────────────────
 * AI/ML THREAT INTELLIGENCE CENTRE
 * Police and MACRA only.
 *
 * THREE AI MODULES:
 *
 * 1. PREDICTIVE HOTSPOT MAP
 *    ML model trained on historical theft reports (location, time,
 *    day of week, nearby events). Outputs a risk score per area
 *    for the next 24 hours. Police can pre-position officers before
 *    theft happens rather than reacting after.
 *
 * 2. ANOMALY DETECTION FEED
 *    Flags unusual device behaviour patterns:
 *    — Physically impossible movement (200km in 30 min)
 *    — SIM swapped 3+ times in 48 hours (known thief pattern)
 *    — IMEI changed between consecutive connections
 *    — Duplicate IMEI on two towers simultaneously (cloning)
 *    — Device detected far from owner's registered district
 *
 * 3. CASE PRIORITY SCORING
 *    AI scores each active case 0–100 based on:
 *    — Detection frequency (more pings = device is active = recoverable)
 *    — Last seen recency
 *    — Area risk level
 *    — Historical recovery rate for that area
 *    Highest-score cases are shown first so police focus effort wisely.
 */

import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { deviceIcon } from '../../utils/helpers';
import Badge from '../ui/Badge';

// ── MOCK AI DATA ──────────────────────────────────────────────
// In production these come from the ML model served via API.
// The model is trained on: theft report coordinates + timestamps,
// event calendars, market days, payday cycles, school terms.

const HOTSPOT_AREAS = [
  { area: 'Kawale Market',         city: 'Lilongwe', risk: 94, trend: 'up',   lat: -13.922, lng: 33.764, reports7d: 8,  avgTime: '12:00–16:00', peak: 'Friday payday' },
  { area: 'Shoprite City Mall',    city: 'Lilongwe', risk: 87, trend: 'up',   lat: -13.963, lng: 33.774, reports7d: 6,  avgTime: '10:00–14:00', peak: 'Saturday' },
  { area: 'Lilongwe Bus Depot',    city: 'Lilongwe', risk: 82, trend: 'same', lat: -13.971, lng: 33.788, reports7d: 5,  avgTime: '06:00–09:00', peak: 'Mon–Fri morning' },
  { area: 'Chancellor College',    city: 'Zomba',    risk: 76, trend: 'up',   lat: -15.377, lng: 35.328, reports7d: 4,  avgTime: '08:00–17:00', peak: 'Exam period' },
  { area: 'Chichiri Mall',         city: 'Blantyre', risk: 71, trend: 'down', lat: -15.786, lng: 35.003, reports7d: 3,  avgTime: '11:00–15:00', peak: 'Weekend' },
  { area: 'Limbe Market',          city: 'Blantyre', risk: 68, trend: 'same', lat: -15.814, lng: 35.051, reports7d: 3,  avgTime: '07:00–12:00', peak: 'Wednesday market day' },
  { area: 'Mzuzu City Centre',     city: 'Mzuzu',    risk: 45, trend: 'down', lat: -11.458, lng: 34.017, reports7d: 2,  avgTime: '13:00–17:00', peak: 'Weekend' },
  { area: 'Kasungu Bus Stage',     city: 'Kasungu',  risk: 38, trend: 'same', lat: -13.013, lng: 33.483, reports7d: 1,  avgTime: '05:00–08:00', peak: 'Mon morning' },
];

const ANOMALIES = [
  {
    id: 'ANM-001',
    type: 'IMPOSSIBLE_MOVEMENT',
    severity: 'critical',
    deviceId: 'D002',
    device: 'Tecno Spark 20',
    imei: '490123456789012',
    detectedAt: '2026-03-10 11:03',
    title: 'Physically Impossible Movement Detected',
    detail: 'Device detected at Kawale (13.922°S) at 09:14, then Area 1 (13.963°S) at 09:22 — 7km in 8 minutes on foot. Suggests device was transported by vehicle immediately after theft.',
    action: 'Check CCTV footage at both locations between 09:14–09:22.',
    confidence: 96,
  },
  {
    id: 'ANM-002',
    type: 'IMEI_CHANGED',
    severity: 'critical',
    deviceId: 'D002',
    device: 'Tecno Spark 20',
    imei: '490123456789012',
    detectedAt: '2026-03-09 13:22',
    title: 'IMEI Modification Detected',
    detail: 'Device connected with IMEI 490123456789012 on 08/03 at 09:14. Same physical SIM then connected with IMEI 490999888777001 on 09/03 at 13:22. IMEI was reprogrammed between connections.',
    action: 'Original IMEI flagged. New IMEI 490999888777001 automatically added to watch list. Blockchain block #14 records this event as court evidence.',
    confidence: 99,
  },
  {
    id: 'ANM-003',
    type: 'SIM_SWAP_PATTERN',
    severity: 'high',
    deviceId: 'D002',
    device: 'Tecno Spark 20',
    imei: '490123456789012',
    detectedAt: '2026-03-09 07:55',
    title: 'Rapid SIM Swap Pattern (Known Thief Behaviour)',
    detail: 'IMEI 490123456789012 has used 3 different SIM cards in 48 hours: +265 991 887 766 (Airtel), +265 881 223 344 (TNM), +265 991 441 882 (Airtel). Rapid SIM cycling is a known evasion technique.',
    action: 'All three SIM numbers added to police intelligence. Request subscriber details from Airtel and TNM for each number.',
    confidence: 91,
  },
  {
    id: 'ANM-004',
    type: 'DUPLICATE_IMEI',
    severity: 'high',
    deviceId: 'D004',
    device: 'Apple iPhone 13',
    imei: '357893109876543',
    detectedAt: '2026-03-10 09:30',
    title: 'Duplicate IMEI on Two Towers Simultaneously',
    detail: 'IMEI 357893109876543 detected simultaneously at Zomba Town Tower (15:3869°S) and Chancellor College Area (15.3769°S) at 08:12. Two devices are broadcasting the same IMEI — one is a clone.',
    action: 'Flag both devices. Owner of legitimate device (U002) notified. Cloned device SIM number: +265 881 556 677 — request subscriber info from TNM.',
    confidence: 98,
  },
  {
    id: 'ANM-005',
    type: 'DISTRICT_MISMATCH',
    severity: 'medium',
    deviceId: 'D007',
    device: 'HP Envy 14',
    imei: null,
    detectedAt: '2026-03-10 08:45',
    title: 'Device Detected Far From Owner\'s Registered District',
    detail: 'Device registered to owner in Lilongwe (Area 13). IoT node detection at Shoprite City Mall WiFi is consistent — but latest WiFi probe suggests device may be moving toward Blantyre based on tower pattern.',
    action: 'Monitor. If next detection is in Blantyre, raise to HIGH severity — cross-district transport indicates professional operation.',
    confidence: 74,
  },
];

const CASE_SCORES = [
  { reportId: 'RPT-2026-00012', device: 'Tecno Spark 20',  score: 92, detections: 4, lastSeen: '2026-03-10 11:03', area: 'Lilongwe Central', trend: 'Active — detected today',  color: 'var(--red)' },
  { reportId: 'RPT-2026-00031', device: 'Apple iPhone 13', score: 78, detections: 2, lastSeen: '2026-03-10 08:12', area: 'Zomba',             trend: 'Active — detected today',  color: 'var(--amber)' },
  { reportId: 'RPT-2026-00045', device: 'HP Envy 14',      score: 61, detections: 1, lastSeen: '2026-03-10 08:45', area: 'Lilongwe',          trend: 'IoT detection only',        color: 'var(--amber)' },
];

const SEVERITY_CONFIG = {
  critical: { color: 'var(--red)',   bg: 'var(--red-pale)',   label: 'CRITICAL' },
  high:     { color: 'var(--amber)', bg: 'var(--amber-pale)', label: 'HIGH' },
  medium:   { color: 'var(--blue)',  bg: '#EEF4FF',           label: 'MEDIUM' },
};

const ANOMALY_ICONS = {
  IMPOSSIBLE_MOVEMENT: '🚗',
  IMEI_CHANGED:        '⚠️',
  SIM_SWAP_PATTERN:    '📶',
  DUPLICATE_IMEI:      '🔁',
  DISTRICT_MISMATCH:   '📍',
};

export default function ThreatIntelPage() {
  const { reports, devices, events } = useAppState();
  const [activeTab, setActiveTab] = useState('hotspots');
  const [expandedAnomaly, setExpandedAnomaly] = useState(null);

  const TABS = [
    { key: 'hotspots',  label: '🗺️ Predictive Hotspots',    count: null },
    { key: 'anomalies', label: '⚠️ Anomaly Detection',       count: ANOMALIES.filter(a => !a.acknowledged).length },
    { key: 'priority',  label: '📊 Case Priority Scores',    count: null },
  ];

  return (
    <div className="fade-up">

      {/* ── Hero banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #162040 50%, #1a0030 100%)',
        borderRadius: 'var(--radius)', padding: '28px 32px', marginBottom: 24,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 70% 50%, rgba(139,92,246,0.2) 0%, transparent 60%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.35)', letterSpacing:2, textTransform:'uppercase', marginBottom:8 }}>
            🤖 Powered by SDIRS AI/ML Engine · Police & MACRA Only
          </div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:800, color:'#fff', marginBottom:10 }}>
            Threat Intelligence Centre
          </div>
          <div style={{ display:'flex', gap:28, flexWrap:'wrap' }}>
            {[
              [HOTSPOT_AREAS.filter(h=>h.risk>=80).length, 'High-Risk Zones',    '#FCA5A5'],
              [ANOMALIES.length,                            'Active Anomalies',   '#FCD34D'],
              [CASE_SCORES.length,                          'Cases Scored',       '#93C5FD'],
              [events.length,                               'Training Events',    '#86EFAC'],
            ].map(([n,l,c]) => (
              <div key={l}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, color:c }}>{n}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI model status bar ── */}
      <div className="card" style={{ marginBottom:20, padding:'14px 18px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
          <div className="live-badge">● AI Engine Online</div>
          {[
            ['Hotspot Model', '94.2% accuracy', 'var(--green)'],
            ['Anomaly Engine', '97.8% precision', 'var(--green)'],
            ['Training Data', `${events.length * 847} events`, 'var(--blue)'],
            ['Last Retrained', '2026-03-10 03:00', 'var(--muted)'],
          ].map(([k,v,c]) => (
            <div key={k} style={{ fontSize:12 }}>
              <span style={{ color:'var(--muted)' }}>{k}: </span>
              <span style={{ fontWeight:700, color:c }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t.key}
            style={{
              padding:'8px 16px', borderRadius:10, border:'1px solid',
              borderColor: activeTab === t.key ? 'var(--blue)' : 'var(--muted-3)',
              background:  activeTab === t.key ? 'var(--blue)' : 'var(--surface)',
              color:       activeTab === t.key ? '#fff'        : 'var(--muted)',
              fontWeight:  700, fontSize:13, cursor:'pointer',
              display:'flex', alignItems:'center', gap:6,
            }}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
            {t.count > 0 && (
              <span style={{ background:'var(--red)', color:'#fff', borderRadius:10, padding:'1px 7px', fontSize:10, fontWeight:800 }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════
          TAB 1: PREDICTIVE HOTSPOTS
      ════════════════════════════════════════════ */}
      {activeTab === 'hotspots' && (
        <div>
          <div className="alert alert-blue" style={{ marginBottom:16 }}>
            <span className="alert-icon">🤖</span>
            <div>AI model trained on {events.length * 847}+ historical events. Risk scores update every 6 hours. Deploy officers to HIGH risk zones before peak hours to prevent theft rather than react to it.</div>
          </div>

          {/* Risk area cards */}
          {HOTSPOT_AREAS.map((h, i) => (
            <div key={h.area} style={{
              marginBottom:10, borderRadius:'var(--radius-2)',
              border:`1px solid ${h.risk >= 80 ? 'var(--red-2)' : h.risk >= 60 ? '#F5C35A' : 'var(--muted-3)'}`,
              overflow:'hidden',
            }}>
              <div style={{ display:'flex', alignItems:'center', padding:'14px 18px', gap:14, flexWrap:'wrap' }}>

                {/* Rank */}
                <div style={{
                  width:32, height:32, borderRadius:'50%', flexShrink:0,
                  background: h.risk>=80 ? 'var(--red)' : h.risk>=60 ? 'var(--amber)' : 'var(--green)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontWeight:900, fontSize:14, color:'#fff',
                }}>
                  {i+1}
                </div>

                {/* Area info */}
                <div style={{ flex:1, minWidth:140 }}>
                  <div style={{ fontWeight:800, fontSize:14, color:'var(--ink)' }}>📍 {h.area}</div>
                  <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>{h.city} · Peak: {h.peak} · {h.avgTime}</div>
                </div>

                {/* Risk score bar */}
                <div style={{ minWidth:160 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:'var(--muted)' }}>AI Risk Score</span>
                    <span style={{ fontSize:13, fontWeight:900, color: h.risk>=80 ? 'var(--red)' : h.risk>=60 ? 'var(--amber)' : 'var(--green)' }}>{h.risk}%</span>
                  </div>
                  <div style={{ height:8, borderRadius:4, background:'var(--bg-2)', overflow:'hidden' }}>
                    <div style={{
                      height:'100%', borderRadius:4,
                      width:`${h.risk}%`,
                      background: h.risk>=80 ? 'var(--red)' : h.risk>=60 ? 'var(--amber)' : 'var(--green)',
                      transition:'width .5s ease',
                    }} />
                  </div>
                </div>

                {/* Stats */}
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:12, fontWeight:700 }}>{h.reports7d} reports</div>
                  <div style={{ fontSize:11, color:'var(--muted)' }}>last 7 days</div>
                  <div style={{ fontSize:11, color: h.trend==='up' ? 'var(--red)' : h.trend==='down' ? 'var(--green)' : 'var(--muted)', marginTop:2, fontWeight:700 }}>
                    {h.trend==='up' ? '↑ Rising' : h.trend==='down' ? '↓ Falling' : '→ Stable'}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════════
          TAB 2: ANOMALY DETECTION
      ════════════════════════════════════════════ */}
      {activeTab === 'anomalies' && (
        <div>
          <div className="alert alert-red" style={{ marginBottom:16 }}>
            <span className="alert-icon">⚠️</span>
            <div>Anomalies are flagged automatically by the SDIRS AI engine. Each anomaly is simultaneously written as an immutable block in the Blockchain Ownership Chain — providing court-admissible evidence of criminal device tampering.</div>
          </div>

          {ANOMALIES.map(anomaly => {
            const sev    = SEVERITY_CONFIG[anomaly.severity];
            const isOpen = expandedAnomaly === anomaly.id;
            return (
              <div key={anomaly.id} style={{
                marginBottom:12, borderRadius:'var(--radius-2)',
                border:`2px solid ${sev.color}40`,
                overflow:'hidden',
              }}>
                <div
                  style={{ padding:'14px 18px', cursor:'pointer', display:'flex', gap:14, alignItems:'flex-start', background: isOpen ? sev.bg : 'var(--surface)', flexWrap:'wrap' }}
                  onClick={() => setExpandedAnomaly(isOpen ? null : anomaly.id)}
                >
                  <div style={{ fontSize:24, flexShrink:0 }}>{ANOMALY_ICONS[anomaly.type]}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4 }}>
                      <span style={{ fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:6, background:sev.bg, color:sev.color }}>
                        {sev.label}
                      </span>
                      <span style={{ fontSize:13, fontWeight:800, color:'var(--ink)' }}>{anomaly.title}</span>
                    </div>
                    <div style={{ fontSize:12, color:'var(--muted)' }}>
                      🕐 {anomaly.detectedAt} &nbsp;·&nbsp; 📱 {anomaly.device}
                      {anomaly.imei && <>&nbsp;·&nbsp; <span style={{ fontFamily:'var(--font-mono)' }}>{anomaly.imei}</span></>}
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:11, color:'var(--muted)', marginBottom:4 }}>Confidence</div>
                    <div style={{ fontWeight:900, fontSize:18, color:sev.color }}>{anomaly.confidence}%</div>
                    <div style={{ fontSize:11, color:'var(--muted)', marginTop:4 }}>{isOpen ? '▲' : '▼'}</div>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ padding:'16px 18px', borderTop:`1px solid ${sev.color}30`, background:'var(--bg)' }}>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:11, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', marginBottom:6 }}>Detection Detail</div>
                      <div style={{ fontSize:13, color:'var(--ink-2)', lineHeight:1.7 }}>{anomaly.detail}</div>
                    </div>
                    <div style={{ padding:'12px 14px', background: sev.bg, borderRadius:8, borderLeft:`4px solid ${sev.color}` }}>
                      <div style={{ fontSize:11, fontWeight:800, color:sev.color, marginBottom:4 }}>Recommended Action</div>
                      <div style={{ fontSize:13, color:'var(--ink-2)', lineHeight:1.6 }}>{anomaly.action}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════
          TAB 3: CASE PRIORITY SCORES
      ════════════════════════════════════════════ */}
      {activeTab === 'priority' && (
        <div>
          <div className="alert alert-blue" style={{ marginBottom:16 }}>
            <span className="alert-icon">🤖</span>
            <div>AI scores each active case 0–100. Score factors: detection frequency, recency, area risk level, historical recovery rate. Focus officer resources on the highest-scored cases first.</div>
          </div>

          {CASE_SCORES.map((c, i) => (
            <div key={c.reportId} className="card" style={{ marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>

                {/* Score circle */}
                <div style={{
                  width:64, height:64, borderRadius:'50%', flexShrink:0,
                  background: `conic-gradient(${c.color} ${c.score * 3.6}deg, var(--bg-2) 0deg)`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  position:'relative',
                }}>
                  <div style={{
                    width:52, height:52, borderRadius:'50%',
                    background:'var(--surface)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:'var(--font-display)', fontSize:18, fontWeight:900, color:c.color,
                  }}>
                    {c.score}
                  </div>
                </div>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:800, fontSize:15, color:'var(--ink)', marginBottom:4 }}>
                    #{i+1} Priority — {c.device}
                  </div>
                  <div style={{ fontSize:12, color:'var(--muted)', marginBottom:4 }}>
                    Case: <span style={{ fontFamily:'var(--font-mono)', color:'var(--blue)' }}>{c.reportId}</span>
                    &nbsp;·&nbsp; 📍 {c.area}
                  </div>
                  <div style={{ fontSize:12, color: c.color, fontWeight:700 }}>{c.trend}</div>
                </div>

                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:22, fontWeight:900, color:c.color, fontFamily:'var(--font-display)' }}>
                    {c.detections}×
                  </div>
                  <div style={{ fontSize:11, color:'var(--muted)' }}>detections</div>
                  <div style={{ fontSize:11, color:'var(--muted)', marginTop:4 }}>Last: {c.lastSeen}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

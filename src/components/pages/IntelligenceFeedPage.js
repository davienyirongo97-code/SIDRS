/**
 * src/components/pages/IntelligenceFeedPage.js
 * ─────────────────────────────────────────────
 * Network & IoT Intelligence Feed.
 *
 * TWO DETECTION LAYERS:
 *
 * 1. TELECOM EIR EVENTS (existing)
 *    Airtel and TNM report when a stolen IMEI connects to a tower.
 *    Coverage: everywhere there is mobile signal (national).
 *    Precision: ±350–700m radius per tower.
 *
 * 2. IoT NODE DETECTIONS (new)
 *    WiFi access points and BLE beacons deployed at key locations
 *    report when a stolen device's MAC address or WiFi probe
 *    signature is detected.
 *    Coverage: malls, markets, universities, bus depots, borders.
 *    Precision: ±5–30m (WiFi) or ±30m (BLE beacon).
 *
 *    Node types:
 *    — WiFi AP (Access Point): detects MAC address probing
 *    — BLE Beacon: detects Bluetooth device presence
 *    — Campus Node: university/school WiFi controllers
 *    — Border Node: Malawi Immigration Authority checkpoints
 */

import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import StatCard from '../ui/StatCard';
import {
  FiWifi,
  FiBluetooth,
  FiBookOpen,
  FiShield,
  FiRadio,
  FiMap,
  FiAlertCircle,
  FiInfo,
  FiSmartphone,
} from 'react-icons/fi';
import MalawiMap from '../ui/MalawiMap';

// ── MOCK IoT NODE DATA ────────────────────────────────────────
const IOT_NODES = [
  {
    id: 'IOT-001',
    name: 'Shoprite City Mall WiFi',
    type: 'WiFi AP',
    location: 'City Mall, Lilongwe',
    status: 'online',
    detections: 3,
    latitude: -13.96,
    longitude: 33.77,
  },
  {
    id: 'IOT-002',
    name: 'Kawale Market BLE Grid',
    type: 'BLE Beacon',
    location: 'Kawale Market, Lilongwe',
    status: 'online',
    detections: 7,
    latitude: -13.92,
    longitude: 33.76,
  },
  {
    id: 'IOT-003',
    name: 'Chancellor College WiFi',
    type: 'Campus Node',
    location: 'UNIMA, Zomba',
    status: 'online',
    detections: 2,
    latitude: -15.38,
    longitude: 35.33,
  },
  {
    id: 'IOT-004',
    name: 'Lilongwe Bus Depot BLE',
    type: 'BLE Beacon',
    location: 'Bus Depot, Lilongwe',
    status: 'online',
    detections: 4,
    latitude: -13.97,
    longitude: 33.78,
  },
  {
    id: 'IOT-005',
    name: 'Chichiri Mall WiFi',
    type: 'WiFi AP',
    location: 'Chichiri Mall, Blantyre',
    status: 'online',
    detections: 1,
    latitude: -15.8,
    longitude: 35.02,
  },
  {
    id: 'IOT-006',
    name: 'Mchinji Border Post',
    type: 'Border Node',
    location: 'Mchinji Border, Mchinji',
    status: 'online',
    detections: 0,
    latitude: -13.8,
    longitude: 32.89,
  },
  {
    id: 'IOT-007',
    name: 'Karonga Border Post',
    type: 'Border Node',
    location: 'Karonga Border, Karonga',
    status: 'offline',
    detections: 0,
    latitude: -9.93,
    longitude: 33.93,
  },
  {
    id: 'IOT-008',
    name: 'Polytechnic WiFi',
    type: 'Campus Node',
    location: 'Malawi Poly, Blantyre',
    status: 'online',
    detections: 1,
    latitude: -15.79,
    longitude: 35.01,
  },
];

const IOT_EVENTS = [
  {
    id: 'IOT-EVT-001',
    nodeId: 'IOT-001',
    nodeName: 'Shoprite City Mall WiFi',
    deviceId: 'D002',
    device: 'Tecno Spark 20',
    detectedAt: '2026-03-10 08:45',
    method: 'MAC probe match',
    confidence: 94,
    precision: '±8m',
    floor: 'Ground Floor, near electronics section',
  },
  {
    id: 'IOT-EVT-002',
    nodeId: 'IOT-002',
    nodeName: 'Kawale Market BLE Grid',
    deviceId: 'D002',
    device: 'Tecno Spark 20',
    detectedAt: '2026-03-08 09:22',
    method: 'BLE proximity',
    confidence: 87,
    precision: '±25m',
    floor: 'Near northern entrance, electronics stalls',
  },
  {
    id: 'IOT-EVT-003',
    nodeId: 'IOT-003',
    nodeName: 'Chancellor College WiFi',
    deviceId: 'D004',
    device: 'Apple iPhone 13',
    detectedAt: '2026-03-10 07:55',
    method: 'WiFi probe fingerprint',
    confidence: 91,
    precision: '±12m',
    floor: 'Library Building, 1st Floor',
  },
  {
    id: 'IOT-EVT-004',
    nodeId: 'IOT-004',
    nodeName: 'Lilongwe Bus Depot BLE',
    deviceId: 'D007',
    device: 'HP Envy 14',
    detectedAt: '2026-03-09 06:44',
    method: 'BLE proximity',
    confidence: 79,
    precision: '±30m',
    floor: 'Departure bay, southbound coaches',
  },
];

const NODE_TYPE_CONFIG = {
  'WiFi AP': { icon: <FiWifi size={18} />, color: 'var(--blue)', bg: '#EEF4FF' },
  'BLE Beacon': { icon: <FiBluetooth size={18} />, color: '#0891B2', bg: '#E0F7FA' },
  'Campus Node': { icon: <FiBookOpen size={18} />, color: 'var(--green)', bg: 'var(--green-pale)' },
  'Border Node': { icon: <FiShield size={18} />, color: 'var(--amber)', bg: 'var(--amber-pale)' },
};

export default function IntelligenceFeedPage() {
  const events = useAppStore((state) => state.events);
  const reports = useAppStore((state) => state.reports);
  const devices = useAppStore((state) => state.devices);
  const [activeTab, setActiveTab] = useState('telecom');
  const [hoveredId, setHoveredId] = useState(null);

  const iotTotal = IOT_EVENTS.length;
  const nodesOnline = IOT_NODES.filter((n) => n.status === 'online').length;

  return (
    <div className="fade-up">
      {/* ── Stats ── */}
      <div className="grid-stat" style={{ marginBottom: 20 }}>
        <StatCard
          icon={<FiRadio />}
          value={events.length}
          label="Telecom Events"
          sub="Airtel + TNM tower pings"
          color="var(--blue)"
        />
        <StatCard
          icon={<FiWifi />}
          value={iotTotal}
          label="IoT Detections"
          sub="WiFi + BLE node matches"
          color="#0891B2"
        />
        <StatCard
          icon={<FiMap />}
          value={nodesOnline}
          label="Active IoT Nodes"
          sub={`${IOT_NODES.length} total deployed`}
          color="var(--green)"
        />
        <StatCard
          icon={<FiAlertCircle />}
          value={reports.filter((r) => r.status === 'active').length}
          label="Monitored Devices"
          sub="On EIR Grey List"
          color="var(--red)"
        />
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          {
            key: 'telecom',
            label: 'Telecom EIR Events',
            icon: <FiRadio size={13} />,
            count: events.length,
          },
          { key: 'iot', label: 'IoT Node Detections', icon: <FiWifi size={13} />, count: iotTotal },
          { key: 'nodes', label: 'Node Status Map', icon: <FiMap size={13} />, count: null },
        ].map((t) => (
          <button
            key={t.key}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: '1px solid',
              borderColor: activeTab === t.key ? 'var(--blue)' : 'var(--muted-3)',
              background: activeTab === t.key ? 'var(--blue)' : 'var(--surface)',
              color: activeTab === t.key ? '#fff' : 'var(--muted)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
            onClick={() => setActiveTab(t.key)}
          >
            {t.icon} {t.label}
            {t.count > 0 && (
              <span
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  borderRadius: 10,
                  padding: '1px 7px',
                  fontSize: 10,
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ════════════════ TELECOM TAB ════════════════ */}
      {activeTab === 'telecom' && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24 }}>
          <div className="card" style={{ height: 620, overflowY: 'auto' }}>
            <div
              className="card-title"
              style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <FiRadio size={14} /> Tower Detection Timeline
            </div>
            <div className="timeline">
              {events
                .slice()
                .reverse()
                .map((ev, i, arr) => {
                  const report = reports.find((r) => r.id === ev.reportId);
                  const device = devices.find((d) => d.id === report?.deviceId);
                  return (
                    <div
                      className="timeline-item"
                      key={ev.id}
                      onMouseEnter={() => setHoveredId(ev.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{
                        cursor: 'pointer',
                        padding: '10px',
                        borderRadius: 8,
                        background: hoveredId === ev.id ? 'var(--bg)' : 'transparent',
                        transition: 'background 0.2s',
                      }}
                    >
                      {i < arr.length - 1 && <div className="timeline-line" />}
                      <div
                        className="timeline-dot"
                        style={{
                          background: ev.operator === 'Airtel' ? 'var(--red)' : 'var(--blue)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FiRadio size={10} />
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-title">
                          {device ? `${device.make} ${device.model}` : 'Unknown Device'} ·{' '}
                          <span
                            style={{
                              color: ev.operator === 'Airtel' ? 'var(--red)' : 'var(--blue)',
                            }}
                          >
                            {ev.operator}
                          </span>
                        </div>
                        <div className="timeline-sub">
                          {ev.detectedAt} · {ev.tower}
                          <br />
                          SIM:{' '}
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{ev.activeSim}</span>
                          <br />
                          {ev.latitude.toFixed(4)}°S, {ev.longitude.toFixed(4)}°E
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <MalawiMap points={events} type="movement" />
        </div>
      )}

      {/* ════════════════ IoT TAB ════════════════ */}
      {activeTab === 'iot' && (
        <div>
          <div className="alert alert-blue" style={{ marginBottom: 20 }}>
            <span className="alert-icon">
              <FiInfo />
            </span>
            <div>
              <strong>How IoT Detection Works:</strong> SDIRS agents installed on partner WiFi
              routers and BLE beacons continuously scan for stolen device MAC addresses and WiFi
              probe signatures. When a match is found, an event is sent to SDIRS with precise
              location — down to ±5m indoors. This works even when the stolen device's SIM has been
              removed.
            </div>
          </div>

          {IOT_EVENTS.map((ev) => {
            const nodeCfg =
              NODE_TYPE_CONFIG[IOT_NODES.find((n) => n.id === ev.nodeId)?.type] ||
              NODE_TYPE_CONFIG['WiFi AP'];
            return (
              <div
                key={ev.id}
                style={{
                  marginBottom: 12,
                  borderRadius: 'var(--radius-2)',
                  border: `1px solid ${nodeCfg.color}40`,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '16px 18px',
                    display: 'flex',
                    gap: 14,
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Node icon */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      flexShrink: 0,
                      background: nodeCfg.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                    }}
                  >
                    {nodeCfg.icon}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Node name + confidence */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--ink)' }}>
                        {ev.nodeName}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: nodeCfg.bg,
                          color: nodeCfg.color,
                        }}
                      >
                        {IOT_NODES.find((n) => n.id === ev.nodeId)?.type}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background:
                            ev.confidence >= 90 ? 'var(--green-pale)' : 'var(--amber-pale)',
                          color: ev.confidence >= 90 ? 'var(--green)' : 'var(--amber)',
                        }}
                      >
                        {ev.confidence}% confidence
                      </span>
                    </div>

                    {/* Device info */}
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--ink-2)',
                        marginBottom: 4,
                      }}
                    >
                      <FiSmartphone size={12} /> {ev.device} detected
                    </div>

                    {/* Detection details */}
                    <div className="grid-2" style={{ gap: 10, marginTop: 8 }}>
                      {[
                        ['Detected At', ev.detectedAt],
                        ['Precision', ev.precision],
                        ['Method', ev.method],
                        ['Location', ev.floor],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700 }}>
                            {k}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: 'var(--ink-2)',
                              marginTop: 2,
                            }}
                          >
                            {v}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Precision indicator */}
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>
                      Precision
                    </div>
                    <div style={{ fontWeight: 900, fontSize: 18, color: nodeCfg.color }}>
                      {ev.precision}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                      vs ±500m tower
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════ NODES TAB ════════════════ */}
      {activeTab === 'nodes' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              {nodesOnline} of {IOT_NODES.length} nodes online · Last sync: 2026-03-11 06:00
            </div>
            <button className="btn btn-primary btn-sm">+ Add Node</button>
          </div>

          <div
            style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 380px', gap: 24 }}
          >
            {/* National Overview Map */}
            <MalawiMap points={IOT_NODES} type="nodes" />

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                maxHeight: 600,
                overflowY: 'auto',
              }}
            >
              {IOT_NODES.map((node) => {
                const cfg = NODE_TYPE_CONFIG[node.type] || NODE_TYPE_CONFIG['WiFi AP'];
                return (
                  <div
                    key={node.id}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-2)',
                      border: `1px solid ${node.status === 'online' ? cfg.color + '40' : 'var(--muted-3)'}`,
                      background: 'var(--surface)',
                      opacity: node.status === 'offline' ? 0.6 : 1,
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: node.status === 'online' ? cfg.bg : 'var(--bg-2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 16,
                        }}
                      >
                        {cfg.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>
                          {node.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                          {node.location}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 20,
                          background:
                            node.status === 'online' ? 'var(--green-pale)' : 'var(--red-pale)',
                          color: node.status === 'online' ? 'var(--green)' : 'var(--red)',
                        }}
                      >
                        {node.status === 'online' ? '● Online' : '● Offline'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--muted)' }}>
                        Type: <strong style={{ color: cfg.color }}>{node.type}</strong>
                      </span>
                      <span style={{ color: 'var(--muted)' }}>
                        Hits: <strong style={{ color: 'var(--ink)' }}>{node.detections}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="alert alert-green" style={{ marginTop: 20 }}>
            <span className="alert-icon">
              <FiInfo />
            </span>
            <div style={{ fontSize: 12 }}>
              <strong>Expand the network:</strong> Any institution can become an SDIRS IoT node by
              installing the SDIRS agent on their existing WiFi router. Free for schools and
              universities. MACRA handles the integration.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

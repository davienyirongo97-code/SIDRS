/**
 * src/components/ui/MalawiMap.js
 * ─────────────────────────────────────────────
 * Interactive Mapbox GL JS map of Malawi for SDIRS Intelligence.
 */

import React, { useState } from 'react';
import Map, { Marker, Source, Layer, NavigationControl } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { FiWifi, FiBluetooth, FiRadio, FiAlertCircle } from 'react-icons/fi';

export default function MalawiMap({ points = [], type = 'events' }) {
  const [hovered, setHovered] = useState(null);
  const [selectedReportId, setSelectedReportId] = useState(null);

  const initialViewState = {
    longitude: 34.3015,
    latitude: -13.2543,
    zoom: type === 'hotspots' ? 6 : 5.5,
    pitch: 0,
    bearing: 0
  };

  const groupedPoints = points.reduce((acc, p) => {
    const key = p.reportId || 'default';
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  const activeReport = hovered || (selectedReportId ? points.find(p => p.reportId === selectedReportId) : points[points.length - 1]);

  // Generate GeoJSON lines
  const lineSources = Object.entries(groupedPoints).map(([reportId, pts]) => {
    if (pts.length < 2) return null;
    const sortedPts = [...pts].sort((a, b) => new Date(a.detectedAt || 0) - new Date(b.detectedAt || 0));
    const coordinates = sortedPts.map(p => [p.longitude, p.latitude]);
    
    const isActive = hovered?.reportId === reportId || selectedReportId === reportId;
    const isDimmed = selectedReportId && selectedReportId !== reportId && !hovered?.reportId;

    return {
      id: reportId,
      isActive,
      isDimmed,
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates
        }
      }
    };
  }).filter(Boolean);

  const getIcon = (networkType, pType) => {
    if (pType === 'anomaly') {
      if (networkType === 'IMPOSSIBLE_MOVEMENT') return <FiRadio size={14} />; // Using Radio as a fallback/indicator
      return <FiAlertCircle size={14} />;
    }
    if (networkType?.includes('WiFi')) return <FiWifi size={14} />;
    if (networkType?.includes('BLE')) return <FiBluetooth size={14} />;
    return <FiRadio size={14} />;
  };

  // GeoJSON for Heatmap
  const heatmapData = {
    type: 'FeatureCollection',
    features: type === 'hotspots' ? points.map(p => ({
      type: 'Feature',
      properties: { risk: p.risk || 0 },
      geometry: { type: 'Point', coordinates: [p.lng || p.longitude, p.lat || p.latitude] }
    })) : []
  };

  return (
    <div className="map-container card" style={{ padding: 0, overflow: 'hidden', height: 620, position: 'relative', display: 'flex' }}>
      
      {/* ── Visual Map Area ── */}
      <div style={{ flex: 1, position: 'relative', background: 'var(--surface)', borderRight: '1px solid var(--muted-3)' }}>
        <div className="map-overlay-header" style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'var(--bg)', opacity: 0.9, backdropFilter: 'blur(8px)', padding: '10px 16px', borderBottom: '1px solid var(--muted-3)', zIndex: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--ink)', letterSpacing: 1.5 }}>GEOSPATIAL AUTHORITY: NATIONAL INTEL</div>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', marginTop: 2 }}>Official Signal Tracking Network</div>
        </div>

        <Map
          mapLib={maplibregl}
          initialViewState={initialViewState}
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          attributionControl={false}
        >
          <NavigationControl position="bottom-right" />

          {/* Heatmap Layer for Hotspots */}
          {type === 'hotspots' && (
            <Source id="hotspots-source" type="geojson" data={heatmapData}>
              <Layer
                id="hotspots-layer"
                type="heatmap"
                paint={{
                  'heatmap-weight': ['get', 'risk'],
                  'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
                  'heatmap-color': [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0, 'rgba(33,102,172,0)',
                    0.2, 'rgb(103,169,207)',
                    0.4, 'rgb(209,229,240)',
                    0.6, 'rgb(253,219,199)',
                    0.8, 'rgb(239,138,98)',
                    1, 'rgb(178,24,43)'
                  ],
                  'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
                  'heatmap-opacity': 0.7
                }}
              />
            </Source>
          )}

          {/* Paths */}
          {lineSources.map(source => (
            <Source key={`src-${source.id}`} id={`path-${source.id}`} type="geojson" data={source.data}>
              <Layer
                id={`line-${source.id}`}
                type="line"
                paint={{
                  'line-color': source.isActive ? '#2563EB' : '#93C5FD',
                  'line-width': source.isActive ? 3 : 2,
                  'line-opacity': source.isDimmed ? 0.2 : 0.8,
                  'line-dasharray': [2, 2]
                }}
              />
            </Source>
          ))}

          {/* Markers */}
          {points.map((p, idx) => {
            if (type === 'hotspots') return null; // Only heatmap for hotspots

            const isTelecom = !!p.operator;
            const isLatest = idx === points.length - 1 || p.isLatest;
            const isAnomaly = type === 'anomalies' || !!p.severity;
            const isSelected = selectedReportId === p.reportId || hovered?.reportId === p.reportId || hovered?.id === p.id;
            const isDimmed = selectedReportId && selectedReportId !== p.reportId && !hovered;
            
            let color = isTelecom ? 'var(--red)' : 'var(--blue)';
            if (isAnomaly) color = p.severity === 'critical' ? 'var(--red)' : 'var(--amber)';
            if (type === 'nodes') color = p.status === 'online' ? 'var(--green)' : 'var(--muted)';

            return (
              <Marker
                key={p.id || `pt-${idx}`}
                longitude={p.longitude}
                latitude={p.latitude}
                anchor="center"
              >
                <div 
                  className="map-marker-group"
                  onMouseEnter={() => setHovered(p)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelectedReportId(p.reportId)}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    opacity: isDimmed ? 0.4 : 1,
                    transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                    position: 'relative',
                    zIndex: isSelected || isLatest ? 10 : 1
                  }}
                >
                  <div style={{
                    background: 'var(--surface)',
                    border: `2px solid ${color}`,
                    borderRadius: '50%',
                    width: 32, height: 32,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: color,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    position: 'relative'
                  }}>
                    {isLatest && !isAnomaly && <div className="live-dot" style={{ position: 'absolute', top: -2, right: -2 }} />}
                    {isSelected && <div style={{
                      position: 'absolute', inset: -4, borderRadius: '50%',
                      animation: 'pulseGlow 2s infinite', pointerEvents: 'none'
                    }} />}
                    {getIcon(p.networkType || p.operator || p.type, isAnomaly ? 'anomaly' : null)}
                  </div>

                  {/* Visual Label for latest or hovered */}
                  {(isLatest || hovered?.id === p.id) && (
                    <div className="fade-in" style={{
                      position: 'absolute', top: -35, left: '50%', transform: 'translateX(-50%)',
                      background: 'var(--navy)', border: `1px solid ${color}`, borderRadius: 6,
                      padding: '4px 10px', color: '#fff', fontSize: 10, fontWeight: 800,
                      whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                      pointerEvents: 'none'
                    }}>
                      {p.tower || p.nodeName || p.name || p.area || p.title || 'ACTIVE SIGNAL'}
                    </div>
                  )}
                </div>
              </Marker>
            );
          })}
        </Map>

        {/* Floating Legend */}
        <div className="map-legend-modern" style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 10 }}>
          {type === 'hotspots' ? (
            <div className="legend-item"><span className="indicator red" style={{ background: 'var(--red)' }} /> HIGH RISK AREA</div>
          ) : type === 'anomalies' ? (
            <div className="legend-item"><span className="indicator red" style={{ background: 'var(--red)' }} /> CRITICAL ANOMALY</div>
          ) : (
            <>
              <div className="legend-item"><span className="indicator telecom" /> LTE/GSM TOWER</div>
              <div className="legend-item"><span className="indicator iot" /> IOT NODE ACTIVE</div>
            </>
          )}
          <div className="legend-item"><span className="indicator path" /> MOVEMENT PATH</div>
        </div>
      </div>

      {/* ── Right: Intelligence Side Panel ── */}
      <div className="map-intel-panel">
        <div className="panel-header">
          <FiRadio /> SIGNAL STRENGTH
        </div>
        
        {activeReport ? (
          <div className="fade-in">
            <div className="intel-stat-main">
              <div className="label">ACTIVE TARGET</div>
              <div className="value">{activeReport.device || activeReport.name}</div>
            </div>

            <div className="intel-grid">
              <div className="intel-item">
                <div className="label">PRIMARY SIGNAL</div>
                <div className="value-row">
                  {activeReport.operator ? <FiRadio color="var(--red)" /> : <FiWifi color="var(--green)" />}
                  {activeReport.operator || activeReport.type}
                </div>
              </div>
              <div className="intel-item">
                <div className="label">LATEST LOCATION</div>
                <div className="value">{activeReport.tower || activeReport.location}</div>
              </div>
              <div className="intel-item">
                <div className="label">COORDINATES</div>
                <div className="value-mono">{parseFloat(activeReport.latitude).toFixed(4)}°S, {parseFloat(activeReport.longitude).toFixed(4)}°E</div>
              </div>
              <div className="intel-item">
                <div className="label">PRECISION</div>
                <div className="value" style={{ color: 'var(--amber)' }}>±{activeReport.radiusMeters || activeReport.precision || 500}m</div>
              </div>
            </div>

            <div className="intel-footer">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 10, color: 'var(--muted)' }}>SIGNAL CONFIDENCE</span>
                <span style={{ fontSize: 10, color: 'var(--blue)', fontWeight: 800 }}>{activeReport.confidence || 85}%</span>
              </div>
              <div className="confidence-track">
                <div className="confidence-bar" style={{ width: `${activeReport.confidence || 85}%` }} />
              </div>
              <div style={{ marginTop: 15, fontSize: 10, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>
                Unit dispatch recommended for current coordinates. Tower proximity indicates high probability of retrieval.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>
            Select a signal on the map for deep intelligence analysis
          </div>
        )}
      </div>
    </div>
  );
}

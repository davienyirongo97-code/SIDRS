/**
 * src/components/ui/MalawiMap.js
 * ─────────────────────────────────────────────
 * Interactive Mapbox GL JS map of Malawi for SDIRS Intelligence.
 */

import React, { useState, useRef, useEffect } from 'react';
import Map, { Marker, Source, Layer, NavigationControl } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { FiWifi, FiBluetooth, FiRadio, FiAlertCircle, FiNavigation } from 'react-icons/fi';
import { useAppStore } from '../../store/useAppStore';

export default function MalawiMap({ points = [], type = 'events', selectedId = null }) {
  const mapRef = useRef();
  const [hovered, setHovered] = useState(null);
  const [internalSelectedId, setInternalSelectedId] = useState(null);

  const activeId = selectedId || internalSelectedId;

  const initialViewState = {
    longitude: 34.3015,
    latitude: -13.2543,
    zoom: type === 'hotspots' ? 6 : 5.5,
    pitch: 0,
    bearing: 0,
  };

  const groupedPoints = points.reduce((acc, p) => {
    const key = p.reportId || 'default';
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  const devices = useAppStore((state) => state.devices);
  const reports = useAppStore((state) => state.reports);

  const pointSequences = React.useMemo(() => {
    const seq = {};
    Object.entries(groupedPoints).forEach(([reportId, pts]) => {
      const sortedPts = [...pts].sort(
        (a, b) => new Date(a.detectedAt || 0) - new Date(b.detectedAt || 0)
      );
      sortedPts.forEach((pt, i) => {
        seq[pt.id || pt.detectedAt] = i + 1;
      });
    });
    return seq;
  }, [groupedPoints]);

  const activeReport =
    hovered ||
    (activeId
      ? points.find((p) => p.reportId === activeId || p.id === activeId)
      : points[points.length - 1]);

  // Handle auto-centering when selection changes
  useEffect(() => {
    if (activeReport && mapRef.current) {
      const lat = activeReport.lat || activeReport.latitude;
      const lng = activeReport.lng || activeReport.longitude;

      if (lat && lng) {
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: type === 'hotspots' ? 10 : 12,
          duration: 2000,
          essential: true,
        });
      }
    }
  }, [activeId, type, activeReport]);

  // Generate GeoJSON lines
  const lineSources = Object.entries(groupedPoints)
    .map(([reportId, pts]) => {
      if (pts.length < 2) return null;
      const sortedPts = [...pts].sort(
        (a, b) => new Date(a.detectedAt || 0) - new Date(b.detectedAt || 0)
      );
      const coordinates = sortedPts.map((p) => [p.longitude, p.latitude]);

      const isActive = hovered?.reportId === reportId || activeId === reportId;
      const isDimmed = activeId && activeId !== reportId && !hovered?.reportId;

      return {
        id: reportId,
        isActive,
        isDimmed,
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates,
          },
        },
      };
    })
    .filter(Boolean);

  const getIcon = (networkType, pType) => {
    if (pType === 'anomaly') {
      if (networkType === 'IMPOSSIBLE_MOVEMENT') return <FiRadio size={14} />; // Using Radio as a fallback/indicator
      return <FiAlertCircle size={14} />;
    }
    if (networkType?.includes('WiFi')) return <FiWifi size={14} />;
    if (networkType?.includes('BLE')) return <FiBluetooth size={14} />;
    return <FiRadio size={14} />;
  };

  // 1. Playback Tracker Animation
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (type !== 'events' && type !== 'movement') return;
    let startTime;
    const duration = 12000; // 12 seconds loop
    let animId;
    const animateTracker = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      setProgress((elapsed % duration) / duration);
      animId = requestAnimationFrame(animateTracker);
    };
    animId = requestAnimationFrame(animateTracker);
    return () => cancelAnimationFrame(animId);
  }, [type]);

  const trackers = React.useMemo(() => {
    if (type !== 'events' && type !== 'movement') return [];
    return Object.entries(groupedPoints)
      .map(([reportId, pts]) => {
        if (pts.length < 2) return null;
        const sortedPts = [...pts].sort(
          (a, b) => new Date(a.detectedAt || 0) - new Date(b.detectedAt || 0)
        );
        const totalSegments = sortedPts.length - 1;
        const scaledProgress = progress * totalSegments;
        const currentSegmentIndex = Math.min(Math.floor(scaledProgress), totalSegments - 1);
        const segmentProgress = scaledProgress - currentSegmentIndex;

        const startPt = sortedPts[currentSegmentIndex];
        const endPt = sortedPts[currentSegmentIndex + 1];

        const lat = startPt.latitude + (endPt.latitude - startPt.latitude) * segmentProgress;
        const lng = startPt.longitude + (endPt.longitude - startPt.longitude) * segmentProgress;

        const report = reports.find((r) => r.id === reportId);
        const device = devices.find((d) => d.id === report?.deviceId);

        const latestSim = startPt.activeSim || endPt.activeSim || 'Unknown SIM';
        const deviceName = device ? `${device.make} ${device.model}` : 'Target Device';

        const isActive = activeId === reportId || hovered?.reportId === reportId;
        const isDimmed = activeId && activeId !== reportId && !hovered?.reportId;

        return {
          id: reportId,
          lat,
          lng,
          deviceName,
          activeSim: latestSim,
          isActive,
          isDimmed,
        };
      })
      .filter(Boolean);
  }, [groupedPoints, progress, reports, devices, activeId, hovered, type]);

  const targetList = React.useMemo(() => {
    if (type !== 'events' && type !== 'movement') return [];
    return Object.entries(groupedPoints)
      .map(([reportId, pts]) => {
        const sortedPts = [...pts].sort(
          (a, b) => new Date(a.detectedAt || 0) - new Date(b.detectedAt || 0)
        );
        const latest = sortedPts[sortedPts.length - 1];
        const report = reports.find((r) => r.id === reportId);
        const device = devices.find((d) => d.id === report?.deviceId);

        return {
          id: reportId,
          deviceName: device ? `${device.make} ${device.model}` : 'Target Device',
          activeSim: latest.activeSim || 'Unknown SIM',
          latestLocation: latest.tower || latest.nodeName || 'Unknown Location',
          detectedAt: latest.detectedAt,
          confidence: 85 + Math.min(pts.length * 2, 14), // cap confidence to max 99
          lat: latest.latitude,
          lng: latest.longitude,
        };
      })
      .sort((a, b) => b.confidence - a.confidence);
  }, [groupedPoints, type, reports, devices]);

  // GeoJSON for Heatmap
  const heatmapData = {
    type: 'FeatureCollection',
    features:
      type === 'hotspots'
        ? points.map((p) => ({
            type: 'Feature',
            properties: { risk: p.risk || 0 },
            geometry: { type: 'Point', coordinates: [p.lng || p.longitude, p.lat || p.latitude] },
          }))
        : [],
  };

  return (
    <div
      className="map-container card"
      style={{ padding: 0, overflow: 'hidden', height: 620, position: 'relative', display: 'flex' }}
    >
      {/* ── Visual Map Area ── */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          height: '100%',
          position: 'relative',
          background: 'var(--surface)',
          borderRight: '1px solid var(--muted-3)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          className="map-overlay-header"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            background: 'var(--bg)',
            opacity: 0.9,
            backdropFilter: 'blur(8px)',
            padding: '10px 16px',
            borderBottom: '1px solid var(--muted-3)',
            zIndex: 10,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--ink)', letterSpacing: 1.5 }}>
            GEOSPATIAL AUTHORITY: NATIONAL INTEL
          </div>
          <div
            style={{
              fontSize: 10,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              marginTop: 2,
            }}
          >
            Official Signal Tracking Network
          </div>
        </div>

        <Map
          ref={mapRef}
          mapLib={maplibregl}
          initialViewState={initialViewState}
          style={{ width: '100%', height: '100%' }}
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
                    0,
                    'rgba(33,102,172,0)',
                    0.2,
                    'rgb(103,169,207)',
                    0.4,
                    'rgb(209,229,240)',
                    0.6,
                    'rgb(253,219,199)',
                    0.8,
                    'rgb(239,138,98)',
                    1,
                    'rgb(178,24,43)',
                  ],
                  'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
                  'heatmap-opacity': 0.7,
                }}
              />
            </Source>
          )}

          {/* Paths */}
          {lineSources.map((source) => (
            <Source
              key={`src-${source.id}`}
              id={`path-${source.id}`}
              type="geojson"
              data={source.data}
            >
              <Layer
                id={`line-${source.id}`}
                type="line"
                paint={{
                  'line-color': source.isActive ? '#2563EB' : '#93C5FD',
                  'line-width': source.isActive ? 3 : 2,
                  'line-opacity': source.isDimmed ? 0.2 : 0.8,
                  'line-dasharray': [2, 2],
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
            const isSelected =
              activeId === p.reportId ||
              activeId === p.id ||
              hovered?.reportId === p.reportId ||
              hovered?.id === p.id;
            const isDimmed = activeId && activeId !== p.reportId && activeId !== p.id && !hovered;

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
                  onClick={() => setInternalSelectedId(p.reportId || p.id)}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    opacity: isDimmed ? 0.4 : 1,
                    transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                    position: 'relative',
                    zIndex: isSelected || isLatest ? 10 : 1,
                  }}
                >
                  <div
                    style={{
                      background: 'var(--surface)',
                      border: `2px solid ${color}`,
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: color,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                      position: 'relative',
                    }}
                  >
                    {isLatest && !isAnomaly && (
                      <div
                        className="live-dot"
                        style={{ position: 'absolute', top: -2, right: -2 }}
                      />
                    )}
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: -4,
                          borderRadius: '50%',
                          animation: 'pulseGlow 2s infinite',
                          pointerEvents: 'none',
                        }}
                      />
                    )}
                    {getIcon(p.networkType || p.operator || p.type, isAnomaly ? 'anomaly' : null)}

                    {/* Sequence Number */}
                    {(type === 'events' || type === 'movement') &&
                      pointSequences[p.id || p.detectedAt] && (
                        <div
                          style={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            background: 'var(--navy)',
                            color: '#fff',
                            fontSize: 9,
                            fontWeight: 900,
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--muted-3)',
                            zIndex: 10,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                          }}
                        >
                          {pointSequences[p.id || p.detectedAt]}
                        </div>
                      )}
                  </div>

                  {/* Visual Label for latest or hovered */}
                  {(isLatest || hovered?.id === p.id) && (
                    <div
                      className="fade-in"
                      style={{
                        position: 'absolute',
                        top: -35,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'var(--navy)',
                        border: `1px solid ${color}`,
                        borderRadius: 6,
                        padding: '4px 10px',
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 800,
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                        pointerEvents: 'none',
                      }}
                    >
                      {p.tower || p.nodeName || p.name || p.area || p.title || 'ACTIVE SIGNAL'}
                    </div>
                  )}
                </div>
              </Marker>
            );
          })}

          {/* Animated Tracker Markers */}
          {trackers.map((t) => (
            <Marker key={`tracker-${t.id}`} longitude={t.lng} latitude={t.lat} anchor="center">
              <div
                style={{
                  pointerEvents: 'none',
                  opacity: t.isDimmed ? 0.35 : 1,
                  zIndex: t.isActive ? 50 : 30,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'opacity 0.3s',
                }}
              >
                {/* Information Label */}
                <div
                  className="fade-in"
                  style={{
                    background: 'var(--navy)',
                    border: `1px solid ${t.isActive ? 'var(--blue)' : 'var(--muted)'}`,
                    padding: '5px 10px',
                    borderRadius: 8,
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.8)',
                    marginBottom: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ color: 'var(--amber)', fontSize: 11, fontWeight: 900 }}>
                    {t.deviceName}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--muted)',
                      marginTop: 2,
                    }}
                  >
                    SIM: <span style={{ color: 'var(--blue)' }}>{t.activeSim}</span>
                  </div>
                </div>

                {/* Blip */}
                <div
                  style={{
                    background: 'var(--surface)',
                    border: `2px solid ${t.isActive ? '#2563EB' : '#93C5FD'}`,
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: t.isActive ? '#2563EB' : '#93C5FD',
                    boxShadow: '0 0 15px rgba(37,99,235,0.7)',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      border: `2px solid ${t.isActive ? '#2563EB' : '#93C5FD'}`,
                      animation: 'ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite',
                      pointerEvents: 'none',
                    }}
                  />
                  <FiNavigation size={14} style={{ transform: 'rotate(45deg)' }} />
                </div>
              </div>
            </Marker>
          ))}
        </Map>

        {/* Floating Legend */}
        <div
          className="map-legend-modern"
          style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 10 }}
        >
          {type === 'hotspots' ? (
            <div className="legend-item">
              <span className="indicator red" style={{ background: 'var(--red)' }} /> HIGH RISK AREA
            </div>
          ) : type === 'anomalies' ? (
            <div className="legend-item">
              <span className="indicator red" style={{ background: 'var(--red)' }} /> CRITICAL
              ANOMALY
            </div>
          ) : (
            <>
              <div className="legend-item">
                <span className="indicator telecom" /> LTE/GSM TOWER
              </div>
              <div className="legend-item">
                <span className="indicator iot" /> IOT NODE ACTIVE
              </div>
            </>
          )}
          <div className="legend-item">
            <span className="indicator path" /> MOVEMENT PATH
          </div>
        </div>
      </div>

      {/* ── Right: Intelligence Side Panel ── */}
      <div className="map-intel-panel" style={{ overflowY: 'auto', flexShrink: 0 }}>
        <div
          className="panel-header"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: 'var(--surface)',
            borderBottom: '1px solid var(--muted-3)',
            paddingBottom: 16,
          }}
        >
          <FiRadio /> {type === 'hotspots' ? 'HOTSPOT INTELLIGENCE' : 'SIGNAL STRENGTH & TARGETS'}
        </div>

        {type !== 'hotspots' ? (
          <div style={{ paddingBottom: 20 }}>
            {/* 1. Original Active Target Detail Panel */}
            {activeReport ? (
              <div
                className="fade-in"
                style={{
                  padding: '20px',
                  borderBottom: '1px solid var(--muted-3)',
                  marginBottom: '10px',
                }}
              >
                <div className="intel-stat-main" style={{ marginBottom: '15px' }}>
                  <div
                    className="label"
                    style={{
                      fontSize: '10px',
                      color: 'var(--muted)',
                      letterSpacing: '1px',
                      marginBottom: '4px',
                    }}
                  >
                    ACTIVE TARGET
                  </div>
                  <div
                    className="value"
                    style={{ fontSize: '16px', fontWeight: '800', color: 'var(--ink)' }}
                  >
                    {activeReport.deviceName ||
                      activeReport.device ||
                      activeReport.name ||
                      'Target Device'}
                  </div>
                </div>

                <div
                  className="intel-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '15px',
                    marginBottom: '20px',
                  }}
                >
                  <div className="intel-item">
                    <div
                      className="label"
                      style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}
                    >
                      PRIMARY SIGNAL
                    </div>
                    <div
                      className="value-row"
                      style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {activeReport.operator ? (
                        <FiRadio color="var(--red)" />
                      ) : (
                        <FiWifi color="var(--green)" />
                      )}
                      {activeReport.operator ||
                        activeReport.type ||
                        activeReport.networkType ||
                        'TNM'}
                    </div>
                  </div>
                  <div className="intel-item">
                    <div
                      className="label"
                      style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}
                    >
                      LATEST LOCATION
                    </div>
                    <div className="value" style={{ fontSize: '13px', fontWeight: '700' }}>
                      {activeReport.tower ||
                        activeReport.nodeName ||
                        activeReport.location ||
                        'Unknown location'}
                    </div>
                  </div>
                  <div className="intel-item">
                    <div
                      className="label"
                      style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}
                    >
                      COORDINATES
                    </div>
                    <div
                      className="value-mono"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: 'var(--muted-2)',
                      }}
                    >
                      {parseFloat(activeReport.lat || activeReport.latitude || 0).toFixed(4)}°S,
                      {parseFloat(activeReport.lng || activeReport.longitude || 0).toFixed(4)}°E
                    </div>
                  </div>
                  <div className="intel-item">
                    <div
                      className="label"
                      style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}
                    >
                      PRECISION
                    </div>
                    <div
                      className="value"
                      style={{ color: 'var(--amber)', fontSize: '13px', fontWeight: '700' }}
                    >
                      ±{activeReport.radiusMeters || activeReport.precision || 700}m
                    </div>
                  </div>
                </div>

                <div
                  className="intel-footer"
                  style={{ borderTop: '1px solid var(--muted-3)', paddingTop: '15px' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                    }}
                  >
                    <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                      SIGNAL CONFIDENCE
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: '800' }}>
                      {activeReport.confidence || 85}%
                    </span>
                  </div>
                  <div
                    className="confidence-track"
                    style={{
                      height: '6px',
                      background: 'var(--bg-2)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      className="confidence-bar"
                      style={{
                        width: `${activeReport.confidence || 85}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--blue), var(--amber))',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      marginTop: '15px',
                      fontSize: '10px',
                      color: 'var(--muted)',
                      lineHeight: '1.4',
                    }}
                  >
                    Unit dispatch recommended for current coordinates. Tower proximity indicates
                    high probability of retrieval.
                  </div>
                </div>
              </div>
            ) : null}

            {/* 2. Device List with Locate Buttons */}
            {targetList.length > 0 ? (
              <div
                style={{
                  padding: '0 16px 16px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    color: 'var(--muted)',
                    letterSpacing: '1px',
                    marginTop: '8px',
                    paddingLeft: '4px',
                  }}
                >
                  DETECTED NETWORK DEVICES ({targetList.length})
                </div>
                {targetList.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      background: activeId === t.id ? 'var(--bg)' : 'var(--surface)',
                      border: `1px solid ${activeId === t.id ? 'var(--blue)' : 'var(--muted-3)'}`,
                      borderRadius: 12,
                      padding: 14,
                      cursor: 'pointer',
                      transition: 'all .2s',
                    }}
                    onClick={() => setInternalSelectedId(t.id)}
                  >
                    {/* Header */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 8,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--ink)' }}>
                          {t.deviceName}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--blue)',
                            marginTop: 2,
                          }}
                        >
                          SIM: {t.activeSim}
                        </div>
                      </div>
                      <div
                        style={{
                          background:
                            t.confidence >= 90 ? 'var(--green-pale)' : 'var(--amber-pale)',
                          color: t.confidence >= 90 ? 'var(--green)' : 'var(--amber)',
                          padding: '2px 6px',
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 900,
                        }}
                      >
                        {t.confidence}% CONF
                      </div>
                    </div>

                    {/* Location */}
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--muted)',
                        marginBottom: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <FiAlertCircle size={12} style={{ color: 'var(--amber)' }} />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--ink)' }}>
                          {t.latestLocation}
                        </div>
                        <div style={{ fontSize: 10 }}>{t.detectedAt}</div>
                      </div>
                    </div>

                    {/* Locate Button */}
                    <button
                      className="btn btn-blue btn-sm"
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 11,
                        padding: '6px 0',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setInternalSelectedId(t.id);
                        if (mapRef.current) {
                          mapRef.current.flyTo({
                            center: [t.lng, t.lat],
                            zoom: 13,
                            duration: 1500,
                            essential: true,
                          });
                        }
                      }}
                    >
                      <FiNavigation /> Locate Target
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}
              >
                No active targets detected in this view.
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>
            Select a hotspot for predictive analysis
          </div>
        )}
      </div>
    </div>
  );
}

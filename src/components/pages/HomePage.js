/**
 * src/components/pages/HomePage.js
 * ─────────────────────────────────────────────
 * Platform overview / landing page.
 * Shows: hero banner, 4 stat cards, 4 feature module cards,
 * and the intelligence-first philosophy explanation.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppContext';
import StatCard from '../ui/StatCard';

export default function HomePage() {
  const navigate = useNavigate();
  const { devices, reports, events } = useAppState();

  // Derived stats
  const stolenCount    = devices.filter(d => d.status === 'stolen').length;
  const recoveredCount = devices.filter(d => d.status === 'recovered').length;

  // Feature module cards
  const MODULES = [
    {
      icon: '📱',
      title: 'Device Registration',
      tag: 'Citizen',
      tagColor: 'var(--blue)',
      desc: 'Pre-register phones, laptops, and tablets using IMEI, serial number, or MAC address. Establish legal proof of ownership before theft occurs.',
      path: '/my-devices',
    },
    {
      icon: '🔍',
      title: 'IMEI Verification',
      tag: 'Public',
      tagColor: 'var(--green)',
      desc: 'Any buyer at any market can check an IMEI or serial number before purchase. Returns clean or stolen status instantly. Works via USSD too.',
      path: '/checker',
    },
    {
      icon: '🗺️',
      title: 'Police Intelligence Map',
      tag: 'Law Enforcement',
      tagColor: 'var(--red)',
      desc: 'Stolen devices silently monitored on Airtel & TNM networks. Every connection gives police the active SIM number and tower location in real time.',
      path: '/police',
    },
    {
      icon: '🔄',
      title: 'Ownership Transfer',
      tag: 'Citizen',
      tagColor: 'var(--amber)',
      desc: 'Sell your device safely with a Transfer PIN. Buyer claims ownership. A government-issued digital certificate proves the chain of title.',
      path: '/transfer',
    },
  ];

  return (
    <div className="fade-up">

      {/* ── HERO BANNER ── */}
      <div className="home-hero" style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, #0E2255 50%, #122459 100%)',
        borderRadius: 24,
        padding: '52px 52px 44px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 28,
      }}>
        {/* Background radial glows */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 75% 40%, rgba(26,92,219,0.3) 0%, transparent 60%), radial-gradient(ellipse at 25% 80%, rgba(232,137,12,0.2) 0%, transparent 50%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Live badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 14px',
            background: 'rgba(232,137,12,0.2)', border: '1px solid rgba(232,137,12,0.35)',
            borderRadius: 20, marginBottom: 20,
          }}>
            <div className="live-dot" />
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--amber-2)', letterSpacing: 1, textTransform: 'uppercase' }}>
              National Device Security Platform · MACRA Malawi
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800,
            color: '#fff', lineHeight: 1.1, margin: '0 0 14px', letterSpacing: -1,
            maxWidth: 580,
          }}>
            Stolen Device Intelligence &amp;<br />Recovery System
          </h1>

          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', margin: '0 0 28px', maxWidth: 540, lineHeight: 1.7 }}>
            Register phones &amp; laptops. Report theft instantly. Track stolen devices
            in real time via Airtel &amp; TNM network intelligence. Verify before you buy.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-amber btn-lg" onClick={() => navigate('/my-devices')}>
              🛡️ Protect My Devices
            </button>
            <button
              className="btn btn-lg"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
              onClick={() => navigate('/checker')}
            >
              🔍 Check an IMEI
            </button>
          </div>
        </div>

        {/* USSD floating badge */}
        <div style={{
          position: 'absolute', bottom: 28, right: 28,
          background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12,
          padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ fontSize: 22 }}>📲</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--amber-2)', letterSpacing: 0.5 }}>USSD Available</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: '#fff', fontWeight: 700 }}>*858*IMEI#</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>No internet needed</div>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid-stat">
        <StatCard icon="📱" value={devices.length}   label="Devices Registered"  sub="National registry"           color="var(--blue)"  />
        <StatCard icon="🚨" value={stolenCount}       label="Currently Stolen"    sub="Under monitoring"            color="var(--red)"   />
        <StatCard icon="📡" value={events.length}     label="Network Events"      sub="Telecom detections"          color="var(--amber)" />
        <StatCard icon="✅" value={recoveredCount}    label="Devices Recovered"   sub="Via SDIRS intelligence"      color="var(--green)" />
      </div>

      {/* ── MODULE CARDS ── */}
      <div className="section-title" style={{ marginBottom: 16 }}>Platform Modules</div>
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {MODULES.map(m => (
          <div
            key={m.path}
            className="card"
            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => navigate(m.path)}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-2)'; }}
            onMouseOut={e =>  { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${m.tagColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                {m.icon}
              </div>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5, color: m.tagColor, background: `${m.tagColor}14`, padding: '3px 9px', borderRadius: 6 }}>
                {m.tag}
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>{m.title}</div>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, margin: '0 0 14px' }}>{m.desc}</p>
            <span style={{ fontSize: 13, color: m.tagColor, fontWeight: 700 }}>Open module →</span>
          </div>
        ))}
      </div>

      {/* ── INTELLIGENCE-FIRST PHILOSOPHY ── */}
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-2))', borderColor: 'transparent' }}>
        <div className="grid-2">
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--amber-2)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Core Design Principle</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 12, lineHeight: 1.2 }}>
              Intelligence-First.<br />Not Block-First.
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
              SDIRS deliberately does <em>not</em> block stolen devices from mobile networks.
              Every network connection the thief makes broadcasts their live location to police.
              The stolen phone becomes a tracker.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
            <div style={{ background: 'rgba(192,37,44,0.15)', border: '1px solid rgba(192,37,44,0.3)', borderRadius: 'var(--radius-2)', padding: 14 }}>
              <div style={{ fontWeight: 800, color: '#FF8888', fontSize: 13, marginBottom: 6 }}>❌ Traditional: Block device</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>Thief sees blocked phone → discards it → disappears → device never found → no arrest</div>
            </div>
            <div style={{ background: 'rgba(27,122,62,0.15)', border: '1px solid rgba(27,122,62,0.3)', borderRadius: 'var(--radius-2)', padding: 14 }}>
              <div style={{ fontWeight: 800, color: '#80E890', fontSize: 13, marginBottom: 6 }}>✅ SDIRS: Monitor silently</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>Thief uses phone freely → every call = location ping to police → officer dispatched → recovered</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

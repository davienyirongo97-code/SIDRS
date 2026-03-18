/**
 * src/components/pages/HomePage.js
 * ─────────────────────────────────────────────
 * Platform overview / landing page.
 * Shows: hero banner, 4 stat cards, 4 feature module cards,
 * and the intelligence-first philosophy explanation.
 * REDESIGNED: Glassmorphism, Neon Aesthetics, Dynamic Animations + React Icons (Centered layout).
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppContext';
import StatCard from '../ui/StatCard';

// Importing modern icons from react-icons
import { 
  FiSmartphone, 
  FiSearch, 
  FiMapPin, 
  FiRefreshCw, 
  FiShield, 
  FiAlertCircle, 
  FiRadio, 
  FiCheckCircle,
  FiArrowRight,
  FiXOctagon,
  FiCheckSquare
} from 'react-icons/fi';

export default function HomePage() {
  const navigate = useNavigate();
  const { devices, reports, events } = useAppState();

  // Derived stats
  const stolenCount    = devices.filter(d => d.status === 'stolen').length;
  const recoveredCount = devices.filter(d => d.status === 'recovered').length;

  // Feature module cards
  const MODULES = [
    {
      icon: <FiSmartphone size={28} />,
      title: 'Device Registration',
      tag: 'Citizen',
      tagColor: 'var(--blue)',
      desc: 'Pre-register phones, laptops, and tablets using IMEI, serial number, or MAC address. Establish legal proof of ownership before theft occurs.',
      path: '/my-devices',
    },
    {
      icon: <FiSearch size={28} />,
      title: 'IMEI Verification',
      tag: 'Public',
      tagColor: 'var(--green)',
      desc: 'Any buyer at any market can check an IMEI or serial number before purchase. Returns clean or stolen status instantly. Works via USSD too.',
      path: '/checker',
    },
    {
      icon: <FiMapPin size={28} />,
      title: 'Police Intelligence Map',
      tag: 'Law Enforcement',
      tagColor: 'var(--red)',
      desc: 'Stolen devices silently monitored on Airtel & TNM networks. Every connection gives police the active SIM number and tower location in real time.',
      path: '/police',
    },
    {
      icon: <FiRefreshCw size={28} />,
      title: 'Ownership Transfer',
      tag: 'Citizen',
      tagColor: 'var(--amber)',
      desc: 'Sell your device safely with a Transfer PIN. Buyer claims ownership. A government-issued digital certificate proves the chain of title.',
      path: '/transfer',
    },
  ];

  return (
    <div className="fade-up" style={{ paddingBottom: 60 }}>

      {/* ── HERO BANNER ── */}
      <div className="home-hero hero-mesh-bg gradient-anim" style={{
        borderRadius: 32,
        padding: '64px 52px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 40,
        boxShadow: '0 24px 64px rgba(6,17,43,0.4)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        {/* Floating decorative elements */}
        <div className="float-anim" style={{
          position: 'absolute', top: '10%', right: '15%',
          width: 300, height: 300, background: 'radial-gradient(circle, rgba(26,92,219,0.15) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none'
        }} />
        <div className="float-anim" style={{
          position: 'absolute', bottom: '-10%', left: '5%',
          width: 400, height: 400, background: 'radial-gradient(circle, rgba(232,137,12,0.1) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none', animationDelay: '-2s'
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {/* Live badge */}
          <div className="glass-panel" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '8px 20px', borderRadius: 30, marginBottom: 28,
          }}>
            <div className="pulse-anim" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber-2)', boxShadow: '0 0 10px var(--amber-2)' }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              National Device Security Platform · MACRA
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 900,
            color: '#ffffff', lineHeight: 1.05, margin: '0 0 20px', letterSpacing: -1.5,
            textShadow: '0 10px 30px rgba(0,0,0,0.5)',
            maxWidth: 800,
          }}>
            Stolen Device Intelligence &amp; <span className="neon-text-blue">Recovery System</span>
          </h1>

          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', margin: '0 0 40px', maxWidth: 640, lineHeight: 1.6, fontWeight: 400 }}>
            Protect your digital assets. Register phones &amp; laptops. Report theft instantly. 
            Track stolen devices in real-time via national network intelligence.
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-lg glowing-border" style={{ 
              background: 'linear-gradient(135deg, var(--blue) 0%, #3a7df8 100%)', 
              color: '#fff', fontSize: 16, padding: '16px 32px', borderRadius: 16, 
              boxShadow: '0 8px 24px rgba(26,92,219,0.4)', border: 'none', gap: 10
            }} onClick={() => navigate('/my-devices')}>
              <FiShield size={18} /> Protect My Devices
            </button>
            <button className="btn btn-lg glass-panel" style={{ 
              color: '#fff', fontSize: 16, padding: '16px 32px', borderRadius: 16, gap: 10,
              transition: 'background 0.3s',
            }} 
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onClick={() => navigate('/checker')}>
              <FiSearch size={18} /> Check an IMEI
            </button>
          </div>
        </div>

        {/* USSD floating badge */}
        <div className="glass-panel float-anim" style={{
          position: 'absolute', bottom: 32, right: 32,
          borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
          animationDelay: '-1s'
        }}>
          <div style={{ fontSize: 26, color: 'var(--amber-2)', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
            <FiSmartphone />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--amber-2)', letterSpacing: 0.5 }}>USSD OFFLINE MODE</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: '#fff', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.5)', marginTop: 2 }}>*858*IMEI#</div>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid-stat fade-up-1" style={{ marginBottom: 40 }}>
        <div className="glass-card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -10, top: -10, opacity: 0.05, color: 'var(--ink)' }}><FiSmartphone size={90}/></div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: 1 }}>Registered</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800, color: 'var(--ink)', margin: '10px 0 4px' }}>{devices.length}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>National Registry</div>
        </div>
        <div className="glass-card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -10, top: -10, opacity: 0.05, color: 'var(--ink)' }}><FiAlertCircle size={90}/></div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: 1 }}>Stolen</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800, color: 'var(--ink)', margin: '10px 0 4px' }}>{stolenCount}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Under Monitoring</div>
        </div>
        <div className="glass-card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -10, top: -10, opacity: 0.05, color: 'var(--ink)' }}><FiRadio size={90}/></div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: 1 }}>Events</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800, color: 'var(--ink)', margin: '10px 0 4px' }}>{events.length}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Telecom Detections</div>
        </div>
        <div className="glass-card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -10, top: -10, opacity: 0.05, color: 'var(--ink)' }}><FiCheckCircle size={90}/></div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: 1 }}>Recovered</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800, color: 'var(--ink)', margin: '10px 0 4px' }}>{recoveredCount}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Via SDIRS Intel</div>
        </div>
      </div>

      {/* ── MODULE CARDS ── */}
      <div className="section-title fade-up-2" style={{ marginBottom: 24, fontSize: 14 }}>Platform Modules</div>
      <div className="grid-2 fade-up-2" style={{ marginBottom: 40 }}>
        {MODULES.map(m => (
          <div
            key={m.path}
            className="glass-card"
            style={{ cursor: 'pointer', padding: 30 }}
            onClick={() => navigate(m.path)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ 
                width: 64, height: 64, borderRadius: 20, 
                background: `linear-gradient(135deg, ${m.tagColor}22, transparent)`, 
                border: `1px solid ${m.tagColor}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.tagColor,
                boxShadow: `0 8px 24px ${m.tagColor}33`
              }}>
                {m.icon}
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: m.tagColor, background: `${m.tagColor}1A`, padding: '6px 12px', borderRadius: 20 }}>
                {m.tag}
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--ink)', marginBottom: 10 }}>{m.title}</div>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.7, margin: '0 0 20px', fontWeight: 500 }}>{m.desc}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: m.tagColor, fontWeight: 700 }}>
              Access Module 
              <span className="spin-anim" style={{ display: 'inline-block', transition: 'transform 0.3s' }}><FiArrowRight /></span>
            </div>
          </div>
        ))}
      </div>

      {/* ── INTELLIGENCE-FIRST PHILOSOPHY ── */}
      <div className="fade-up-3 hero-mesh-bg" style={{ 
        borderRadius: 32, padding: 40, border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 24px 64px rgba(6,17,43,0.3)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--navy) 40%, transparent 100%)', zIndex: 0 }} />
        <div className="grid-2" style={{ position: 'relative', zIndex: 1, alignItems: 'center' }}>
          <div>
            <div className="neon-text-amber" style={{ fontSize: 12, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>Core Design Principle</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, color: '#fff', marginBottom: 20, lineHeight: 1.1 }}>
              Intelligence-First.<br />Not Block-First.
            </div>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, margin: 0, maxWidth: 400 }}>
              SDIRS deliberately does <strong style={{color: '#fff'}}>not</strong> block stolen devices from mobile networks.
              Every network connection the thief makes broadcasts their live location to police.
              The stolen phone becomes a tracker.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center' }}>
            <div className="glass-panel" style={{ padding: 20, borderRadius: 20, borderLeft: '4px solid var(--red)' }}>
              <div style={{ fontWeight: 800, color: '#FF8888', fontSize: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{fontSize: 20}}><FiXOctagon /></span> Traditional: Block device
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>Thief sees blocked phone → discards it → disappears → device never found → <strong style={{color: '#FF8888'}}>no arrest</strong></div>
            </div>
            <div className="glass-panel" style={{ padding: 20, borderRadius: 20, borderLeft: '4px solid #80E890', transform: 'translateX(-20px)' }}>
              <div style={{ fontWeight: 800, color: '#80E890', fontSize: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="pulse-anim" style={{fontSize: 20}}><FiCheckSquare /></span> SDIRS: Monitor silently
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>Thief uses phone freely → every call = location ping to police → officer dispatched → <strong style={{color: '#80E890'}}>recovered</strong></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

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
import { useAppStore } from '../../store/useAppStore';

// Importing modern icons from react-icons
import {
  FiSmartphone,
  FiSearch,
  FiShield,
  FiAlertCircle,
  FiRadio,
  FiCheckCircle,
  FiXOctagon,
  FiCheckSquare,
} from 'react-icons/fi';

export default function HomePage() {
  const navigate = useNavigate();
  const devices = useAppStore((state) => state.devices);
  const events = useAppStore((state) => state.events);

  // Derived stats
  const stolenCount = devices.filter((d) => d.status === 'stolen').length;
  const recoveredCount = devices.filter((d) => d.status === 'recovered').length;

  // How it Works Steps
  const STRATEGY_STEPS = [
    {
      image: '/how-1-register.png',
      title: 'Fast Registration',
      desc: 'Connect your IMEI and serial numbers to the National Registry in seconds. Establish legal proof of ownership before theft occurs.',
      tag: 'Step 01',
      color: '#3b82f6',
    },
    {
      image: '/how-2-monitor.png',
      title: 'Active Monitoring',
      desc: 'Our "Honey Trap" system silently monitors stolen devices across all national networks, tracking SIM changes and tower locations in real-time.',
      tag: 'Step 02',
      color: '#fbbf24',
    },
    {
      image: '/how-3-recover.png',
      title: 'Forensic Recovery',
      desc: 'Turn stolen assets into legal evidence. Integrated police dashboards allow for rapid response and secure asset restoration.',
      tag: 'Step 03',
      color: '#10b981',
    },
  ];

  return (
    <div className="fade-up" style={{ paddingBottom: 60 }}>
      {/* ── HERO BANNER (Malawi National Theme overhaul) ── */}
      <div
        className="hero-banner-new"
        style={{
          background: 'linear-gradient(135deg, #E0F2FE 0%, #FFFFFF 100%)',
          border: '1px solid #BFDBFE',
          boxShadow: '0 10px 40px -10px rgba(30,58,138,0.1)',
        }}
      >
        {/* Subtle decorative elements for National theme */}
        <div
          style={{
            position: 'absolute',
            top: -50,
            left: -50,
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        {/* Left Side: Content */}
        <div className="hero-content" style={{ textAlign: 'left', alignItems: 'flex-start' }}>
          {/* National Platform Tag */}
          <div
            className="hero-tag"
            style={{
              background: '#FFFFFF',
              border: '1px solid #BFDBFE',
              boxShadow: '0 2px 8px rgba(30,58,138,0.05)',
            }}
          >
            <div
              className="pulse-anim"
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--amber)',
                boxShadow: '0 0 10px var(--amber)',
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: 'var(--navy)',
                letterSpacing: 1.5,
                textTransform: 'uppercase',
              }}
            >
              National Device Security Platform · MACRA
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 52,
              fontWeight: 900,
              color: 'var(--navy)',
              lineHeight: 1.05,
              margin: '0 0 24px',
              letterSpacing: -1.5,
            }}
          >
            Stolen Device Intelligence &amp;{' '}
            <span style={{ color: 'var(--blue)', borderBottom: '4px solid #DBEAFE' }}>
              Recovery System
            </span>
          </h1>

          <p
            style={{
              fontSize: 17,
              color: 'var(--ink-3)',
              margin: '0 0 44px',
              lineHeight: 1.7,
              fontWeight: 500,
              maxWidth: 540,
            }}
          >
            Protect your digital assets. Register phones &amp; laptops. Report theft instantly.
            Track stolen devices in real-time via national network intelligence.
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <button
              className="btn btn-lg btn-primary"
              style={{ padding: '16px 36px', borderRadius: 16 }}
              onClick={() => navigate('/my-devices')}
            >
              <FiShield size={18} /> Protect My Devices
            </button>
            <button
              className="btn btn-lg btn-ghost"
              style={{ padding: '16px 36px', borderRadius: 16 }}
              onClick={() => navigate('/checker')}
            >
              <FiSearch size={18} /> Check an IMEI
            </button>
          </div>
        </div>

        {/* Right Side: Visual Assets */}
        <div className="hero-visual-area">
          {/* Honey Trap Slogan Overlay: Edge-fitted HUD Label */}
          <div
            className="fade-in"
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              right: '10px',
              zIndex: 10,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              padding: '6px 16px',
              borderRadius: 8,
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div
              className="pulse-anim"
              style={{
                flexShrink: 0,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#3b82f6',
                boxShadow: '0 0 10px #3b82f6',
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 900,
                color: '#fff',
                letterSpacing: 1,
                fontFamily: 'var(--font-display)',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                flex: 1,
              }}
            >
              "TURN STOLEN DEVICES INTO HONEY TRAPS"
            </span>
          </div>
          <img
            src="/laptop-hero.png"
            alt="Laptop Tracking"
            className="floating-device laptop"
            style={{ filter: 'drop-shadow(0 20px 40px rgba(30,58,138,0.15))' }}
          />
          <img
            src="/phone-hero.png"
            alt="Phone Security"
            className="floating-device phone"
            style={{ filter: 'drop-shadow(0 20px 40px rgba(30,58,138,0.2))' }}
          />

          {/* USSD floating badge integrated into visual area */}
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              bottom: -20,
              right: 40,
              borderRadius: 16,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              zIndex: 10,
              border: '1px solid var(--amber-2)',
            }}
          >
            <div
              style={{
                fontSize: 26,
                color: 'var(--amber-2)',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
              }}
            >
              <FiSmartphone />
            </div>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: 'var(--amber-2)',
                  letterSpacing: 0.5,
                }}
              >
                USSD OFFLINE MODE
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 18,
                  color: '#fff',
                  fontWeight: 800,
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  marginTop: 2,
                }}
              >
                *858*IMEI#
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid-stat fade-up-1" style={{ marginBottom: 40 }}>
        <div
          className="glass-card"
          style={{ padding: 24, position: 'relative', overflow: 'hidden' }}
        >
          <div
            style={{
              position: 'absolute',
              right: -10,
              top: -10,
              opacity: 0.05,
              color: 'var(--ink)',
            }}
          >
            <FiSmartphone size={90} />
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--blue)',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Registered
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 42,
              fontWeight: 800,
              color: 'var(--ink)',
              margin: '10px 0 4px',
            }}
          >
            {devices.length}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>National Registry</div>
        </div>
        <div
          className="glass-card"
          style={{ padding: 24, position: 'relative', overflow: 'hidden' }}
        >
          <div
            style={{
              position: 'absolute',
              right: -10,
              top: -10,
              opacity: 0.05,
              color: 'var(--ink)',
            }}
          >
            <FiAlertCircle size={90} />
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--red)',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Stolen
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 42,
              fontWeight: 800,
              color: 'var(--ink)',
              margin: '10px 0 4px',
            }}
          >
            {stolenCount}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Under Monitoring</div>
        </div>
        <div
          className="glass-card"
          style={{ padding: 24, position: 'relative', overflow: 'hidden' }}
        >
          <div
            style={{
              position: 'absolute',
              right: -10,
              top: -10,
              opacity: 0.05,
              color: 'var(--ink)',
            }}
          >
            <FiRadio size={90} />
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--amber)',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Events
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 42,
              fontWeight: 800,
              color: 'var(--ink)',
              margin: '10px 0 4px',
            }}
          >
            {events.length}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Telecom Detections</div>
        </div>
        <div
          className="glass-card"
          style={{ padding: 24, position: 'relative', overflow: 'hidden' }}
        >
          <div
            style={{
              position: 'absolute',
              right: -10,
              top: -10,
              opacity: 0.05,
              color: 'var(--ink)',
            }}
          >
            <FiCheckCircle size={90} />
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--green)',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Recovered
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 42,
              fontWeight: 800,
              color: 'var(--ink)',
              margin: '10px 0 4px',
            }}
          >
            {recoveredCount}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Via SDIRS Intel</div>
        </div>
      </div>

      <div
        className="section-title fade-up-2"
        style={{
          marginBottom: 32,
          fontSize: 28,
          fontFamily: 'var(--font-display)',
          textAlign: 'left',
          fontWeight: 900,
          color: '#fff',
          textTransform: 'uppercase',
          letterSpacing: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <span style={{ position: 'relative' }}>
          How SIDRS Protects You
          <div
            style={{
              position: 'absolute',
              bottom: -4,
              left: 0,
              width: '40%',
              height: 3,
              background: 'linear-gradient(to right, var(--red), var(--green))',
              borderRadius: 2,
            }}
          />
        </span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
      </div>

      <div className="grid-3 fade-up-2" style={{ marginBottom: 60, gap: 24 }}>
        {STRATEGY_STEPS.map((s, idx) => {
          // National color logic: 0 -> Green, 1 -> Red, 2 -> Blue (or mix)
          const accentColor =
            idx === 0 ? 'var(--green-2)' : idx === 1 ? 'var(--red-2)' : 'var(--blue-2)';
          const glowShadow = `0 8px 32px rgba(0,0,0,0.4), 0 0 15px ${accentColor}22`;

          return (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.4s cubic-bezier(0.2, 1, 0.3, 1)',
                border: `1px solid rgba(255,255,255,0.05)`,
                boxShadow: glowShadow,
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                e.currentTarget.style.borderColor = accentColor;
                e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.6), 0 0 25px ${accentColor}44`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.boxShadow = glowShadow;
              }}
            >
              {/* Top Accent Line */}
              <div style={{ height: 3, background: accentColor, width: '100%' }} />

              <div
                style={{
                  height: 200,
                  overflow: 'hidden',
                  position: 'relative',
                  background: '#000',
                }}
              >
                <img
                  src={s.image}
                  alt={s.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.8,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: s.color,
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 900,
                    padding: '4px 10px',
                    borderRadius: 4,
                    letterSpacing: 1,
                    boxShadow: `0 0 10px ${s.color}66`,
                  }}
                >
                  {s.tag}
                </div>
              </div>
              <div style={{ padding: 24 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 22,
                    fontWeight: 900,
                    color: '#fff',
                    marginBottom: 16,
                    letterSpacing: -0.5,
                  }}
                >
                  {s.title}
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.5)',
                    lineHeight: 1.6,
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  {s.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── INTELLIGENCE-FIRST PHILOSOPHY ── */}
      <div
        className="fade-up-3 hero-mesh-bg"
        style={{
          borderRadius: 32,
          padding: 40,
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 24px 64px rgba(6,17,43,0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, var(--navy) 40%, transparent 100%)',
            zIndex: 0,
          }}
        />
        <div className="grid-2" style={{ position: 'relative', zIndex: 1, alignItems: 'center' }}>
          <div>
            <div
              className="neon-text-amber"
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 3,
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              Core Design Principle
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 36,
                fontWeight: 900,
                color: '#fff',
                marginBottom: 20,
                lineHeight: 1.1,
              }}
            >
              Intelligence-First.
              <br />
              Not Block-First.
            </div>
            <p
              style={{
                fontSize: 15,
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.8,
                margin: 0,
                maxWidth: 400,
              }}
            >
              SDIRS deliberately does <strong style={{ color: '#fff' }}>not</strong> block stolen
              devices from mobile networks. Every network connection the thief makes broadcasts
              their live location to police. The stolen phone becomes a tracker.
            </p>
          </div>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center' }}
          >
            <div
              className="glass-panel"
              style={{ padding: 20, borderRadius: 20, borderLeft: '4px solid var(--red)' }}
            >
              <div
                style={{
                  fontWeight: 800,
                  color: '#FF8888',
                  fontSize: 14,
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 20 }}>
                  <FiXOctagon />
                </span>{' '}
                Traditional: Block device
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                Thief sees blocked phone → discards it → disappears → device never found →{' '}
                <strong style={{ color: '#FF8888' }}>no arrest</strong>
              </div>
            </div>
            <div
              className="glass-panel"
              style={{
                padding: 20,
                borderRadius: 20,
                borderLeft: '4px solid #80E890',
                transform: 'translateX(-20px)',
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  color: '#80E890',
                  fontSize: 14,
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span className="pulse-anim" style={{ fontSize: 20 }}>
                  <FiCheckSquare />
                </span>{' '}
                SDIRS: Monitor silently
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                Thief uses phone freely → every call = location ping to police → officer dispatched
                → <strong style={{ color: '#80E890' }}>recovered</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

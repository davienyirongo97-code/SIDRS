/**
 * src/components/pages/NotFoundPage.js
 * ─────────────────────────────────────────────
 * Premium 404 Error Page.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiHome } from 'react-icons/fi';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      className="fade-up"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '40px',
      }}
    >
      <div
        className="glass-card"
        style={{
          padding: '60px',
          borderRadius: '32px',
          maxWidth: '500px',
          boxShadow: 'var(--shadow-3)',
        }}
      >
        <div
          style={{
            fontSize: '80px',
            fontWeight: '900',
            color: 'var(--blue)',
            fontFamily: 'var(--font-display)',
            marginBottom: '20px',
            letterSpacing: '-4px',
          }}
        >
          404
        </div>

        <div
          style={{
            fontSize: '24px',
            fontWeight: '800',
            color: 'var(--ink)',
            marginBottom: '16px',
          }}
        >
          Page Not Found
        </div>

        <p
          style={{
            color: 'var(--muted)',
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '32px',
          }}
        >
          The page you are looking for might have been removed, had its name changed, or is
          temporarily unavailable.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
          >
            <FiHome /> Return Home
          </button>
          <button
            className="btn btn-surface"
            onClick={() => navigate('/checker')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
          >
            <FiSearch /> IMEI Checker
          </button>
        </div>
      </div>
    </div>
  );
}

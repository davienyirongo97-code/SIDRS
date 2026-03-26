import React, { useState } from 'react';
import { FiPhone, FiDelete, FiX, FiCheck } from 'react-icons/fi';
import { useToast } from '../../store/useAppStore';

const MENUS = {
  home: {
    title: 'SDIRS National Portal',
    options: [
      { key: '1', label: 'Register Device', next: 'register' },
      { key: '2', label: 'Check Status', next: 'check_status' },
      { key: '3', label: 'Report Theft', next: 'report_theft' },
      { key: '4', label: 'Transfer Ownership', next: 'transfer' },
      { key: '0', label: 'Exit', next: 'exit' },
    ],
  },
  register: {
    title: 'Register Device',
    options: [
      { key: '1', label: 'Smart Phone', next: 'imei_prompt' },
      { key: '2', label: 'Feature Phone', next: 'imei_prompt' },
      { key: '3', label: 'Laptop/Tablet', next: 'imei_prompt' },
      { key: '0', label: 'Back', next: 'home' },
    ],
  },
  imei_prompt: {
    title: 'Enter IMEI / Serial',
    input: true,
    next: 'confirm_reg',
  },
  confirm_reg: {
    title: 'Registration Complete',
    text: 'Your device is now secured. Reference: REG-77218-MW',
    options: [{ key: '0', label: 'Menu', next: 'home' }],
  },
  check_status: {
    title: 'Check Device Status',
    input: true,
    next: 'status_result',
  },
  status_result: {
    title: 'Device Search Results',
    text: 'IMEI 490... \nStatus: CLEAN \nOwner: Registered to SDIRS.',
    options: [{ key: '0', label: 'Menu', next: 'home' }],
  },
  report_theft: {
    title: 'Report SDIRS Theft',
    text: 'Dialing 199 from your registered number is required for immediate tracking. Proceed?',
    options: [
      { key: '1', label: 'Yes, proceed', next: 'done' },
      { key: '0', label: 'Cancel', next: 'home' },
    ],
  },
  transfer: {
    title: 'Transfer Ownership',
    text: 'Only a registered device owner can initiate transfer. Enter Device PIN:',
    input: true,
    next: 'done',
  },
  done: {
    title: 'Thank you',
    text: 'Action completed. SDIRS agent will contact you via SMS.',
    options: [{ key: '0', label: 'Exit', next: 'exit' }],
  },
  exit: {
    title: 'Session Ended',
    text: 'Dial *858# anytime to contact SDIRS.',
    options: [{ key: '*', label: 'Restart', next: 'home' }],
  },
};

export default function USSDSimulatorPage() {
  const showToast = useToast();
  const [currentMenu, setCurrentMenu] = useState('home');
  const [inputValue, setInputValue] = useState('');
  const [activeScreen, setActiveScreen] = useState(false);

  const menu = MENUS[currentMenu];

  function handleInput() {
    if (menu.input) {
      if (!inputValue) return;
      setCurrentMenu(menu.next);
      setInputValue('');
    }
  }

  function handleOption(key) {
    const opt = menu.options?.find((o) => o.key === key);
    if (opt) {
      setCurrentMenu(opt.next);
    }
  }

  return (
    <div className="fade-up" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>National SDIRS USSD Gateway</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Simulating the high-accessibility offline mode for feature phone users.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 40, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
        
        {/* --- RETRO PHONE MOCK --- */}
        <div style={{
          width: 320,
          height: 600,
          background: '#1a1a1a',
          borderRadius: 40,
          padding: 20,
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
          border: '4px solid #333',
          position: 'relative'
        }}>
          {/* Speaker */}
          <div style={{ width: 60, height: 6, background: '#333', borderRadius: 3, margin: '10px auto 25px' }} />

          {/* SCREEN AREA */}
          <div style={{
            background: '#8bb18b', // Retro Casio Green
            width: '100%',
            height: 280,
            borderRadius: 4,
            border: '8px solid #000',
            padding: 16,
            fontFamily: 'monospace',
            color: '#002200',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {!activeScreen ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}><FiPhone /></div>
                <div style={{ fontWeight: 800, letterSpacing: 2 }}>DIAL *858#</div>
                <button 
                  onClick={() => setActiveScreen(true)}
                  style={{ 
                    marginTop: 20, 
                    background: '#0a330a', 
                    color: '#8bb18b', 
                    border: 'none', 
                    padding: '8px 16px', 
                    fontWeight: 800,
                    borderRadius: 4
                  }}
                >
                  CALL
                </button>
              </div>
            ) : (
              <div style={{ height: '100%' }}>
                <div style={{ borderBottom: '1px solid #779977', paddingBottom: 8, marginBottom: 12, fontWeight: 800 }}>
                  {menu.title}
                </div>
                
                {menu.text && (
                  <div style={{ fontSize: 12, lineHeight: 1.4, marginBottom: 10 }}>
                    {menu.text}
                  </div>
                )}

                {menu.options && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {menu.options.map(o => (
                      <div key={o.key} style={{ fontSize: 13 }}>
                        {o.key}. {o.label}
                      </div>
                    ))}
                  </div>
                )}

                {menu.input && (
                  <div style={{ marginTop: 20 }}>
                    <div style={{ border: '1px solid #779977', height: 28, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', padding: '0 8px', color: '#000' }}>
                      {inputValue}_
                    </div>
                  </div>
                )}

                <div style={{ position: 'absolute', bottom: 12, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 800 }}>
                   <span>{menu.options ? 'SELECT' : ''}</span>
                   <span>EXIT</span>
                </div>
              </div>
            )}
          </div>

          {/* KEYPAD AREA */}
          <div style={{ marginTop: 30, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15 }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(k => (
              <button
                key={k}
                onClick={() => {
                   if (!activeScreen && k === '*') {
                      // Maybe dial *858# logic
                   }
                   if (activeScreen) {
                      if (menu.input) {
                        setInputValue(prev => prev + k);
                      } else {
                        handleOption(k);
                      }
                   }
                }}
                style={{
                  height: 48,
                  borderRadius: '50%',
                  background: '#2a2a2a',
                  color: '#fff',
                  border: 'none',
                  fontSize: 18,
                  fontWeight: 700,
                  boxShadow: '0 4px 0 #111',
                  cursor: 'pointer'
                }}
              >
                {k}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: 25, display: 'flex', justifyContent: 'space-around' }}>
             <button 
                onClick={() => {
                  if (activeScreen) {
                    if (menu.options) handleOption('1');
                    if (menu.input) handleInput();
                  }
                }}
                style={{ width: 50, height: 35, borderRadius: 10, background: '#0a330a', border: '1px solid #222', color: '#8bb18b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
             >
                <FiCheck />
             </button>
             <button 
               onClick={() => {
                 setInputValue(prev => prev.slice(0, -1));
               }}
               style={{ width: 50, height: 35, borderRadius: 10, background: '#333', border: '1px solid #222', color: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
             >
                <FiDelete />
             </button>
             <button 
                onClick={() => {
                   setActiveScreen(false);
                   setCurrentMenu('home');
                }}
                style={{ width: 50, height: 35, borderRadius: 10, background: '#330a0a', border: '1px solid #222', color: '#b18b8b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
             >
                <FiX />
             </button>
          </div>

        </div>

        {/* Info Area */}
        <div style={{ flex: 1, minWidth: 300 }}>
           <div className="card" style={{ padding: 24 }}>
             <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
               <FiPhone /> Why this matters
             </h3>
             <ul style={{ fontSize: 14, color: 'var(--muted)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: 12 }}>
               <li>
                 <strong>Accessibility:</strong> In Malawi, over 70% of device ownership tracking happens on feature phones via USSD.
               </li>
               <li>
                 <strong>Offline Resilience:</strong> This channel works even without mobile data/internet, ensuring theft reporting is always available.
               </li>
               <li>
                 <strong>Instant Registration:</strong> Citizens can register their device's IMEI to their national ID in minutes without an app.
               </li>
               <li>
                 <strong>Low Latency:</strong> Direct integration with the MACRA/SDIRS gateway for immediate tower tracking initiation.
               </li>
             </ul>

             <div className="alert alert-blue" style={{ marginTop: 24 }}>
                <strong>Simulation Hack:</strong> Click the "DIAL" button on the casio screen to begin the session. Use the keypad to navigate menus.
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}

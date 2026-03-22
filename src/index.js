/**
 * src/index.js
 * ─────────────────────────────────────────────
 * React application entry point.
 * Wraps the App in AppProvider (global state)
 * and BrowserRouter (client-side routing).
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './store/useAppStore';
import App from './App';
import './styles/global.css';
import './styles/components.css';
import './styles/animations.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* BrowserRouter enables <Link>, useNavigate, <Routes> */}
    <BrowserRouter>
      {/* AppProvider supplies global state (user, devices, reports, etc.) */}
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);

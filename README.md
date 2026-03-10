# SDIRS — Stolen Device Identification & Recovery System
## Malawi · MACRA National Platform · Frontend Codebase

---

## 🚀 Quick Start (VS Code → Browser in 3 minutes)

```bash
# 1. Open this folder in VS Code
# 2. Open the Terminal (Ctrl + ` )

# 3. Install dependencies
npm install

# 4. Start the development server
npm start

# Browser opens automatically at http://localhost:3000
```

---

## 📁 Project Structure

```
sdirs-malawi/
│
├── public/
│   └── index.html              ← HTML shell (loads fonts, mounts React)
│
├── src/
│   ├── index.js                ← React entry point
│   ├── App.js                  ← Root component + URL routing
│   │
│   ├── styles/
│   │   ├── global.css          ← CSS variables, reset, base styles
│   │   ├── components.css      ← All reusable UI component styles
│   │   └── animations.css      ← Keyframe animations
│   │
│   ├── data/
│   │   └── mockData.js         ← All demo data (replace with API calls)
│   │
│   ├── context/
│   │   └── AppContext.js       ← Global state (useReducer + Context)
│   │
│   ├── utils/
│   │   └── helpers.js          ← Pure utility functions
│   │
│   ├── components/
│   │   │
│   │   ├── layout/             ← App shell components
│   │   │   ├── Sidebar.js      ← Fixed navigation sidebar
│   │   │   ├── Sidebar.css
│   │   │   ├── Topbar.js       ← Sticky top bar
│   │   │   └── Topbar.css
│   │   │
│   │   ├── ui/                 ← Reusable UI primitives
│   │   │   ├── Badge.js        ← Status badge (registered/stolen/etc)
│   │   │   ├── Modal.js        ← Modal dialog wrapper
│   │   │   ├── StatCard.js     ← Dashboard stat card
│   │   │   └── Toast.js        ← Toast notification
│   │   │
│   │   ├── modals/             ← Feature-specific modal dialogs
│   │   │   ├── RegisterDeviceModal.js
│   │   │   ├── ReportTheftModal.js
│   │   │   ├── TransferInitiateModal.js
│   │   │   ├── TransferPinModal.js + .css
│   │   │   └── VerifyReportModal.js
│   │   │
│   │   └── pages/              ← One file per route/page
│   │       ├── HomePage.js
│   │       ├── IMEICheckerPage.js
│   │       ├── MyDevicesPage.js
│   │       ├── ReportTheftPage.js
│   │       ├── TransferPage.js
│   │       ├── PoliceDashboardPage.js
│   │       ├── IntelligenceFeedPage.js
│   │       ├── MacraAdminPage.js
│   │       └── DeviceRegistryPage.js
│
└── package.json
```

---

## 🗺️ Pages & Routes

| URL              | Page                  | Who uses it         |
|------------------|-----------------------|---------------------|
| `/`              | Home / Overview       | Everyone            |
| `/checker`       | IMEI Checker          | Public / Traders    |
| `/my-devices`    | My Devices            | Citizens            |
| `/report`        | Report Theft          | Citizens            |
| `/transfer`      | Transfer Ownership    | Citizens            |
| `/police`        | Police Dashboard      | Police Officers     |
| `/intelligence`  | Intelligence Feed     | Police / MACRA      |
| `/admin`         | MACRA Admin           | MACRA Administrators|
| `/registry`      | Device Registry       | MACRA / Police      |

---

## 🔧 Connecting to Your Backend (When Ready)

All mock data lives in `src/data/mockData.js`.
All state logic lives in `src/context/AppContext.js`.

To connect to a real backend API:

### Step 1 — Add axios (or use fetch)
```bash
npm install axios
```

### Step 2 — Create an API service file
```js
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-backend.mw/api/v1',
  headers: { 'Content-Type': 'application/json' }
});

export const getDevices   = ()        => api.get('/devices');
export const registerDevice = (data)  => api.post('/devices', data);
export const getReports   = ()        => api.get('/reports');
export const submitReport = (data)    => api.post('/reports', data);
export const verifyReport = (id)      => api.put(`/reports/${id}/verify`);
export const checkIMEI    = (imei)    => api.get(`/public/check/${imei}`);

export default api;
```

### Step 3 — Replace mock data in AppContext
In `AppContext.js`, replace the `INITIAL_*` imports with API calls
using `useEffect` to load data when the app starts:

```js
useEffect(() => {
  getDevices().then(res => dispatch({ type: 'SET_DEVICES', payload: res.data }));
  getReports().then(res => dispatch({ type: 'SET_REPORTS', payload: res.data }));
}, []);
```

---

## 🚢 Deployment

### Option A — Netlify (easiest, free)
```bash
npm run build
# Drag the /build folder to netlify.com/drop
```

### Option B — Vercel
```bash
npm install -g vercel
vercel
```

### Option C — Your own server (Nginx)
```bash
npm run build
# Copy /build to your Nginx web root
# Add this to nginx.conf to handle React Router:
# try_files $uri $uri/ /index.html;
```

---

## 🎨 Design System

| Token             | Value      | Use                    |
|-------------------|------------|------------------------|
| `--navy`          | `#06112B`  | Sidebar, banners       |
| `--blue`          | `#1A5CDB`  | Primary CTAs           |
| `--amber`         | `#E8890C`  | Accent, USSD, warnings |
| `--green`         | `#1B7A3E`  | Success, registered    |
| `--red`           | `#C0252C`  | Danger, stolen, alerts |
| `--font-display`  | Syne       | Headings, numbers      |
| `--font-body`     | DM Sans    | All UI text            |
| `--font-mono`     | DM Mono    | IMEI codes, identifiers|

---

## 📞 System Contact

**MACRA — Malawi Communications Regulatory Authority**
- Website: www.macra.org.mw
- Phone: +265 1 784 000
- Email: info@macra.org.mw

---

*Built for the MACRA National ICT Innovation Awards 2026.*
*SDIRS — Protecting Malawians' digital assets through intelligent network monitoring.*

# SDIRS Backend API

## Setup

```bash
cd backend
npm install
cp .env.example .env
# fill in your PostgreSQL credentials in .env

# Create all database tables
npm run db:migrate

# Start development server
npm run dev
```

## Structure

```
backend/
├── src/
│   ├── index.js          ← entry point
│   ├── app.js            ← express app + routes
│   ├── socket.js         ← socket.io real-time events
│   ├── db/
│   │   ├── pool.js       ← PostgreSQL connection
│   │   └── migrate.js    ← creates all tables
│   ├── middleware/
│   │   ├── auth.js       ← JWT authentication
│   │   └── audit.js      ← audit logging
│   ├── services/
│   │   └── ceir.js       ← MACRA CEIR integration
│   └── routes/
│       ├── auth.js
│       ├── devices.js    ← CEIR validation + duplicate check
│       ├── reports.js
│       ├── transfers.js
│       ├── detections.js ← telco webhook + Pi node webhook
│       ├── nodes.js      ← Raspberry Pi node registry
│       ├── reminders.js
│       ├── users.js
│       └── audit.js
```

## Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| GET | /api/devices/check?imei=&serial= | Public two-factor IMEI check |
| GET | /api/devices/stolen-macs | Pi nodes fetch stolen MAC list |
| POST | /api/devices | Register device (validates against CEIR) |
| POST | /api/reports | Submit theft report |
| PATCH | /api/reports/:id/verify | Police verify report |
| POST | /api/detections/webhook | Receive telco or Pi node detection |
| GET | /api/nodes | List Pi nodes |
| POST | /api/nodes/ping | Pi node heartbeat |
| GET | /api/audit | Audit log (MACRA only) |

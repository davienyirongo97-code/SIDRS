const express = require('express');
const cors = require('cors');

const authRoutes       = require('./routes/auth');
const deviceRoutes     = require('./routes/devices');
const reportRoutes     = require('./routes/reports');
const transferRoutes   = require('./routes/transfers');
const reminderRoutes   = require('./routes/reminders');
const detectionRoutes  = require('./routes/detections');
const nodeRoutes       = require('./routes/nodes');
const userRoutes       = require('./routes/users');
const auditRoutes      = require('./routes/audit');
const externalRoutes   = require('./routes/external');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// ── API Routes ──────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/devices',    deviceRoutes);
app.use('/api/reports',    reportRoutes);
app.use('/api/transfers',  transferRoutes);
app.use('/api/reminders',  reminderRoutes);
app.use('/api/detections', detectionRoutes);
app.use('/api/nodes',      nodeRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/audit',      auditRoutes);
app.use('/api/external',   externalRoutes); // machine-to-machine (MACRA, telcos)

// ── Health check ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', system: 'SDIRS', version: '1.0.0' });
});

// ── 404 handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// ── Error handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

module.exports = app;

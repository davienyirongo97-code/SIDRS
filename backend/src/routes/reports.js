const express = require('express');
const pool = require('../db/pool');
const { auth, requireRole } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');
const { validateImeiCheckDigit } = require('../services/ceir');
const { notifyMacraGreylist, notifyMacraWhitelist } = require('../services/macra');
const router = express.Router();

// GET /api/reports
router.get('/', auth, async (req, res) => {
  try {
    const isOfficer = ['police', 'macra'].includes(req.user.role);
    const { rows } = isOfficer
      ? await pool.query('SELECT * FROM reports ORDER BY created_at DESC')
      : await pool.query('SELECT * FROM reports WHERE reported_by = $1', [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reports — citizen submits theft report
// FIX 3: Validate IMEI before saving
// FIX 4: Status → pending_verification, NOT stolen yet
router.post('/', auth, auditLog('SUBMIT_REPORT', 'report'), async (req, res) => {
  const { deviceId, date, policeStation, location, description } = req.body;

  if (!deviceId || !date || !policeStation || !location || !description)
    return res.status(400).json({ message: 'All fields are required' });

  try {
    // FIX 3: Fetch device and validate IMEI strictly before proceeding
    const { rows: devRows } = await pool.query(
      'SELECT * FROM devices WHERE id = $1 AND owner_id = $2',
      [deviceId, req.user.id]
    );
    const device = devRows[0];
    if (!device) return res.status(404).json({ message: 'Device not found or not yours' });

    if (device.imei && !validateImeiCheckDigit(device.imei)) {
      return res.status(400).json({ message: 'Device has an invalid IMEI — cannot file report' });
    }

    const n = (await pool.query('SELECT COUNT(*) FROM reports')).rows[0].count;
    const id = `RPT-2026-${String(parseInt(n) + 1).padStart(5, '0')}`;

    // FIX 4: Set device to pending_verification — NOT stolen yet
    // Only police verification triggers the stolen status + MACRA alert
    await pool.query(
      `UPDATE devices SET status = 'pending_verification' WHERE id = $1`,
      [deviceId]
    );

    const { rows } = await pool.query(
      `INSERT INTO reports
         (id, device_id, reported_by, date, police_station, location, description, reporting_district, active_district)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$8) RETURNING *`,
      [id, deviceId, req.user.id, date, policeStation, location, description, device.owner_district]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/reports/:id/verify — police verifies report
// FIX 2: Triggers MACRA greylist webhook after verification
// FIX 4: NOW we mark device as stolen and notify MACRA
router.patch(
  '/:id/verify',
  auth,
  requireRole('police', 'macra'),
  auditLog('VERIFY_REPORT', 'report'),
  async (req, res) => {
    try {
      const caseNum = `MPS-LLW-2026-${Math.floor(Math.random() * 9000) + 1000}`;

      const { rows } = await pool.query(
        `UPDATE reports
         SET status='active', verified_at=CURRENT_DATE, dispatched=true, case_number=$1
         WHERE id=$2 RETURNING *`,
        [caseNum, req.params.id]
      );
      const report = rows[0];
      if (!report) return res.status(404).json({ message: 'Report not found' });

      // FIX 4: NOW mark device as stolen (police confirmed it)
      await pool.query(
        `UPDATE devices SET status = 'stolen' WHERE id = $1`,
        [report.device_id]
      );

      // FIX 2: Notify MACRA to greylist the IMEI on their EIR
      const { rows: devRows } = await pool.query(
        'SELECT imei, make, model FROM devices WHERE id = $1',
        [report.device_id]
      );
      const device = devRows[0];

      if (device?.imei) {
        // Fire and forget — don't block the response if MACRA is slow
        notifyMacraGreylist({
          imei:       device.imei,
          caseNumber: caseNum,
          reportId:   report.id,
          verifiedBy: req.user.id,
          district:   report.reporting_district,
        }).catch((err) => console.error('MACRA greylist notify failed:', err.message));
      }

      res.json(report);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// PATCH /api/reports/:id/resolve — police marks device recovered
// FIX 2: Notifies MACRA to whitelist the IMEI again
router.patch(
  '/:id/resolve',
  auth,
  requireRole('police', 'macra'),
  auditLog('RESOLVE_REPORT', 'report'),
  async (req, res) => {
    try {
      const { rows } = await pool.query(
        `UPDATE reports SET status='resolved' WHERE id=$1 RETURNING *`,
        [req.params.id]
      );
      const report = rows[0];
      if (!report) return res.status(404).json({ message: 'Report not found' });

      await pool.query(
        `UPDATE devices SET status='recovered' WHERE id=$1`,
        [report.device_id]
      );

      // FIX 2: Notify MACRA to remove greylist — device is recovered
      const { rows: devRows } = await pool.query(
        'SELECT imei FROM devices WHERE id = $1',
        [report.device_id]
      );
      if (devRows[0]?.imei) {
        notifyMacraWhitelist({
          imei:       devRows[0].imei,
          caseNumber: report.case_number,
          reportId:   report.id,
        }).catch((err) => console.error('MACRA whitelist notify failed:', err.message));
      }

      res.json(report);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;

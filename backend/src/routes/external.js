/**
 * External API — for MACRA and other authorized systems to query SDIRS
 * All routes secured with API key (x-api-key header)
 * No JWT needed — machine-to-machine only
 */

const express = require('express');
const pool = require('../db/pool');
const { requireApiKey } = require('../middleware/auth');
const { validateImeiCheckDigit } = require('../services/ceir');
const router = express.Router();

/**
 * GET /api/external/imei/:imei/status
 * MACRA queries this to check if SDIRS has flagged an IMEI
 *
 * Returns a strictly formatted response MACRA can rely on:
 * {
 *   imei, status, flagged_by_sdirs,
 *   report: { id, case_number, date, district, verified_at } | null,
 *   device: { make, model, type } | null,
 *   checked_at
 * }
 */
router.get('/imei/:imei/status', requireApiKey('macra'), async (req, res) => {
  const { imei } = req.params;

  // FIX 3: Strict IMEI validation before touching the database
  if (!imei || !/^\d{15}$/.test(imei)) {
    return res.status(400).json({
      error: 'INVALID_IMEI',
      message: 'IMEI must be exactly 15 digits',
    });
  }

  if (!validateImeiCheckDigit(imei)) {
    return res.status(400).json({
      error: 'INVALID_IMEI_CHECKSUM',
      message: 'IMEI failed Luhn algorithm check — not a valid IMEI',
    });
  }

  try {
    // Find device
    const { rows: devRows } = await pool.query(
      'SELECT id, make, model, type, status FROM devices WHERE imei = $1',
      [imei]
    );
    const device = devRows[0];

    if (!device) {
      return res.json({
        imei,
        status:           'NOT_REGISTERED',
        flagged_by_sdirs: false,
        report:           null,
        device:           null,
        checked_at:       new Date().toISOString(),
      });
    }

    // Find active/pending report
    const { rows: repRows } = await pool.query(
      `SELECT id, case_number, date, reporting_district, verified_at, status
       FROM reports WHERE device_id = $1
       ORDER BY created_at DESC LIMIT 1`,
      [device.id]
    );
    const report = repRows[0];

    const flagged = ['stolen', 'pending_verification'].includes(device.status);

    res.json({
      imei,
      status:           device.status.toUpperCase(),
      flagged_by_sdirs: flagged,
      report: report
        ? {
            id:           report.id,
            case_number:  report.case_number || null,
            date:         report.date,
            district:     report.reporting_district,
            verified_at:  report.verified_at || null,
            report_status: report.status,
          }
        : null,
      device: {
        make:  device.make,
        model: device.model,
        type:  device.type,
      },
      checked_at: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

/**
 * GET /api/external/stats
 * High-level system stats MACRA can display on their portal
 */
router.get('/stats', requireApiKey('macra'), async (req, res) => {
  try {
    const [devices, reports, detections, nodes] = await Promise.all([
      pool.query('SELECT status, COUNT(*) FROM devices GROUP BY status'),
      pool.query('SELECT status, COUNT(*) FROM reports GROUP BY status'),
      pool.query('SELECT COUNT(*) FROM detections'),
      pool.query(`SELECT COUNT(*) FROM pi_nodes WHERE status = 'active'`),
    ]);

    res.json({
      devices:    Object.fromEntries(devices.rows.map((r) => [r.status, parseInt(r.count)])),
      reports:    Object.fromEntries(reports.rows.map((r) => [r.status, parseInt(r.count)])),
      detections: parseInt(detections.rows[0].count),
      active_nodes: parseInt(nodes.rows[0].count),
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

module.exports = router;

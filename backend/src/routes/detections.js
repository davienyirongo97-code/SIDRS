const express = require('express');
const pool = require('../db/pool');
const { emitDetection } = require('../socket');
const router = express.Router();

/**
 * POST /api/detections/webhook
 * Receives events from:
 *   - Telco systems (Airtel, TNM) via MACRA mandate
 *   - Raspberry Pi nodes via MAC address scan
 */
router.post('/webhook', async (req, res) => {
  const { source, mac, imei, operator, latitude, longitude, tower, activeSim, radiusMeters, nodeId } = req.body;

  // Authenticate source
  if (source === 'pi_node') {
    const nodeSecret = req.headers['x-node-secret'];
    if (nodeSecret !== process.env.PI_NODE_SECRET)
      return res.status(401).json({ message: 'Unauthorized node' });
  }

  try {
    // Find device by IMEI (telco) or MAC (Pi node)
    let device = null;
    if (imei) {
      const { rows } = await pool.query('SELECT * FROM devices WHERE imei = $1', [imei]);
      device = rows[0];
    } else if (mac) {
      const { rows } = await pool.query('SELECT * FROM devices WHERE mac = $1', [mac]);
      device = rows[0];
    }

    if (!device) return res.status(404).json({ message: 'Device not in registry' });

    // Find active report for this device
    const { rows: reportRows } = await pool.query(
      `SELECT * FROM reports WHERE device_id = $1 AND status = 'active' LIMIT 1`,
      [device.id]
    );
    const report = reportRows[0];
    if (!report) return res.status(200).json({ message: 'Device found but no active report' });

    // Save detection
    const detectionId = `DET-${Date.now().toString(36).toUpperCase()}`;
    await pool.query(
      `INSERT INTO detections (id, report_id, source, operator, latitude, longitude, tower, active_sim, radius_meters, node_id, mac_detected)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [detectionId, report.id, source, operator || null, latitude, longitude, tower || null, activeSim || null, radiusMeters || null, nodeId || null, mac || null]
    );

    // Update report's active district based on detection location
    if (tower) {
      await pool.query(
        `UPDATE reports SET active_district = $1 WHERE id = $2`,
        [req.body.district || report.reporting_district, report.id]
      );
    }

    // Emit real-time alert to police dashboard
    emitDetection({
      deviceId: device.id,
      reportId: report.id,
      lat: latitude,
      lng: longitude,
      timestamp: new Date().toISOString(),
      tower,
      operator,
      activeSim,
      source,
      district: req.body.district,
    });

    res.status(201).json({ message: 'Detection recorded', detectionId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/detections — get all detections (police/macra)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM detections ORDER BY detected_at DESC LIMIT 100');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

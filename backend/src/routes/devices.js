const express = require('express');
const pool = require('../db/pool');
const { auth, requireRole } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');
const { checkImei, extractTAC, validateImeiCheckDigit } = require('../services/ceir');
const router = express.Router();

// GET /api/devices — get all devices (police/macra) or own devices (citizen)
router.get('/', auth, async (req, res) => {
  try {
    const isOfficer = ['police', 'macra'].includes(req.user.role);
    const { rows } = isOfficer
      ? await pool.query('SELECT * FROM devices ORDER BY registered_date DESC')
      : await pool.query('SELECT * FROM devices WHERE owner_id = $1', [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/devices/check?imei=&serial= — two-factor public IMEI check
router.get('/check', async (req, res) => {
  const { imei, serial } = req.query;
  if (!imei) return res.status(400).json({ message: 'IMEI required' });

  try {
    // Luhn check
    if (!validateImeiCheckDigit(imei))
      return res.status(400).json({ message: 'Invalid IMEI format' });

    // Find device by IMEI
    const { rows: imeiRows } = await pool.query('SELECT * FROM devices WHERE imei = $1', [imei]);
    const imeiDevice = imeiRows[0];

    // Two-factor: if serial also provided, check they match same device
    if (serial && imeiDevice) {
      const { rows: serialRows } = await pool.query('SELECT * FROM devices WHERE serial = $1', [serial]);
      const serialDevice = serialRows[0];
      if (serialDevice && serialDevice.id !== imeiDevice.id) {
        return res.json({ status: 'mismatch', message: 'IMEI and serial belong to different devices — possible cloning' });
      }
    }

    if (!imeiDevice) return res.json({ status: 'not_found' });

    // Check for active theft report
    const { rows: reportRows } = await pool.query(
      `SELECT * FROM reports WHERE device_id = $1 AND status IN ('active','pending') LIMIT 1`,
      [imeiDevice.id]
    );

    res.json({
      status: reportRows.length > 0 ? 'stolen' : 'clean',
      device: { make: imeiDevice.make, model: imeiDevice.model, type: imeiDevice.type, status: imeiDevice.status },
      report: reportRows[0] || null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/devices/stolen-macs — for Pi nodes to fetch stolen MAC list
router.get('/stolen-macs', async (req, res) => {
  // Pi nodes authenticate with a shared secret
  const nodeSecret = req.headers['x-node-secret'];
  if (nodeSecret !== process.env.PI_NODE_SECRET)
    return res.status(401).json({ message: 'Unauthorized' });

  try {
    const { rows } = await pool.query(
      `SELECT d.mac FROM devices d
       JOIN reports r ON r.device_id = d.id
       WHERE r.status = 'active' AND d.mac IS NOT NULL`
    );
    res.json({ macs: rows.map((r) => r.mac) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/devices — register a new device
router.post('/', auth, auditLog('REGISTER_DEVICE', 'device'), async (req, res) => {
  const { imei, serial, mac } = req.body;

  try {
    // IMEI validation
    if (imei) {
      if (!validateImeiCheckDigit(imei))
        return res.status(400).json({ message: 'Invalid IMEI check digit' });

      // Check CEIR compliance
      const ceir = await checkImei(imei);
      if (!ceir.compliant)
        return res.status(400).json({ message: 'IMEI is non-compliant with CEIR. Cannot register.' });
    }

    // Duplicate check
    if (imei) {
      const { rows } = await pool.query('SELECT id, make, model FROM devices WHERE imei = $1', [imei]);
      if (rows.length > 0)
        return res.status(409).json({ message: `IMEI already registered under a ${rows[0].make} ${rows[0].model}` });
    }
    if (serial) {
      const { rows } = await pool.query('SELECT id, make, model FROM devices WHERE serial = $1', [serial]);
      if (rows.length > 0)
        return res.status(409).json({ message: `Serial already registered under a ${rows[0].make} ${rows[0].model}` });
    }

    const id = `D-${Date.now().toString(36).toUpperCase()}`;
    const tac = imei ? extractTAC(imei) : null;

    const { rows } = await pool.query(
      `INSERT INTO devices (id, type, make, model, color, imei, imei2, serial, mac, tac,
        owner_id, purchase_date, purchase_place, estimated_value_mwk,
        owner_full_name, owner_phone, owner_email, owner_id_type, owner_id_number,
        owner_district, owner_village, owner_residence,
        ref_name, ref_relationship, ref_phone, ref_email)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)
       RETURNING *`,
      [
        id, req.body.type, req.body.make, req.body.model, req.body.color || null,
        imei || null, req.body.imei2 || null, serial || null, mac || null, tac,
        req.user.id, req.body.purchaseDate || null, req.body.purchasePlace || null,
        req.body.estimatedValueMWK || null,
        req.body.ownerProfile?.fullName, req.body.ownerProfile?.phone,
        req.body.ownerProfile?.email, req.body.ownerProfile?.idType,
        req.body.ownerProfile?.idNumber, req.body.ownerProfile?.district,
        req.body.ownerProfile?.villageArea, req.body.ownerProfile?.residence,
        req.body.referenceContact?.name, req.body.referenceContact?.relationship,
        req.body.referenceContact?.phone, req.body.referenceContact?.email,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const express = require('express');
const pool = require('../db/pool');
const { auth } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');
const router = express.Router();

// POST /api/transfers — initiate transfer
router.post('/', auth, auditLog('ADD_TRANSFER', 'transfer'), async (req, res) => {
  const { deviceId, pin, priceMWK } = req.body;
  try {
    // Block if device is stolen
    const { rows: devRows } = await pool.query('SELECT status FROM devices WHERE id = $1', [deviceId]);
    if (devRows[0]?.status === 'stolen')
      return res.status(400).json({ message: 'Cannot transfer a stolen device' });

    const id = `TRF-${Date.now().toString(36).toUpperCase()}`;
    const { rows } = await pool.query(
      `INSERT INTO transfers (id, device_id, seller_id, pin, price_mwk) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [id, deviceId, req.user.id, pin, priceMWK || 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/transfers/:id/complete — buyer completes transfer
router.patch('/:id/complete', auth, auditLog('COMPLETE_TRANSFER', 'transfer'), async (req, res) => {
  try {
    const { rows: tRows } = await pool.query('SELECT * FROM transfers WHERE id = $1', [req.params.id]);
    const transfer = tRows[0];
    if (!transfer) return res.status(404).json({ message: 'Transfer not found' });

    // Re-check device not stolen after PIN was generated
    const { rows: devRows } = await pool.query('SELECT status FROM devices WHERE id = $1', [transfer.device_id]);
    if (devRows[0]?.status === 'stolen')
      return res.status(400).json({ message: 'Device was reported stolen after PIN generation. Transfer blocked.' });

    await pool.query(
      `UPDATE transfers SET status='completed', buyer_id=$1, completed_at=NOW() WHERE id=$2`,
      [req.user.id, req.params.id]
    );
    await pool.query(
      `UPDATE devices SET owner_id=$1, status='registered' WHERE id=$2`,
      [req.user.id, transfer.device_id]
    );

    const { rows } = await pool.query('SELECT * FROM transfers WHERE id = $1', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const express = require('express');
const pool = require('../db/pool');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// GET /api/audit — MACRA only
router.get('/', auth, requireRole('macra'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 200'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

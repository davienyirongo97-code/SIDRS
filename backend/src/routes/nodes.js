const express = require('express');
const pool = require('../db/pool');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// GET /api/nodes — list all Pi nodes
router.get('/', auth, requireRole('police', 'macra'), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, district, location, latitude, longitude, status, last_ping, installed_at FROM pi_nodes');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/nodes/ping — Pi node heartbeat
router.post('/ping', async (req, res) => {
  const nodeSecret = req.headers['x-node-secret'];
  if (nodeSecret !== process.env.PI_NODE_SECRET)
    return res.status(401).json({ message: 'Unauthorized' });

  try {
    await pool.query(
      `UPDATE pi_nodes SET last_ping=NOW(), status='active' WHERE id=$1`,
      [req.body.nodeId]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

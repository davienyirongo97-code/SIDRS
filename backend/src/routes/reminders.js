const express = require('express');
const pool = require('../db/pool');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const id = `RMD-${Date.now().toString(36).toUpperCase()}`;
    const { rows } = await pool.query(
      `INSERT INTO reminders (id, report_id, case_number, from_user_id, message, detection_count, area, operator)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [id, req.body.reportId, req.body.caseNumber, req.user.id, req.body.message, req.body.detectionCount || 0, req.body.area, req.body.operator]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/acknowledge', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE reminders SET acknowledged=true, acknowledged_at=NOW() WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

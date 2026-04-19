const express = require('express');
const pool = require('../db/pool');
const { auth } = require('../middleware/auth');
const router = express.Router();

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, phone, email, role, district, location, avatar_text, avatar_color FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

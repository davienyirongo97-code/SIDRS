const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password)
    return res.status(400).json({ message: 'Phone and password required' });

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    const user = rows[0];

    if (!user || !await bcrypt.compare(password, user.password_hash))
      return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.active)
      return res.status(403).json({ message: 'Account suspended' });

    const token = jwt.sign(
      { id: user.id, role: user.role, district: user.district },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, role: user.role, district: user.district } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // JWT is stateless — client just deletes the token
  res.json({ success: true });
});

module.exports = router;

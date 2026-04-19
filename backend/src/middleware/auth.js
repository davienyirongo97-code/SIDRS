/**
 * JWT Authentication middleware
 * Protects routes that require a logged-in user
 */

const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

// ── 1. USER AUTH (JWT) ───────────────────────────────────────
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// ── 2. ROLE GUARD ────────────────────────────────────────────
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

// ── 3. API KEY AUTH (machine-to-machine) ─────────────────────
// Used by MACRA servers, Pi nodes, and telco systems.
// They send:  x-api-key: SDIRS-MACRA-xxxxxxxxxxxx
// Keys are stored in the api_keys table with a scope field.
async function requireApiKey(scope) {
  return async (req, res, next) => {
    const key = req.headers['x-api-key'];
    if (!key) return res.status(401).json({ message: 'API key required' });

    try {
      const { rows } = await pool.query(
        `SELECT * FROM api_keys WHERE key = $1 AND active = true`,
        [key]
      );
      const apiKey = rows[0];

      if (!apiKey) return res.status(401).json({ message: 'Invalid API key' });

      // Check scope if required (e.g. 'macra', 'telco', 'pi_node')
      if (scope && apiKey.scope !== scope && apiKey.scope !== 'admin') {
        return res.status(403).json({ message: `Key does not have '${scope}' scope` });
      }

      // Attach key info to request
      req.apiKey = apiKey;

      // Log usage
      await pool.query(
        `UPDATE api_keys SET last_used = NOW(), use_count = use_count + 1 WHERE id = $1`,
        [apiKey.id]
      );

      next();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
}

module.exports = { auth, requireRole, requireApiKey };

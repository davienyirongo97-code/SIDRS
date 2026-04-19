/**
 * Audit logging middleware
 * Logs every state-changing action to audit_log table
 */

const pool = require('../db/pool');

function auditLog(action, targetType) {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      // Only log successful mutations
      if (res.statusCode < 400) {
        try {
          await pool.query(
            `INSERT INTO audit_log (user_id, action, target_id, target_type, ip_address, details)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              req.user?.id || 'anonymous',
              action,
              body?.id || req.params?.id || null,
              targetType,
              req.ip,
              JSON.stringify({ body: req.body }),
            ]
          );
        } catch (err) {
          console.error('Audit log error:', err.message);
        }
      }
      return originalJson(body);
    };

    next();
  };
}

module.exports = { auditLog };

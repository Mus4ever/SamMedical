/**
 * Audit log service — record meaningful admin actions.
 * Fire-and-forget: never blocks the request.
 */

const { query } = require('../config/db');

const log = async (req, action, { targetType = null, targetId = null, metadata = {} } = {}) => {
  try {
    const userId = req.user?.id || null;
    const meta = {
      ip: req.ip,
      ua: req.headers['user-agent'] || null,
      ...metadata,
    };
    await query(
      `INSERT INTO audit_logs (user_id, action, target_type, target_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, action, targetType, targetId, JSON.stringify(meta)]
    );
  } catch (err) {
    console.error('[audit] log failed:', err.message);
  }
};

module.exports = { log };

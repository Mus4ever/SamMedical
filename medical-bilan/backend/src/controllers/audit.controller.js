const { query } = require('../config/db');
const { HttpError } = require('../middleware/errorHandler');

const getAuditLogs = async (req, res, next) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    const action = req.query.action || null;

    const where = [];
    const params = [];

    if (action) {
      params.push(action);
      where.push(`a.action = $${params.length}`);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    params.push(limit);
    const lp = `$${params.length}`;
    params.push(offset);
    const op = `$${params.length}`;

    const sql = `
      SELECT a.id, a.action, a.target_type, a.target_id, a.metadata, a.created_at,
             u.full_name AS actor_name, u.role AS actor_role
        FROM audit_logs a
        LEFT JOIN users u ON a.user_id = u.id
        ${whereClause}
        ORDER BY a.created_at DESC
        LIMIT ${lp} OFFSET ${op}
    `;
    const result = await query(sql, params);

    const countParams = params.slice(0, params.length - 2);
    const countSql = `SELECT COUNT(*)::int AS total FROM audit_logs a ${whereClause}`;
    const totalResult = await query(countSql, countParams);

    res.json({
      logs: result.rows,
      total: totalResult.rows[0].total,
      limit, offset,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAuditLogs };

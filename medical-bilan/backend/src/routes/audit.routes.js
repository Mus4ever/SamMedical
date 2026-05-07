const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getAuditLogs } = require('../controllers/audit.controller');

router.use(authenticate, requireAdmin);
router.get('/', getAuditLogs);

module.exports = router;

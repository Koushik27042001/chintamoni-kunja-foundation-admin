const express = require('express');
const router = express.Router();
const { downloadBackup, getBackupStatus } = require('../controllers/backupController');
const { protect } = require('../middleware/authMiddleware');

router.get('/download', protect, downloadBackup);
router.get('/status', protect, getBackupStatus);

module.exports = router;

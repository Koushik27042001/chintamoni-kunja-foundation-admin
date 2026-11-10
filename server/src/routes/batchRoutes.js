const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getBatches,
  createBatch,
  toggleBatchStatus,
} = require('../controllers/batchController');

router.use(protect);

router.get('/', getBatches);
router.post('/', authorize('admin', 'superadmin'), createBatch);
router.patch('/:id/toggle', authorize('admin', 'superadmin'), toggleBatchStatus);

module.exports = router;

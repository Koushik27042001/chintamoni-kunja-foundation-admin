const express = require('express');
const router = express.Router();
const {
  getBatches,
  createBatch,
  toggleBatchStatus,
} = require('../controllers/batchController');

router.get('/', getBatches);
router.post('/', createBatch);
router.patch('/:id/toggle', toggleBatchStatus);

module.exports = router;

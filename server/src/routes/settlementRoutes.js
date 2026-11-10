const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getSettlements,
  getSettlementPreview,
  confirmSettlement,
} = require('../controllers/settlementController');

router.use(protect);

router.get('/', getSettlements);
router.get('/preview/:memberId', authorize('admin', 'superadmin'), getSettlementPreview);
router.post('/confirm', authorize('admin', 'superadmin'), confirmSettlement);

module.exports = router;

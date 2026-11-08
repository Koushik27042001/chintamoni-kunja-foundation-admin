const express = require('express');
const router = express.Router();
const {
  getSettlements,
  getSettlementPreview,
  confirmSettlement,
} = require('../controllers/settlementController');

router.get('/', getSettlements);
router.get('/preview/:memberId', getSettlementPreview);
router.post('/confirm', confirmSettlement);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getReturns,
  processReturn,
} = require('../controllers/returnController');

router.use(protect);

router.get('/', getReturns);
router.post('/', processReturn);

module.exports = router;

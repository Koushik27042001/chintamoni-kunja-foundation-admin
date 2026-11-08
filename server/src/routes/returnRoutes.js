const express = require('express');
const router = express.Router();
const {
  getReturns,
  processReturn,
} = require('../controllers/returnController');

router.get('/', getReturns);
router.post('/', processReturn);

module.exports = router;

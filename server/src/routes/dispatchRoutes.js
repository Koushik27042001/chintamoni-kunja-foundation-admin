const express = require('express');
const router = express.Router();
const {
  getDispatches,
  logDispatch,
} = require('../controllers/dispatchController');

router.get('/', getDispatches);
router.post('/', logDispatch);

module.exports = router;

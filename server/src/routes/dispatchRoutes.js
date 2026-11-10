const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getDispatches,
  logDispatch,
} = require('../controllers/dispatchController');

router.use(protect);

router.get('/', getDispatches);
router.post('/', logDispatch);

module.exports = router;

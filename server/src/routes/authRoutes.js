const express = require('express');
const router = express.Router();
const {
  login,
  getMe,
  refreshToken,
  seedAdmin,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/init', seedAdmin);
router.get('/me', protect, getMe);
router.post('/refresh', protect, refreshToken);

module.exports = router;


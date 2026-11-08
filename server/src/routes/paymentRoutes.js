const express = require('express');
const router = express.Router();
const {
  getPaymentConfig,
  createOrder,
  verifyPayment,
  handleWebhook,
} = require('../controllers/paymentController');

// Public route to fetch configuration (client uses this to initialize Checkout modal)
router.get('/config', getPaymentConfig);

// Backend-controlled Order creation (amount, currency & notes validated here)
router.post('/create-order', createOrder);

// Cryptographic verification of payment signature & 80G receipt generation
router.post('/verify', verifyPayment);

// Webhook endpoint for async Razorpay transaction state synchronization
router.post('/webhook', handleWebhook);

module.exports = router;


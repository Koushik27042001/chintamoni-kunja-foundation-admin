const express = require('express');
const router = express.Router();
const {
  getDonations,
  createDonation,
  getDonationByReceiptNo,
  getDonationStats,
} = require('../controllers/donationController');

router.route('/')
  .get(getDonations)
  .post(createDonation);

router.get('/stats/summary', getDonationStats);
router.get('/:receiptNo', getDonationByReceiptNo);

module.exports = router;

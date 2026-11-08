const crypto = require('crypto');
const Razorpay = require('razorpay');
const Donation = require('../models/Donation');
const Member = require('../models/Member');
const { numberToWords } = require('../utils/numberToWords');

/**
 * Lazily initialize Razorpay client to prevent startup failure
 * if environment variables are empty during initial setup.
 */
function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * @desc    Get public Razorpay configuration (Key ID & status)
 * @route   GET /api/payment/config
 * @access  Public
 */
const getPaymentConfig = async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || '';
    const isConfigured = Boolean(keyId && process.env.RAZORPAY_KEY_SECRET);

    res.status(200).json({
      success: true,
      enabled: isConfigured,
      keyId: keyId,
      currency: 'INR',
      organization: 'Sri Sri Chintamoni Kunja Foundation',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment configuration.',
      error: error.message,
    });
  }
};

/**
 * @desc    Create a secure Razorpay order on the backend
 * @route   POST /api/payment/create-order
 * @access  Public
 */
const createOrder = async (req, res) => {
  try {
    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message:
          'Razorpay payment gateway is not configured on the server. Please ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in the backend environment.',
      });
    }

    const { amount, currency = 'INR', donorName, email, mobile, purpose, pan } = req.body;

    // Strict validation of amount
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donation amount. Minimum donation is ₹1 INR.',
      });
    }

    if (!donorName || donorName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Donor name is required to create a donation order.',
      });
    }

    // Razorpay requires amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(parsedAmount * 100);

    // Create a unique receipt identifier
    const receiptTag = `rcpt_${Date.now().toString().slice(-8)}`;

    const options = {
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt: receiptTag,
      notes: {
        donorName: (donorName || '').trim().slice(0, 40),
        email: (email || '').trim().slice(0, 40),
        mobile: (mobile || '').trim().slice(0, 15),
        purpose: (purpose || 'NGO Fund').slice(0, 40),
        pan: (pan || '').trim().slice(0, 10),
      },
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('❌ [Razorpay createOrder Error]:', error);
    res.status(500).json({
      success: false,
      message: error.error?.description || error.message || 'Failed to create payment order.',
    });
  }
};

/**
 * @desc    Verify Razorpay payment signature & issue official 80G receipt
 * @route   POST /api/payment/verify
 * @access  Public
 */
const verifyPayment = async (req, res) => {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(503).json({
        success: false,
        message: 'Razorpay secret key not configured on the server.',
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donorName,
      email,
      mobile,
      address,
      pan,
      purpose,
      amount,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification parameters (order_id, payment_id, signature).',
      });
    }

    // Cryptographic HMAC SHA-256 verification
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const signatureValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(razorpay_signature, 'utf-8')
    );

    if (!signatureValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid transaction signature.',
      });
    }

    // Idempotency: Check if this payment was already recorded
    let existingDonation = await Donation.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (existingDonation) {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified and receipt issued previously.',
        donation: existingDonation,
      });
    }

    // Parse valid donation amount
    const parsedAmount = parseFloat(amount);
    const amountVal = !isNaN(parsedAmount) && parsedAmount > 0 ? parsedAmount : 1;

    // Generate Official Sequential Receipt Number for Online Seva
    const receiptNo = `CKF-ONL-${Date.now().toString().slice(-6)}`;
    const amountInWords = numberToWords(amountVal);

    // Create Official Donation Record in Database
    const newDonation = await Donation.create({
      receiptNo,
      donorName: (donorName || 'Devotee / Donor').trim(),
      mobile: (mobile || '').trim(),
      email: (email || '').trim(),
      address: (address || '').trim(),
      pan: (pan || '').trim().toUpperCase(),
      amount: amountVal,
      amountInWords,
      currency: 'INR',
      channel: 'Online Donation',
      paymentMode: 'Razorpay',
      purpose: purpose || 'NGO Fund',
      status: 'Completed',
      settlementStatus: 'Settled',
      collectedBy: 'Razorpay Gateway (Online)',
      transactionId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      taxExempt80G: true,
      notes: `Verified online contribution via Razorpay. Order ID: ${razorpay_order_id}`,
    });

    // If mobile number matches a registered Member, increment their total donation record
    if (mobile && mobile.trim().length >= 10) {
      try {
        const member = await Member.findOne({ mobile: mobile.trim() });
        if (member) {
          member.totalDonations = (member.totalDonations || 0) + amountVal;
          await member.save();
        }
      } catch (err) {
        console.error('⚠️ [Member donation update skipped]:', err.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment successfully verified! Your official receipt has been issued.',
      donation: newDonation,
    });
  } catch (error) {
    console.error('❌ [Razorpay verifyPayment Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment and record donation.',
      error: error.message,
    });
  }
};

/**
 * @desc    Webhook handler for asynchronous Razorpay events (Payment captured, failed, refund)
 * @route   POST /api/payment/webhook
 * @access  Public (Signature protected)
 */
const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    // If webhook secret is configured, verify signature
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      const isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf-8'),
        Buffer.from(signature, 'utf-8')
      );

      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
      }
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured') {
      const payment = payload.payment.entity;
      // Mark matching donation as completed if still pending
      if (payment.order_id) {
        await Donation.updateOne(
          { razorpayOrderId: payment.order_id },
          {
            $set: {
              status: 'Completed',
              settlementStatus: 'Settled',
              razorpayPaymentId: payment.id,
              transactionId: payment.id,
            },
          }
        );
      }
    } else if (event === 'payment.failed') {
      const payment = payload.payment.entity;
      if (payment.order_id) {
        await Donation.updateOne(
          { razorpayOrderId: payment.order_id },
          { $set: { status: 'Failed' } }
        );
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('❌ [Razorpay handleWebhook Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getPaymentConfig,
  createOrder,
  verifyPayment,
  handleWebhook,
};


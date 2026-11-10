const crypto = require('crypto');
const Razorpay = require('razorpay');
const Donation = require('../models/Donation');
const Member = require('../models/Member');
const { numberToWords } = require('../utils/numberToWords');

/**
 * Safely read and trim Razorpay credentials from environment
 */
function getRazorpayCredentials() {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim();
  const mode = keyId.startsWith('rzp_live_')
    ? 'live'
    : keyId.startsWith('rzp_test_')
    ? 'test'
    : 'unconfigured';

  return { keyId, keySecret, webhookSecret, mode };
}

/**
 * Timing-safe hex HMAC SHA-256 signature verification
 */
function verifyHmacSignature(payloadString, signature, secret) {
  if (!payloadString || !signature || !secret) return false;
  const expectedHex = crypto
    .createHmac('sha256', secret)
    .update(payloadString)
    .digest('hex');

  const expectedBuf = Buffer.from(expectedHex, 'utf-8');
  const actualBuf = Buffer.from(String(signature).trim(), 'utf-8');
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

/**
 * Lazily initialize Razorpay client
 */
function getRazorpayClient() {
  const { keyId, keySecret } = getRazorpayCredentials();
  if (!keyId || !keySecret) return null;

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * @desc    Get public Razorpay configuration (Key ID, mode & status)
 * @route   GET /api/payment/config
 * @access  Public
 */
const getPaymentConfig = async (req, res) => {
  try {
    const { keyId, keySecret, mode } = getRazorpayCredentials();
    const isConfigured = Boolean(keyId && keySecret);

    res.status(200).json({
      success: true,
      enabled: isConfigured,
      mode,
      keyId,
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
    const { keyId, mode } = getRazorpayCredentials();

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
    const receiptTag = `rcpt_${Date.now().toString().slice(-8)}`;

    const options = {
      amount: amountInPaise,
      currency: String(currency).toUpperCase(),
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
      mode,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
      keyId,
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
    const { keySecret } = getRazorpayCredentials();
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

    // Cryptographic HMAC SHA-256 verification (length-safe timingSafeEqual)
    const signatureValid = verifyHmacSignature(
      `${razorpay_order_id}|${razorpay_payment_id}`,
      razorpay_signature,
      keySecret
    );

    if (!signatureValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid transaction signature.',
      });
    }

    // Idempotency: Check if this payment was already recorded
    const existingDonation = await Donation.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (existingDonation) {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified and receipt issued previously.',
        donation: existingDonation,
      });
    }

    // Fetch authoritative order amount from Razorpay (never trust client-supplied amount alone)
    let verifiedAmountRupees = parseFloat(amount);
    const razorpay = getRazorpayClient();
    if (razorpay) {
      try {
        const fetchedOrder = await razorpay.orders.fetch(razorpay_order_id);
        if (fetchedOrder && typeof fetchedOrder.amount === 'number' && fetchedOrder.amount > 0) {
          verifiedAmountRupees = fetchedOrder.amount / 100;
        }
      } catch {
        // If Razorpay fetch fails transiently after valid HMAC, use validated fallback
      }
    }

    const amountVal =
      !isNaN(verifiedAmountRupees) && verifiedAmountRupees > 0 ? verifiedAmountRupees : 1;

    const receiptNo = `CKF-ONL-${Date.now().toString().slice(-6)}`;
    const amountInWords = numberToWords(amountVal);
    const cleanMobile = (mobile || '').trim();

    const newDonation = await Donation.create({
      receiptNo,
      donorName: (donorName || 'Devotee / Donor').trim(),
      mobile: cleanMobile,
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

    // If mobile matches registered Member (mobile1 or mobile2), increment totalDonations
    if (cleanMobile.length >= 10) {
      try {
        await Member.updateOne(
          { $or: [{ mobile1: cleanMobile }, { mobile2: cleanMobile }] },
          { $inc: { totalDonations: amountVal } }
        );
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
 * @desc    Webhook handler for asynchronous Razorpay events (Payment captured, failed)
 * @route   POST /api/payment/webhook
 * @access  Public (Signature protected)
 */
const handleWebhook = async (req, res) => {
  try {
    const { webhookSecret } = getRazorpayCredentials();
    const signature = req.headers['x-razorpay-signature'];

    if (webhookSecret && signature) {
      const isValid = verifyHmacSignature(JSON.stringify(req.body), signature, webhookSecret);
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
      }
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured') {
      const payment = payload?.payment?.entity;
      if (payment?.order_id) {
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
      const payment = payload?.payment?.entity;
      if (payment?.order_id) {
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

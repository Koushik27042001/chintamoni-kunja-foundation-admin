const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    receiptNo: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    memberId: {
      type: String,
      default: '',
      index: true,
    },
    donorName: {
      type: String,
      required: [true, 'Please add donor name'],
      trim: true,
    },
    mobile: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      required: [true, 'Please add donation amount'],
      min: [1, 'Amount must be at least 1 INR'],
    },
    amountInWords: {
      type: String,
      default: '',
    },
    channel: {
      type: String,
      enum: ['Walk-in to Foundation', 'Field Collection', 'Online Donation'],
      default: 'Walk-in to Foundation',
      index: true,
    },
    paymentMode: {
      type: String,
      enum: ['Cash', 'UPI', 'Bank Transfer / NEFT', 'Cheque', 'Card', 'Razorpay'],
      default: 'Cash',
    },
    razorpayOrderId: {
      type: String,
      default: '',
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: '',
      index: true,
    },
    razorpaySignature: {
      type: String,
      default: '',
    },
    currency: {
      type: String,
      default: 'INR',
    },
    pan: {
      type: String,
      default: '',
      trim: true,
    },
    taxExempt80G: {
      type: Boolean,
      default: true,
    },
    purpose: {
      type: String,
      enum: [
        'NGO Fund',
        'Daily Anna Daan Seva',
        'Temple Renovation & Maintenance',
        'Vedic Education & Chhatra Seva',
        'Go Seva (Cow Protection)',
        'Festivals & Utsavs Seva',
        'Sadhu & Vaishnava Seva',
      ],
      default: 'NGO Fund',
    },
    collectedBy: {
      type: String,
      default: 'Krishnendu Chakraborty',
    },
    agentId: {
      type: String,
      default: '',
    },
    agentName: {
      type: String,
      default: '',
    },
    settlementStatus: {
      type: String,
      enum: ['Settled', 'Pending Office Deposit', 'N/A'],
      default: 'Settled',
    },
    status: {
      type: String,
      enum: ['Completed', 'Pending', 'Failed', 'Refunded'],
      default: 'Completed',
    },
    transactionId: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    receiptCopyUrl: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Donation', donationSchema);


const Donation = require('../models/Donation');
const Member = require('../models/Member');
const CollectionAgent = require('../models/CollectionAgent');

// Helper to convert number to words (Indian Format)
function numberToWords(num) {
  const n = parseInt(num, 10);
  if (isNaN(n) || n === 0) return 'Zero Rupees Only';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(v) {
    if (v < 20) return a[v];
    return b[Math.floor(v / 10)] + (v % 10 !== 0 ? ' ' + a[v % 10] : '');
  }

  function convertThreeDigits(v) {
    let str = '';
    if (Math.floor(v / 100) > 0) {
      str += a[Math.floor(v / 100)] + ' Hundred ';
      v %= 100;
    }
    if (v > 0) {
      str += convertTwoDigits(v);
    }
    return str.trim();
  }

  let crore = Math.floor(n / 10000000);
  let rem = n % 10000000;
  let lakh = Math.floor(rem / 100000);
  rem %= 100000;
  let thousand = Math.floor(rem / 1000);
  rem %= 1000;
  let hundred = rem;

  let res = '';
  if (crore > 0) res += convertTwoDigits(crore) + ' Crore ';
  if (lakh > 0) res += convertTwoDigits(lakh) + ' Lakh ';
  if (thousand > 0) res += convertTwoDigits(thousand) + ' Thousand ';
  if (hundred > 0) res += convertThreeDigits(hundred);

  return res.trim() + ' Rupees Only';
}

// @desc    Get all donations / receipts with search and channel filter
// @route   GET /api/donations
const getDonations = async (req, res) => {
  try {
    const { channel, paymentMode, q, status } = req.query;
    let query = {};

    if (channel && channel !== 'All') {
      query.channel = channel;
    }

    if (paymentMode && paymentMode !== 'All') {
      query.paymentMode = paymentMode;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (q) {
      query.$or = [
        { receiptNo: { $regex: q, $options: 'i' } },
        { donorName: { $regex: q, $options: 'i' } },
        { memberId: { $regex: q, $options: 'i' } },
        { mobile: { $regex: q, $options: 'i' } },
      ];
    }

    const donations = await Donation.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new donation & issue official receipt
// @route   POST /api/donations
const createDonation = async (req, res) => {
  try {
    let {
      receiptNo,
      memberId,
      donorName,
      mobile,
      email,
      address,
      amount,
      channel,
      paymentMode,
      purpose,
      collectedBy,
      agentId,
      agentName,
      settlementStatus,
      status,
      date,
      notes,
    } = req.body;

    if (!donorName || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Donor name and amount are required.',
      });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donation amount.',
      });
    }

    if (!receiptNo || receiptNo.trim() === '') {
      receiptNo = `CKF-${Date.now().toString().slice(-6)}`;
    }

    // Check duplicate receipt
    const existing = await Donation.findOne({ receiptNo: receiptNo.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Receipt ${receiptNo} already exists.`,
      });
    }

    const amountInWords = numberToWords(parsedAmount);

    const donation = await Donation.create({
      receiptNo: receiptNo.trim(),
      memberId: memberId || '',
      donorName: donorName.trim(),
      mobile: mobile || '',
      email: email || '',
      address: address || '',
      amount: parsedAmount,
      amountInWords,
      channel: channel || 'Walk-in to Foundation',
      paymentMode: paymentMode || 'Cash',
      purpose: purpose || 'NGO Fund',
      collectedBy: collectedBy || 'Krishnendu Chakraborty',
      agentId: agentId || '',
      agentName: agentName || '',
      settlementStatus: settlementStatus || (channel === 'Field Collection' ? 'Pending Office Deposit' : 'Settled'),
      status: status || 'Completed',
      date: date ? new Date(date) : new Date(),
      notes: notes || '',
    });

    // If linked to a registered member, update member's cumulative total donations
    if (memberId) {
      await Member.findOneAndUpdate(
        { id: memberId },
        { $inc: { totalDonations: parsedAmount } }
      );
    }

    // If collected via Field Agent, update agent's total collected and pending settlement
    if (agentId) {
      await CollectionAgent.findOneAndUpdate(
        { agentCode: agentId },
        {
          $inc: {
            totalCollected: parsedAmount,
            pendingSettlement: parsedAmount,
          },
        }
      );
    }

    res.status(201).json({
      success: true,
      data: donation,
      message: `Official Receipt ${donation.receiptNo} generated successfully.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get donation by receipt number
// @route   GET /api/donations/:receiptNo
const getDonationByReceiptNo = async (req, res) => {
  try {
    const donation = await Donation.findOne({ receiptNo: req.params.receiptNo });
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Receipt record not found' });
    }
    res.status(200).json({ success: true, data: donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard summary statistics & analytics
// @route   GET /api/donations/stats/summary
const getDonationStats = async (req, res) => {
  try {
    const totalDonationsCount = await Donation.countDocuments();
    const allDonations = await Donation.find();

    let totalAmount = 0;
    let onlineAmount = 0;
    let walkInAmount = 0;
    let fieldAmount = 0;
    let pendingSettlementAmount = 0;

    const purposeMap = {};
    const channelMap = {
      'Online Donation': 0,
      'Walk-in to Foundation': 0,
      'Field Collection': 0,
    };

    allDonations.forEach((d) => {
      const amt = Number(d.amount) || 0;
      totalAmount += amt;

      if (d.channel === 'Online Donation') {
        onlineAmount += amt;
        channelMap['Online Donation'] += amt;
      } else if (d.channel === 'Field Collection') {
        fieldAmount += amt;
        channelMap['Field Collection'] += amt;
        if (d.settlementStatus === 'Pending Office Deposit') {
          pendingSettlementAmount += amt;
        }
      } else {
        walkInAmount += amt;
        channelMap['Walk-in to Foundation'] += amt;
      }

      const p = d.purpose || 'General NGO Fund';
      purposeMap[p] = (purposeMap[p] || 0) + amt;
    });

    const totalMembers = await Member.countDocuments();
    const activeMembers = await Member.countDocuments({ status: 'Active' });

    res.status(200).json({
      success: true,
      data: {
        totalAmount,
        totalDonationsCount,
        onlineAmount,
        walkInAmount,
        fieldAmount,
        pendingSettlementAmount,
        totalMembers,
        activeMembers,
        purposeBreakdown: Object.keys(purposeMap).map((key) => ({
          name: key,
          amount: purposeMap[key],
        })),
        channelBreakdown: Object.keys(channelMap).map((key) => ({
          channel: key,
          amount: channelMap[key],
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDonations,
  createDonation,
  getDonationByReceiptNo,
  getDonationStats,
};

const SettlementLog = require('../models/SettlementLog');
const Book = require('../models/Book');
const Devotee = require('../models/Devotee');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get settlement history
// @route   GET /api/settlements
const getSettlements = async (req, res) => {
  try {
    const { memberId, page = 1, limit = 50 } = req.query;
    let query = {};
    if (memberId) {
      query.memberId = memberId.trim().toUpperCase();
    }

    
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await SettlementLog.countDocuments(query);
    const settlements = await SettlementLog.find(query)
      .sort({ settlementDate: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
      count: settlements.length,
      data: settlements,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get settlement preview and calculate total pages
// @route   GET /api/settlements/preview/:memberId
const getSettlementPreview = async (req, res) => {
  try {
    const devotee = await Devotee.findOne({ memberId: req.params.memberId.trim().toUpperCase() });
    if (!devotee) {
      return res.status(404).json({ success: false, message: 'Devotee not found' });
    }

    // Find all currently Allocated books for this devotee
    const allocatedBooks = await Book.find({
      currentDevoteeId: devotee.memberId,
      status: 'Allocated',
    });

    if (allocatedBooks.length === 0) {
      return res.status(400).json({
        success: false,
        message: `No allocated books found for ${devotee.name} (${devotee.memberId}) to settle.`,
      });
    }

    // Calculate total pages using: Total Pages = Sum(Bill To - Bill From + 1)
    let totalCalculatedPages = 0;
    const bookDetails = allocatedBooks.map((b) => {
      const bookPages = b.endBillNumber - b.startBillNumber + 1;
      totalCalculatedPages += bookPages;
      return {
        bookNumber: b.bookNumber,
        batchName: b.batchName,
        startBillNumber: b.startBillNumber,
        endBillNumber: b.endBillNumber,
        totalPages: bookPages,
      };
    });

    res.status(200).json({
      success: true,
      devotee: {
        memberId: devotee.memberId,
        name: devotee.name,
        mobile: devotee.mobile1,
        currentNextYearInterest: devotee.nextYearInterest,
      },
      booksCount: allocatedBooks.length,
      books: bookDetails,
      totalCalculatedPages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Confirm final settlement (Admin Only)
// @route   POST /api/settlements/confirm
const confirmSettlement = async (req, res) => {
  try {
    const { memberId, usedPages, nextYearInterest, remarks } = req.body;

    if (!memberId || usedPages === undefined || !nextYearInterest) {
      return res.status(400).json({
        success: false,
        message: 'Member ID, Used Pages count, and Next-Year Interest are required.',
      });
    }

    const devotee = await Devotee.findOne({ memberId: memberId.trim().toUpperCase() });
    if (!devotee) {
      return res.status(404).json({ success: false, message: 'Devotee not found.' });
    }

    // Retrieve allocated books
    const allocatedBooks = await Book.find({
      currentDevoteeId: devotee.memberId,
      status: 'Allocated',
    });

    if (allocatedBooks.length === 0) {
      return res.status(400).json({
        success: false,
        message: `No allocated books found for ${devotee.name} (${devotee.memberId}) to settle.`,
      });
    }

    // Exact formula: Total Pages = Sum(Bill To - Bill From + 1)
    let totalCalculatedPages = 0;
    const settledBooksData = allocatedBooks.map((b) => {
      const bookPages = b.endBillNumber - b.startBillNumber + 1;
      totalCalculatedPages += bookPages;
      return {
        bookNumber: b.bookNumber,
        batchName: b.batchName,
        startBillNumber: b.startBillNumber,
        endBillNumber: b.endBillNumber,
        totalPages: bookPages,
      };
    });

    const parsedUsedPages = parseInt(usedPages, 10);
    // Strict Validation: Validate used pages between zero and total pages
    if (isNaN(parsedUsedPages) || parsedUsedPages < 0 || parsedUsedPages > totalCalculatedPages) {
      return res.status(400).json({
        success: false,
        message: `Used pages must be between 0 and maximum possible ${totalCalculatedPages} pages.`,
      });
    }

    const unusedPages = totalCalculatedPages - parsedUsedPages;
    const settlementNo = `SETTLE-${Date.now().toString().slice(-6)}`;
    const now = new Date();

    // 1. Atomically transition Allocated -> Settled (prevents double settlement)
    const bookNumbers = allocatedBooks.map((b) => b.bookNumber);
    const updateRes = await Book.updateMany(
      { bookNumber: { $in: bookNumbers }, status: 'Allocated', currentDevoteeId: devotee.memberId },
      {
        $set: {
          status: 'Settled',
          settledAt: now,
        },
      }
    );

    if (updateRes.modifiedCount === 0) {
      return res.status(409).json({
        success: false,
        message: 'Books were already settled or modified concurrently.',
      });
    }

    // 2. Update devotee record: decrement allocated, increment settled, update interest
    devotee.allocatedBooksCount = Math.max(0, (devotee.allocatedBooksCount || 0) - bookNumbers.length);
    devotee.settledBooksCount = (devotee.settledBooksCount || 0) + bookNumbers.length;
    devotee.nextYearInterest = nextYearInterest;
    await devotee.save();

    // 3. Create permanent SettlementLog
    const settlementRecord = await SettlementLog.create({
      settlementNo,
      memberId: devotee.memberId,
      devoteeName: devotee.name,
      settledBooks: settledBooksData,
      totalCalculatedPages,
      usedPages: parsedUsedPages,
      unusedPages,
      nextYearInterest,
      settlementDate: now,
      approvedByAdmin: req.user?.name || 'Administrator',
      remarks: remarks || '',
    });

    // 4. Record ActivityLog
    await ActivityLog.create({
      actionType: 'SETTLEMENT_COMPLETED',
      module: 'Settlement',
      performedBy: req.user?.name || 'Administrator',
      memberId: devotee.memberId,
      details: `Completed final settlement ${settlementNo} for ${devotee.name}. Settled ${bookNumbers.length} books [${bookNumbers.join(', ')}]. Used: ${parsedUsedPages}/${totalCalculatedPages} pages. Next-year interest: ${nextYearInterest}.`,
      metadata: { settlementNo, bookNumbers, usedPages: parsedUsedPages, totalCalculatedPages },
    });

    res.status(200).json({
      success: true,
      message: `Settlement ${settlementNo} confirmed. ${bookNumbers.length} book(s) marked Settled.`,
      data: settlementRecord,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSettlements,
  getSettlementPreview,
  confirmSettlement,
};

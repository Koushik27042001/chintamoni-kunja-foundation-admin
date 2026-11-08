const ReturnLog = require('../models/ReturnLog');
const Book = require('../models/Book');
const Devotee = require('../models/Devotee');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get return logs
// @route   GET /api/returns
const getReturns = async (req, res) => {
  try {
    const { memberId, reason, page = 1, limit = 50 } = req.query;
    let query = {};

    if (memberId) {
      query.memberId = memberId.trim().toUpperCase();
    }
    if (reason && reason !== 'All') {
      query.returnReason = reason;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await ReturnLog.countDocuments(query);
    const returns = await ReturnLog.find(query)
      .sort({ returnDate: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
      count: returns.length,
      data: returns,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Process return / bounce of allocated books
// @route   POST /api/returns
const processReturn = async (req, res) => {
  try {
    const { memberId, bookNumbers, returnReason, remarks } = req.body;

    if (!memberId || !bookNumbers || !Array.isArray(bookNumbers) || bookNumbers.length === 0 || !returnReason) {
      return res.status(400).json({
        success: false,
        message: 'Member ID, returned book numbers, and return reason are required.',
      });
    }

    const devotee = await Devotee.findOne({ memberId: memberId.trim().toUpperCase() });
    if (!devotee) {
      return res.status(404).json({ success: false, message: 'Devotee not found.' });
    }

    // Verify books belong to this devotee and are currently Allocated
    const allocatedBooks = await Book.find({
      bookNumber: { $in: bookNumbers },
      currentDevoteeId: devotee.memberId,
      status: 'Allocated',
    });

    if (allocatedBooks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No matching allocated books found for this devotee to return.',
      });
    }

    const verifiedBookNumbers = allocatedBooks.map((b) => b.bookNumber);

    // Business Rule: Deceased reason -> Deceased status; All other reasons -> Inactive status.
    const newStatus = returnReason === 'Devotee Deceased' ? 'Deceased' : 'Inactive';
    const previousStatus = devotee.status;

    // 1. Transition books: Allocated -> Available, clear devotee reference
    await Book.updateMany(
      { bookNumber: { $in: verifiedBookNumbers } },
      {
        $set: {
          status: 'Available',
          currentDevoteeId: null,
          currentDevoteeName: '',
          allocatedAt: null,
        },
      }
    );

    // 2. Update devotee status and decrement allocatedBooksCount
    devotee.status = newStatus;
    devotee.allocatedBooksCount = Math.max(0, (devotee.allocatedBooksCount || 0) - verifiedBookNumbers.length);
    await devotee.save();

    // 3. Insert return history
    const returnRecord = await ReturnLog.create({
      memberId: devotee.memberId,
      devoteeName: devotee.name,
      returnedBooks: verifiedBookNumbers,
      returnReason,
      previousDevoteeStatus: previousStatus,
      newDevoteeStatus: newStatus,
      operatorName: req.user?.name || 'Admin',
      remarks: remarks || '',
    });

    // 4. Record activity log
    await ActivityLog.create({
      actionType: 'RETURN_PROCESSED',
      module: 'Return',
      performedBy: req.user?.name || 'Admin',
      memberId: devotee.memberId,
      details: `Processed return of ${verifiedBookNumbers.length} book(s) [${verifiedBookNumbers.join(', ')}] due to "${returnReason}". Devotee status changed from ${previousStatus} to ${newStatus}.`,
      metadata: { returnedBooks: verifiedBookNumbers, returnReason, newStatus },
    });

    res.status(200).json({
      success: true,
      message: `Return recorded. ${verifiedBookNumbers.length} book(s) restored to Available. Devotee status updated to ${newStatus}.`,
      data: returnRecord,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getReturns,
  processReturn,
};

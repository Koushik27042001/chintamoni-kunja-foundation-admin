const Book = require('../models/Book');
const PrintBatch = require('../models/PrintBatch');
const Devotee = require('../models/Devotee');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get books list with filters
// @route   GET /api/books
const getBooks = async (req, res) => {
  try {
    const { batchName, status, devoteeId, q, page = 1, limit = 50 } = req.query;
    let query = {};

    if (batchName && batchName !== 'All') {
      query.batchName = batchName;
    }
    if (status && status !== 'All') {
      query.status = status;
    }
    if (devoteeId) {
      query.currentDevoteeId = devoteeId;
    }
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      query.$or = [
        { bookNumber: regex },
        { currentDevoteeId: regex },
        { currentDevoteeName: regex },
        { batchName: regex },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort({ bookNumber: 1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
      count: books.length,
      data: books,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Propose available physical books for issue
// @route   POST /api/books/propose-issue
const proposeBooksForIssue = async (req, res) => {
  try {
    const { memberId, quantity, batchName } = req.body;

    if (!memberId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid Member ID and quantity (> 0) are required.',
      });
    }

    const devotee = await Devotee.findOne({ memberId: memberId.trim().toUpperCase() });
    if (!devotee) {
      return res.status(404).json({ success: false, message: 'Devotee not found.' });
    }

    if (devotee.status === 'Deceased') {
      return res.status(400).json({
        success: false,
        message: 'Cannot issue books to a deceased devotee record.',
      });
    }

    let batchFilter = { isActive: true };
    if (batchName && batchName !== 'All') {
      batchFilter.batchName = batchName;
    }

    const activeBatch = await PrintBatch.findOne(batchFilter).sort({ createdAt: -1 });
    if (!activeBatch) {
      return res.status(400).json({
        success: false,
        message: 'No active print batch found for issuing books.',
      });
    }

    // Check available stock in active batch
    const availableBooks = await Book.find({
      batchName: activeBatch.batchName,
      status: 'Available',
    })
      .sort({ bookNumber: 1 })
      .limit(parseInt(quantity, 10));

    if (availableBooks.length < parseInt(quantity, 10)) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock in batch "${activeBatch.batchName}". Requested: ${quantity}, Available: ${availableBooks.length}`,
      });
    }

    res.status(200).json({
      success: true,
      devotee: {
        memberId: devotee.memberId,
        name: devotee.name,
        mobile: devotee.mobile1,
        status: devotee.status,
      },
      batchName: activeBatch.batchName,
      proposedBooks: availableBooks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Find available alternative book for replacement
// @route   GET /api/books/alternative
const getAlternativeBook = async (req, res) => {
  try {
    const { batchName, excludeNumbers = '' } = req.query;
    const excludedList = excludeNumbers.split(',').map((s) => s.trim()).filter(Boolean);

    const alternative = await Book.findOne({
      batchName: batchName || { $exists: true },
      status: 'Available',
      bookNumber: { $nin: excludedList },
    }).sort({ bookNumber: 1 });

    if (!alternative) {
      return res.status(404).json({
        success: false,
        message: 'No alternative available book found in this batch.',
      });
    }

    res.status(200).json({ success: true, data: alternative });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Confirm allocation of proposed books
// @route   POST /api/books/confirm-issue
const confirmIssueBooks = async (req, res) => {
  try {
    const { memberId, bookNumbers } = req.body;

    if (!memberId || !bookNumbers || !Array.isArray(bookNumbers) || bookNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Member ID and at least one book number are required.',
      });
    }

    const devotee = await Devotee.findOne({ memberId: memberId.trim().toUpperCase() });
    if (!devotee) {
      return res.status(404).json({ success: false, message: 'Devotee not found.' });
    }

    // Verify all selected books are currently Available
    const books = await Book.find({
      bookNumber: { $in: bookNumbers },
      status: 'Available',
    });

    if (books.length !== bookNumbers.length) {
      const foundNumbers = books.map((b) => b.bookNumber);
      const unavailable = bookNumbers.filter((num) => !foundNumbers.includes(num));
      return res.status(400).json({
        success: false,
        message: `Some books are no longer available for issue: ${unavailable.join(', ')}`,
      });
    }

    // Update status to Allocated
    const now = new Date();
    await Book.updateMany(
      { bookNumber: { $in: bookNumbers } },
      {
        $set: {
          status: 'Allocated',
          currentDevoteeId: devotee.memberId,
          currentDevoteeName: devotee.name,
          allocatedAt: now,
        },
      }
    );

    // Increment devotee allocated count
    devotee.allocatedBooksCount = (devotee.allocatedBooksCount || 0) + bookNumbers.length;
    await devotee.save();

    await ActivityLog.create({
      actionType: 'BOOKS_ISSUED',
      module: 'Inventory',
      performedBy: req.user?.name || 'Admin',
      memberId: devotee.memberId,
      details: `Issued ${bookNumbers.length} book(s) [${bookNumbers.join(', ')}] to ${devotee.name} (${devotee.memberId})`,
      metadata: { bookNumbers, count: bookNumbers.length },
    });

    res.status(200).json({
      success: true,
      message: `Successfully issued ${bookNumbers.length} book(s) to ${devotee.name}.`,
      allocatedBooks: bookNumbers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBooks,
  proposeBooksForIssue,
  getAlternativeBook,
  confirmIssueBooks,
};

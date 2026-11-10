const Book = require('../models/Book');
const PrintBatch = require('../models/PrintBatch');
const Devotee = require('../models/Devotee');
const ActivityLog = require('../models/ActivityLog');
const { escapeRegex } = require('../utils/regexHelper');

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
    const safeQ = escapeRegex(q);
    if (safeQ) {
      const regex = new RegExp(safeQ, 'i');
      query.$or = [
        { bookNumber: regex },
        { currentDevoteeId: regex },
        { currentDevoteeName: regex },
        { batchName: regex },
      ];
    }

    const parsedLimit = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const [total, books] = await Promise.all([
      Book.countDocuments(query),
      Book.find(query).sort({ bookNumber: 1 }).skip(skip).limit(parsedLimit).lean(),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: parsedPage,
      pages: Math.ceil(total / parsedLimit),
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

    // Atomically transition only currently Available books (prevents race conditions)
    const uniqueNumbers = [...new Set(bookNumbers)];
    const now = new Date();
    const updateRes = await Book.updateMany(
      { bookNumber: { $in: uniqueNumbers }, status: 'Available' },
      {
        $set: {
          status: 'Allocated',
          currentDevoteeId: devotee.memberId,
          currentDevoteeName: devotee.name,
          allocatedAt: now,
        },
      }
    );

    if (updateRes.modifiedCount === 0) {
      return res.status(409).json({
        success: false,
        message: 'Selected books were already allocated or are no longer available.',
      });
    }

    // Increment devotee allocated count by exact modified count
    devotee.allocatedBooksCount = (devotee.allocatedBooksCount || 0) + updateRes.modifiedCount;
    await devotee.save();

    await ActivityLog.create({
      actionType: 'BOOKS_ISSUED',
      module: 'Inventory',
      performedBy: req.user?.name || 'Admin',
      memberId: devotee.memberId,
      details: `Issued ${updateRes.modifiedCount} book(s) [${uniqueNumbers.join(', ')}] to ${devotee.name} (${devotee.memberId})`,
      metadata: { bookNumbers: uniqueNumbers, count: updateRes.modifiedCount },
    });

    res.status(200).json({
      success: true,
      message: `Successfully issued ${updateRes.modifiedCount} book(s) to ${devotee.name}.`,
      allocatedBooks: uniqueNumbers,
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

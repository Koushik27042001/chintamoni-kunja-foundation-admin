const PrintBatch = require('../models/PrintBatch');
const Book = require('../models/Book');
const ActivityLog = require('../models/ActivityLog');
const { getBatchesWithStockCounts } = require('../services/batchQueryService');

// @desc    Get all print batches with stock summary
// @route   GET /api/batches
const getBatches = async (req, res) => {
  try {
    const batchesWithCounts = await getBatchesWithStockCounts();
    res.status(200).json({ success: true, count: batchesWithCounts.length, data: batchesWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new print batch and auto-generate books
// @route   POST /api/batches
const createBatch = async (req, res) => {
  try {
    const {
      batchName,
      batchPrefix,
      printDate,
      totalPages,
      pagesPerBook = 100,
      startBookNumber,
      endBookNumber,
      startBillNumber,
      endBillNumber,
      remarks,
    } = req.body;

    if (!batchName || !batchPrefix || !startBookNumber || !endBookNumber || !startBillNumber || !endBillNumber) {
      return res.status(400).json({
        success: false,
        message: 'All batch parameters (Prefix, Book range, Bill range) are required.',
      });
    }

    const existing = await PrintBatch.findOne({ batchName: batchName.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Batch "${batchName}" already exists.`,
      });
    }

    const totalBooks = parseInt(endBookNumber, 10) - parseInt(startBookNumber, 10) + 1;
    if (totalBooks <= 0) {
      return res.status(400).json({
        success: false,
        message: 'End book number must be greater than or equal to start book number.',
      });
    }

    const batch = await PrintBatch.create({
      batchName: batchName.trim(),
      batchPrefix: batchPrefix.trim().toUpperCase(),
      printDate: printDate || new Date(),
      totalPages: parseInt(totalPages, 10) || totalBooks * parseInt(pagesPerBook, 10),
      pagesPerBook: parseInt(pagesPerBook, 10),
      startBookNumber: parseInt(startBookNumber, 10),
      endBookNumber: parseInt(endBookNumber, 10),
      totalBooks,
      startBillNumber: parseInt(startBillNumber, 10),
      endBillNumber: parseInt(endBillNumber, 10),
      isActive: true,
      remarks: remarks || '',
    });

    // Auto-generate physical Book inventory
    const booksToInsert = [];
    const ppBook = parseInt(pagesPerBook, 10);
    let currentBill = parseInt(startBillNumber, 10);

    for (let bNum = parseInt(startBookNumber, 10); bNum <= parseInt(endBookNumber, 10); bNum++) {
      const bookNumberFormatted = `${batchPrefix.trim().toUpperCase()}-${String(bNum).padStart(4, '0')}`;
      const billStart = currentBill;
      const billEnd = currentBill + ppBook - 1;
      currentBill = billEnd + 1;

      booksToInsert.push({
        bookNumber: bookNumberFormatted,
        batchId: batch._id,
        batchName: batch.batchName,
        startBillNumber: billStart,
        endBillNumber: billEnd,
        totalPages: ppBook,
        status: 'Available',
      });
    }

    await Book.insertMany(booksToInsert);

    await ActivityLog.create({
      actionType: 'BATCH_CREATED',
      module: 'Batch',
      performedBy: req.user?.name || 'Admin',
      details: `Created batch ${batch.batchName} with ${totalBooks} books (${batch.batchPrefix}-${startBookNumber} to ${endBookNumber})`,
    });

    res.status(201).json({
      success: true,
      message: `Batch "${batch.batchName}" created with ${totalBooks} books auto-generated.`,
      data: batch,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle batch active status
// @route   PATCH /api/batches/:id/toggle
const toggleBatchStatus = async (req, res) => {
  try {
    const batch = await PrintBatch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }
    batch.isActive = !batch.isActive;
    await batch.save();
    res.status(200).json({ success: true, data: batch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBatches,
  createBatch,
  toggleBatchStatus,
};

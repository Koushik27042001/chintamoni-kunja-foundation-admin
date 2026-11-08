const Devotee = require('../models/Devotee');
const Book = require('../models/Book');
const PrintBatch = require('../models/PrintBatch');
const DispatchLog = require('../models/DispatchLog');
const ReturnLog = require('../models/ReturnLog');
const SettlementLog = require('../models/SettlementLog');
const ActivityLog = require('../models/ActivityLog');

/**
 * Calculates comprehensive operational analytics calculated strictly
 * from real MongoDB records without any fabricated data.
 */
async function getCompleteAnalytics() {
  // 1. Devotee Analytics
  const totalDevotees = await Devotee.countDocuments();
  const activeDevotees = await Devotee.countDocuments({ status: 'Active' });
  const inactiveDevotees = await Devotee.countDocuments({ status: 'Inactive' });
  const deceasedDevotees = await Devotee.countDocuments({ status: 'Deceased' });

  const interestBreakdown = await Devotee.aggregate([
    { $group: { _id: '$nextYearInterest', count: { $sum: 1 } } },
  ]);

  const devoteesWithAllocatedBooks = await Devotee.countDocuments({
    allocatedBooksCount: { $gt: 0 },
  });

  // 2. Inventory Analytics
  const totalBooks = await Book.countDocuments();
  const availableBooks = await Book.countDocuments({ status: 'Available' });
  const allocatedBooks = await Book.countDocuments({ status: 'Allocated' });
  const settledBooks = await Book.countDocuments({ status: 'Settled' });

  // Batch-wise Inventory
  const batchInventory = await PrintBatch.aggregate([
    {
      $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: 'batchId',
        as: 'books',
      },
    },
    {
      $project: {
        batchName: 1,
        batchPrefix: 1,
        totalBooks: 1,
        isActive: 1,
        available: {
          $size: {
            $filter: {
              input: '$books',
              as: 'b',
              cond: { $eq: ['$$b.status', 'Available'] },
            },
          },
        },
        allocated: {
          $size: {
            $filter: {
              input: '$books',
              as: 'b',
              cond: { $eq: ['$$b.status', 'Allocated'] },
            },
          },
        },
        settled: {
          $size: {
            $filter: {
              input: '$books',
              as: 'b',
              cond: { $eq: ['$$b.status', 'Settled'] },
            },
          },
        },
      },
    },
  ]);

  // 3. Operational Analytics
  const totalDispatches = await DispatchLog.countDocuments();
  const totalReturns = await ReturnLog.countDocuments();
  const totalSettlements = await SettlementLog.countDocuments();

  const dispatchModes = await DispatchLog.aggregate([
    { $group: { _id: '$dispatchMode', count: { $sum: 1 } } },
  ]);

  const returnReasons = await ReturnLog.aggregate([
    { $group: { _id: '$returnReason', count: { $sum: 1 } } },
  ]);

  // Page settlement totals
  const pageMetrics = await SettlementLog.aggregate([
    {
      $group: {
        _id: null,
        totalCalculatedPages: { $sum: '$totalCalculatedPages' },
        totalUsedPages: { $sum: '$usedPages' },
        totalUnusedPages: { $sum: '$unusedPages' },
      },
    },
  ]);

  const pageTotals = pageMetrics[0] || {
    totalCalculatedPages: 0,
    totalUsedPages: 0,
    totalUnusedPages: 0,
  };

  // 4. Activity Analytics
  const recentActivities = await ActivityLog.find().sort({ timestamp: -1 }).limit(10);

  return {
    devoteeAnalytics: {
      total: totalDevotees,
      active: activeDevotees,
      inactive: inactiveDevotees,
      deceased: deceasedDevotees,
      withAllocatedBooks: devoteesWithAllocatedBooks,
      interestBreakdown: interestBreakdown.map((i) => ({
        name: i._id || 'Undecided',
        value: i.count,
      })),
    },
    inventoryAnalytics: {
      total: totalBooks,
      available: availableBooks,
      allocated: allocatedBooks,
      settled: settledBooks,
      availablePercentage: totalBooks > 0 ? Math.round((availableBooks / totalBooks) * 100) : 0,
      batches: batchInventory,
    },
    operationalAnalytics: {
      totalDispatches,
      totalReturns,
      totalSettlements,
      dispatchModes: dispatchModes.map((m) => ({ mode: m._id, count: m.count })),
      returnReasons: returnReasons.map((r) => ({ reason: r._id, count: r.count })),
      pageTotals,
    },
    activityAnalytics: recentActivities,
  };
}

module.exports = { getCompleteAnalytics };

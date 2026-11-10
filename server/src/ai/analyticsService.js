const Devotee = require('../models/Devotee');
const Book = require('../models/Book');
const DispatchLog = require('../models/DispatchLog');
const ReturnLog = require('../models/ReturnLog');
const SettlementLog = require('../models/SettlementLog');
const ActivityLog = require('../models/ActivityLog');
const { getBatchesWithStockCounts } = require('../services/batchQueryService');

/**
 * Calculates comprehensive operational analytics strictly from real MongoDB records,
 * running all aggregations in parallel for fast dashboard response times.
 */
async function getCompleteAnalytics() {
  const [
    devoteeStatusAgg,
    interestBreakdown,
    devoteesWithAllocatedBooks,
    bookStatusAgg,
    batchInventoryRaw,
    totalDispatches,
    totalReturns,
    totalSettlements,
    dispatchModes,
    returnReasons,
    pageMetrics,
    recentActivities,
  ] = await Promise.all([
    Devotee.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Devotee.aggregate([{ $group: { _id: '$nextYearInterest', count: { $sum: 1 } } }]),
    Devotee.countDocuments({ allocatedBooksCount: { $gt: 0 } }),
    Book.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    getBatchesWithStockCounts(),
    DispatchLog.countDocuments(),
    ReturnLog.countDocuments(),
    SettlementLog.countDocuments(),
    DispatchLog.aggregate([{ $group: { _id: '$dispatchMode', count: { $sum: 1 } } }]),
    ReturnLog.aggregate([{ $group: { _id: '$returnReason', count: { $sum: 1 } } }]),
    SettlementLog.aggregate([
      {
        $group: {
          _id: null,
          totalCalculatedPages: { $sum: '$totalCalculatedPages' },
          totalUsedPages: { $sum: '$usedPages' },
          totalUnusedPages: { $sum: '$unusedPages' },
        },
      },
    ]),
    ActivityLog.find().sort({ timestamp: -1 }).limit(10).lean(),
  ]);

  const devoteeStatusMap = Object.fromEntries(devoteeStatusAgg.map((s) => [s._id, s.count]));
  const activeDevotees = devoteeStatusMap.Active || 0;
  const inactiveDevotees = devoteeStatusMap.Inactive || 0;
  const deceasedDevotees = devoteeStatusMap.Deceased || 0;
  const totalDevotees = activeDevotees + inactiveDevotees + deceasedDevotees;

  const bookStatusMap = Object.fromEntries(bookStatusAgg.map((b) => [b._id, b.count]));
  const availableBooks = bookStatusMap.Available || 0;
  const allocatedBooks = bookStatusMap.Allocated || 0;
  const settledBooks = bookStatusMap.Settled || 0;
  const totalBooks = availableBooks + allocatedBooks + settledBooks;

  const batchInventory = batchInventoryRaw.map((b) => ({
    batchName: b.batchName,
    batchPrefix: b.batchPrefix,
    totalBooks: b.totalBooks,
    isActive: b.isActive,
    available: b.availableBooks,
    allocated: b.allocatedBooks,
    settled: b.settledBooks,
  }));

  const pageTotals = pageMetrics[0] || {
    totalCalculatedPages: 0,
    totalUsedPages: 0,
    totalUnusedPages: 0,
  };

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

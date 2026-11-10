const Devotee = require('../models/Devotee');
const Book = require('../models/Book');
const PrintBatch = require('../models/PrintBatch');
const DispatchLog = require('../models/DispatchLog');
const ReturnLog = require('../models/ReturnLog');
const { detectOperationalInsights } = require('./insightService');
const { getBatchesWithStockCounts } = require('../services/batchQueryService');
const { escapeRegex } = require('../utils/regexHelper');

/**
 * Predefined, verified Tool functions that execute strictly validated
 * database reads. The LLM never writes directly to MongoDB.
 */
const tools = {
  getDevoteeOverview: async () => {
    const [total, active, inactive, deceased, nextYearInterested] = await Promise.all([
      Devotee.countDocuments(),
      Devotee.countDocuments({ status: 'Active' }),
      Devotee.countDocuments({ status: 'Inactive' }),
      Devotee.countDocuments({ status: 'Deceased' }),
      Devotee.countDocuments({ nextYearInterest: { $in: ['Yes', 'High Probability'] } }),
    ]);

    return {
      totalDevotees: total,
      activeDevotees: active,
      inactiveDevotees: inactive,
      deceasedDevotees: deceased,
      nextYearInterested,
    };
  },

  getInventoryStatus: async () => {
    const [total, available, allocated, settled] = await Promise.all([
      Book.countDocuments(),
      Book.countDocuments({ status: 'Available' }),
      Book.countDocuments({ status: 'Allocated' }),
      Book.countDocuments({ status: 'Settled' }),
    ]);

    return {
      totalBooks: total,
      availableBooks: available,
      allocatedBooks: allocated,
      settledBooks: settled,
      availablePercentage: total > 0 ? `${Math.round((available / total) * 100)}%` : '0%',
    };
  },

  getBatchStockSummary: async () => {
    const batches = await getBatchesWithStockCounts();
    const summaries = batches.map((b) => ({
      batchName: b.batchName,
      prefix: b.batchPrefix,
      totalBooks: b.totalBooks,
      available: b.availableBooks,
      allocated: b.allocatedBooks,
      settled: b.settledBooks,
      remainingStockPercent: b.remainingStockRatio,
      isActive: b.isActive,
    }));

    summaries.sort((a, b) => b.available - a.available);
    return summaries;
  },

  getDevoteesWithUnsettledBooks: async (limit = 15) => {
    const devotees = await Devotee.find({ allocatedBooksCount: { $gt: 0 } })
      .sort({ allocatedBooksCount: -1 })
      .limit(parseInt(limit, 10))
      .select('memberId name mobile1 status allocatedBooksCount nextYearInterest district state');

    return devotees;
  },

  getDispatchStatistics: async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const total = await DispatchLog.countDocuments();
    const thisMonth = await DispatchLog.countDocuments({
      dispatchDate: { $gte: startOfMonth },
    });

    const modes = await DispatchLog.aggregate([
      { $group: { _id: '$dispatchMode', count: { $sum: 1 } } },
    ]);

    return {
      totalDispatches: total,
      dispatchesThisMonth: thisMonth,
      byMode: modes.map((m) => ({ mode: m._id, count: m.count })),
    };
  },

  getReturnReasonBreakdown: async () => {
    const total = await ReturnLog.countDocuments();
    const breakdown = await ReturnLog.aggregate([
      { $group: { _id: '$returnReason', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return {
      totalReturns: total,
      mostFrequentReason: breakdown.length > 0 ? breakdown[0]._id : 'None recorded',
      breakdown: breakdown.map((b) => ({ reason: b._id, count: b.count })),
    };
  },

  getNextYearInterestedDevotees: async (limit = 20) => {
    const devotees = await Devotee.find({
      nextYearInterest: { $in: ['Yes', 'High Probability'] },
    })
      .sort({ memberId: 1 })
      .limit(parseInt(limit, 10))
      .select('memberId name mobile1 district state nextYearInterest allocatedBooksCount settledBooksCount');

    return devotees;
  },

  searchRecords: async (query) => {
    const safeQuery = escapeRegex(query);
    if (!safeQuery) return { devotees: [], books: [], batches: [] };

    const regex = new RegExp(safeQuery, 'i');

    const [devotees, books, batches] = await Promise.all([
      Devotee.find({
        $or: [{ memberId: regex }, { name: regex }, { mobile1: regex }, { cityVillage: regex }],
      })
        .limit(5)
        .select('memberId name mobile1 status cityVillage district allocatedBooksCount')
        .lean(),
      Book.find({
        $or: [{ bookNumber: regex }, { currentDevoteeId: regex }, { batchName: regex }],
      })
        .limit(5)
        .select('bookNumber batchName status currentDevoteeId currentDevoteeName')
        .lean(),
      PrintBatch.find({
        $or: [{ batchName: regex }, { batchPrefix: regex }],
      })
        .limit(5)
        .select('batchName batchPrefix totalBooks isActive')
        .lean(),
    ]);

    return { devotees, books, batches };
  },

  detectAnomalies: async () => {
    return await detectOperationalInsights();
  },
};

module.exports = { tools };

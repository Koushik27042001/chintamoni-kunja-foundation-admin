const Devotee = require('../models/Devotee');
const Book = require('../models/Book');
const PrintBatch = require('../models/PrintBatch');
const DispatchLog = require('../models/DispatchLog');
const ReturnLog = require('../models/ReturnLog');
const SettlementLog = require('../models/SettlementLog');
const { detectOperationalInsights } = require('./insightService');

/**
 * Predefined, verified Tool functions that execute strictly validated
 * database reads. The LLM never writes directly to MongoDB.
 */
const tools = {
  getDevoteeOverview: async () => {
    const total = await Devotee.countDocuments();
    const active = await Devotee.countDocuments({ status: 'Active' });
    const inactive = await Devotee.countDocuments({ status: 'Inactive' });
    const deceased = await Devotee.countDocuments({ status: 'Deceased' });
    const nextYearInterested = await Devotee.countDocuments({
      nextYearInterest: { $in: ['Yes', 'High Probability'] },
    });

    return {
      totalDevotees: total,
      activeDevotees: active,
      inactiveDevotees: inactive,
      deceasedDevotees: deceased,
      nextYearInterested,
    };
  },

  getInventoryStatus: async () => {
    const total = await Book.countDocuments();
    const available = await Book.countDocuments({ status: 'Available' });
    const allocated = await Book.countDocuments({ status: 'Allocated' });
    const settled = await Book.countDocuments({ status: 'Settled' });

    return {
      totalBooks: total,
      availableBooks: available,
      allocatedBooks: allocated,
      settledBooks: settled,
      availablePercentage: total > 0 ? `${Math.round((available / total) * 100)}%` : '0%',
    };
  },

  getBatchStockSummary: async () => {
    const batches = await PrintBatch.find().sort({ createdAt: -1 });
    const summaries = await Promise.all(
      batches.map(async (b) => {
        const available = await Book.countDocuments({ batchId: b._id, status: 'Available' });
        const allocated = await Book.countDocuments({ batchId: b._id, status: 'Allocated' });
        const settled = await Book.countDocuments({ batchId: b._id, status: 'Settled' });
        return {
          batchName: b.batchName,
          prefix: b.batchPrefix,
          totalBooks: b.totalBooks,
          available,
          allocated,
          settled,
          remainingStockPercent: b.totalBooks > 0 ? Math.round((available / b.totalBooks) * 100) : 0,
          isActive: b.isActive,
        };
      })
    );

    // Sort by highest remaining available stock
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
    if (!query || !query.trim()) return { devotees: [], books: [], batches: [] };

    const regex = new RegExp(query.trim(), 'i');

    const devotees = await Devotee.find({
      $or: [{ memberId: regex }, { name: regex }, { mobile1: regex }, { cityVillage: regex }],
    })
      .limit(5)
      .select('memberId name mobile1 status cityVillage district allocatedBooksCount');

    const books = await Book.find({
      $or: [{ bookNumber: regex }, { currentDevoteeId: regex }, { batchName: regex }],
    })
      .limit(5)
      .select('bookNumber batchName status currentDevoteeId currentDevoteeName');

    const batches = await PrintBatch.find({
      $or: [{ batchName: regex }, { batchPrefix: regex }],
    })
      .limit(5)
      .select('batchName batchPrefix totalBooks isActive');

    return { devotees, books, batches };
  },

  detectAnomalies: async () => {
    return await detectOperationalInsights();
  },
};

module.exports = { tools };

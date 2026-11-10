const PrintBatch = require('../models/PrintBatch');

/**
 * Retrieves all print batches along with real-time book counts
 * (Available, Allocated, Settled) using a single MongoDB aggregation
 * pipeline instead of N+1 countDocuments queries.
 */
async function getBatchesWithStockCounts() {
  return PrintBatch.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: 'batchId',
        as: 'books',
      },
    },
    {
      $addFields: {
        availableBooks: {
          $size: {
            $filter: {
              input: '$books',
              as: 'b',
              cond: { $eq: ['$$b.status', 'Available'] },
            },
          },
        },
        allocatedBooks: {
          $size: {
            $filter: {
              input: '$books',
              as: 'b',
              cond: { $eq: ['$$b.status', 'Allocated'] },
            },
          },
        },
        settledBooks: {
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
    {
      $addFields: {
        remainingStockRatio: {
          $cond: [
            { $gt: ['$totalBooks', 0] },
            { $round: [{ $multiply: [{ $divide: ['$availableBooks', '$totalBooks'] }, 100] }, 0] },
            0,
          ],
        },
      },
    },
    { $project: { books: 0 } },
  ]);
}

module.exports = { getBatchesWithStockCounts };

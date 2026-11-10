const Devotee = require('../models/Devotee');
const Book = require('../models/Book');
const DispatchLog = require('../models/DispatchLog');
const { getBatchesWithStockCounts } = require('../services/batchQueryService');

/**
 * Scans database for real-time operational anomalies, inventory thresholds,
 * and data integrity inconsistencies with single-pass parallel queries.
 */
async function detectOperationalInsights() {
  const insights = [];

  // Use distinct() instead of fetching full Book documents
  const allocatedDevoteeIds = (await Book.distinct('currentDevoteeId', { status: 'Allocated' })).filter(
    Boolean
  );

  const [
    problematicHolders,
    allBatches,
    heavyHolders,
    dispatchesMissingTracking,
    orphanAllocatedCount,
  ] = await Promise.all([
    Devotee.find({
      memberId: { $in: allocatedDevoteeIds },
      status: { $in: ['Deceased', 'Inactive'] },
    })
      .select('memberId name mobile1 status allocatedBooksCount')
      .lean(),
    getBatchesWithStockCounts(),
    Devotee.find({ allocatedBooksCount: { $gte: 5 }, status: 'Active' })
      .select('memberId name allocatedBooksCount')
      .lean(),
    DispatchLog.countDocuments({
      trackingIdOrReceiver: { $in: ['', 'N/A', 'none', 'pending'] },
    }),
    Book.countDocuments({
      status: 'Allocated',
      $or: [{ currentDevoteeId: null }, { currentDevoteeId: '' }],
    }),
  ]);

  const deceasedDevoteesWithBooks = problematicHolders.filter((d) => d.status === 'Deceased');
  const inactiveDevoteesWithBooks = problematicHolders.filter((d) => d.status === 'Inactive');

  if (deceasedDevoteesWithBooks.length > 0) {
    insights.push({
      id: 'deceased_with_books',
      category: 'Inconsistency',
      severity: 'Critical',
      title: 'Deceased Devotees With Allocated Books',
      description: `Detected ${deceasedDevoteesWithBooks.length} devotee record(s) marked as Deceased who still have bill books allocated in the system.`,
      affectedCount: deceasedDevoteesWithBooks.length,
      affectedRecords: deceasedDevoteesWithBooks,
      impact: 'Physical books may be stranded; inventory counts are artificially locked.',
      recommendedAction: 'Process return of allocated books or conduct final settlement.',
      actionType: 'RETURN_BOOKS',
    });
  }

  if (inactiveDevoteesWithBooks.length > 0) {
    insights.push({
      id: 'inactive_with_books',
      category: 'Devotee',
      severity: 'Warning',
      title: 'Inactive Devotees Holding Books',
      description: `${inactiveDevoteesWithBooks.length} inactive devotee(s) still hold physical bill books without settlement.`,
      affectedCount: inactiveDevoteesWithBooks.length,
      affectedRecords: inactiveDevoteesWithBooks,
      impact: 'Risk of uncollected funds or lost bill receipts.',
      recommendedAction: 'Contact field operators to collect books or initiate Return/Bounce workflow.',
      actionType: 'CONTACT_DEVOTEE',
    });
  }

  if (orphanAllocatedCount > 0) {
    insights.push({
      id: 'inconsistent_book_status',
      category: 'Inconsistency',
      severity: 'Critical',
      title: 'Inconsistent Book Status (Allocated Without Devotee)',
      description: `${orphanAllocatedCount} book(s) have status "Allocated" but no currentDevoteeId assigned.`,
      affectedCount: orphanAllocatedCount,
      affectedRecords: [],
      impact: 'Inventory availability and settlement metrics may be skewed.',
      recommendedAction: 'Audit affected books and restore unlinked books to Available.',
      actionType: 'AUDIT_BOOKS',
    });
  }

  // Low inventory check on active batches (< 15% available)
  for (const batch of allBatches) {
    if (!batch.isActive) continue;
    if (batch.remainingStockRatio <= 15) {
      insights.push({
        id: `low_stock_${batch._id}`,
        category: 'Inventory',
        severity: batch.remainingStockRatio <= 5 ? 'Critical' : 'Warning',
        title: `Low Stock in Active Batch "${batch.batchName}"`,
        description: `Batch ${batch.batchName} has only ${batch.availableBooks} book(s) left out of ${batch.totalBooks} (${batch.remainingStockRatio}% remaining).`,
        affectedCount: batch.availableBooks,
        affectedRecords: [
          { batchName: batch.batchName, total: batch.totalBooks, remaining: batch.availableBooks },
        ],
        impact: 'Field operations will be halted once available stock reaches zero.',
        recommendedAction: 'Trigger a new Print Batch order for physical bill books.',
        actionType: 'CREATE_BATCH',
      });
    }
  }

  if (heavyHolders.length > 0) {
    insights.push({
      id: 'heavy_book_holders',
      category: 'Settlement',
      severity: 'Notice',
      title: 'Devotees With Multiple Allocated Books',
      description: `${heavyHolders.length} devotee(s) currently hold 5 or more allocated bill books simultaneously.`,
      affectedCount: heavyHolders.length,
      affectedRecords: heavyHolders,
      impact: 'High exposure of unsubmitted collections across regions.',
      recommendedAction: 'Schedule an administrative check-in for partial final settlement.',
      actionType: 'SCHEDULE_SETTLEMENT',
    });
  }

  if (dispatchesMissingTracking > 0) {
    insights.push({
      id: 'missing_tracking_ids',
      category: 'Dispatch',
      severity: 'Notice',
      title: 'Dispatches With Missing Tracking Reference',
      description: `${dispatchesMissingTracking} dispatch log(s) do not contain valid courier tracking IDs or receiver signatures.`,
      affectedCount: dispatchesMissingTracking,
      affectedRecords: [],
      impact: 'Undelivered parcel tracking and post bounce reconciliation cannot be audited.',
      recommendedAction: 'Update postal tracking receipts for recent dispatches.',
      actionType: 'UPDATE_TRACKING',
    });
  }

  return insights;
}

module.exports = { detectOperationalInsights };

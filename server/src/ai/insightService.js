const Devotee = require('../models/Devotee');
const Book = require('../models/Book');
const PrintBatch = require('../models/PrintBatch');
const DispatchLog = require('../models/DispatchLog');

/**
 * Scans database for real-time operational anomalies, inventory thresholds,
 * and data integrity inconsistencies.
 */
async function detectOperationalInsights() {
  const insights = [];

  // 1. Critical: Deceased devotees with allocated books
  const deceasedWithBooks = await Book.find({
    status: 'Allocated',
  });
  const allocatedDevoteeIds = [...new Set(deceasedWithBooks.map((b) => b.currentDevoteeId).filter(Boolean))];

  const deceasedDevoteesWithBooks = await Devotee.find({
    memberId: { $in: allocatedDevoteeIds },
    status: 'Deceased',
  });

  if (deceasedDevoteesWithBooks.length > 0) {
    insights.push({
      id: 'deceased_with_books',
      category: 'Inconsistency',
      severity: 'Critical',
      title: 'Deceased Devotees With Allocated Books',
      description: `Detected ${deceasedDevoteesWithBooks.length} devotee record(s) marked as Deceased who still have bill books allocated in the system.`,
      affectedCount: deceasedDevoteesWithBooks.length,
      affectedRecords: deceasedDevoteesWithBooks.map((d) => ({
        memberId: d.memberId,
        name: d.name,
        allocatedCount: d.allocatedBooksCount,
      })),
      impact: 'Physical books may be stranded; inventory counts are artificially locked.',
      recommendedAction: 'Process return of allocated books or conduct final settlement.',
      actionType: 'RETURN_BOOKS',
    });
  }

  // 2. Warning: Inactive devotees with allocated books
  const inactiveDevoteesWithBooks = await Devotee.find({
    memberId: { $in: allocatedDevoteeIds },
    status: 'Inactive',
  });

  if (inactiveDevoteesWithBooks.length > 0) {
    insights.push({
      id: 'inactive_with_books',
      category: 'Devotee',
      severity: 'Warning',
      title: 'Inactive Devotees Holding Books',
      description: `${inactiveDevoteesWithBooks.length} inactive devotee(s) still hold physical bill books without settlement.`,
      affectedCount: inactiveDevoteesWithBooks.length,
      affectedRecords: inactiveDevoteesWithBooks.map((d) => ({
        memberId: d.memberId,
        name: d.name,
        mobile: d.mobile1,
        allocatedCount: d.allocatedBooksCount,
      })),
      impact: 'Risk of uncollected funds or lost bill receipts.',
      recommendedAction: 'Contact field operators to collect books or initiate Return/Bounce workflow.',
      actionType: 'CONTACT_DEVOTEE',
    });
  }

  // 3. Warning: Low inventory on active batches (< 15% available)
  const activeBatches = await PrintBatch.find({ isActive: true });
  for (const batch of activeBatches) {
    const available = await Book.countDocuments({ batchId: batch._id, status: 'Available' });
    const ratio = batch.totalBooks > 0 ? (available / batch.totalBooks) * 100 : 0;
    if (ratio <= 15) {
      insights.push({
        id: `low_stock_${batch._id}`,
        category: 'Inventory',
        severity: ratio <= 5 ? 'Critical' : 'Warning',
        title: `Low Stock in Active Batch "${batch.batchName}"`,
        description: `Batch ${batch.batchName} has only ${available} book(s) left out of ${batch.totalBooks} (${Math.round(ratio)}% remaining).`,
        affectedCount: available,
        affectedRecords: [{ batchName: batch.batchName, total: batch.totalBooks, remaining: available }],
        impact: 'Field operations will be halted once available stock reaches zero.',
        recommendedAction: 'Trigger a new Print Batch order for physical bill books.',
        actionType: 'CREATE_BATCH',
      });
    }
  }

  // 4. Notice: Pending settlements (devotees holding 5 or more books)
  const heavyHolders = await Devotee.find({
    allocatedBooksCount: { $gte: 5 },
    status: 'Active',
  });

  if (heavyHolders.length > 0) {
    insights.push({
      id: 'heavy_book_holders',
      category: 'Settlement',
      severity: 'Notice',
      title: 'Devotees With Multiple Allocated Books',
      description: `${heavyHolders.length} devotee(s) currently hold 5 or more allocated bill books simultaneously.`,
      affectedCount: heavyHolders.length,
      affectedRecords: heavyHolders.map((d) => ({
        memberId: d.memberId,
        name: d.name,
        allocatedCount: d.allocatedBooksCount,
      })),
      impact: 'High exposure of unsubmitted collections across regions.',
      recommendedAction: 'Schedule an administrative check-in for partial final settlement.',
      actionType: 'SCHEDULE_SETTLEMENT',
    });
  }

  // 5. Notice: Dispatches without tracking ID
  const dispatchesMissingTracking = await DispatchLog.countDocuments({
    trackingIdOrReceiver: { $in: ['', 'N/A', 'none', 'pending'] },
  });

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

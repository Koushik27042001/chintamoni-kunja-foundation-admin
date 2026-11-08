const { tools } = require('./tools');

/**
 * Intelligent AI Operations Manager & Data Analyst
 * Processes natural-language inquiries, dispatches to tool handlers,
 * and formats structured operational analysis.
 */
async function processAIQuery(prompt, context = {}) {
  const normalized = (prompt || '').toLowerCase().trim();

  // 1. Devotee Count / Registrations
  if (
    normalized.includes('how many devotees') ||
    normalized.includes('devotee count') ||
    normalized.includes('registered devotees') ||
    normalized.includes('active and inactive')
  ) {
    const stats = await tools.getDevoteeOverview();
    return {
      type: 'DEVOTEE_OVERVIEW',
      reply: `Currently, there are **${stats.totalDevotees} devotees** registered in DevoteeDesk. Breakdown: **${stats.activeDevotees} Active**, **${stats.inactiveDevotees} Inactive**, and **${stats.deceasedDevotees} Deceased**. There are **${stats.nextYearInterested} devotees** interested in next year's seva.`,
      data: stats,
      suggestions: [
        'Show devotees with unsettled books',
        'Show next-year interested devotees',
        'Identify unusual database records',
      ],
    };
  }

  // 2. Inventory / Book Availability
  if (
    normalized.includes('how many books are available') ||
    normalized.includes('how many books are allocated') ||
    normalized.includes('available books') ||
    normalized.includes('book status') ||
    normalized.includes('inventory status')
  ) {
    const inv = await tools.getInventoryStatus();
    return {
      type: 'INVENTORY_STATUS',
      reply: `DevoteeDesk Inventory holds **${inv.totalBooks} total books**. Right now, **${inv.availableBooks} books (${inv.availablePercentage}) are Available** for issue, **${inv.allocatedBooks} books are Allocated** in the field, and **${inv.settledBooks} books are Settled**.`,
      data: inv,
      suggestions: [
        'Which print batch has the highest remaining stock?',
        'Show devotees with unsettled books',
        'Identify unusual database records',
      ],
    };
  }

  // 3. Highest Remaining Stock Batch
  if (
    normalized.includes('highest remaining stock') ||
    normalized.includes('which print batch') ||
    normalized.includes('batch stock') ||
    normalized.includes('remaining stock')
  ) {
    const batches = await tools.getBatchStockSummary();
    if (batches.length === 0) {
      return {
        type: 'BATCH_SUMMARY',
        reply: 'There are currently no print batches created in the database.',
        data: [],
      };
    }
    const topBatch = batches[0];
    return {
      type: 'BATCH_SUMMARY',
      reply: `Print Batch **"${topBatch.batchName}"** (${topBatch.prefix}) currently has the highest remaining stock with **${topBatch.available} books available** (${topBatch.remainingStockPercent}% remaining of ${topBatch.totalBooks} total books).`,
      data: batches,
      suggestions: ['How many books are allocated?', 'Show devotees with unsettled books'],
    };
  }

  // 4. Devotees with Unsettled Books
  if (
    normalized.includes('unsettled books') ||
    normalized.includes('not completed settlement') ||
    normalized.includes('pending settlement') ||
    normalized.includes('who have not settled')
  ) {
    const unsettled = await tools.getDevoteesWithUnsettledBooks(10);
    return {
      type: 'DEVOTEES_UNSETTLED',
      reply: `Found **${unsettled.length} devotees** holding active physical bill books pending final settlement. Here is the operational summary:`,
      table: {
        headers: ['Member ID', 'Devotee Name', 'Mobile', 'Status', 'Allocated Books', 'District'],
        rows: unsettled.map((d) => [
          d.memberId,
          d.name,
          d.mobile1,
          d.status,
          d.allocatedBooksCount,
          d.district || 'N/A',
        ]),
      },
      data: unsettled,
      suggestions: [
        'Which return reason is most frequent?',
        'Identify unusual database records',
        'Generate a complete operational report',
      ],
    };
  }

  // 5. Monthly Dispatches
  if (
    normalized.includes('dispatches happened') ||
    normalized.includes('dispatch count') ||
    normalized.includes('how many dispatches') ||
    normalized.includes('dispatches this month')
  ) {
    const dispatches = await tools.getDispatchStatistics();
    return {
      type: 'DISPATCH_STATS',
      reply: `A total of **${dispatches.totalDispatches} dispatches** have been recorded in DevoteeDesk, with **${dispatches.dispatchesThisMonth} dispatches** executed during the current calendar month.`,
      data: dispatches,
      suggestions: [
        'Which return reason is most frequent?',
        'How many books are available?',
      ],
    };
  }

  // 6. Return Reasons
  if (
    normalized.includes('return reason') ||
    normalized.includes('frequent return') ||
    normalized.includes('why are books returned') ||
    normalized.includes('bounce reason')
  ) {
    const returns = await tools.getReturnReasonBreakdown();
    return {
      type: 'RETURN_REASONS',
      reply: `The most frequent return reason recorded across ${returns.totalReturns} total return events is: **"${returns.mostFrequentReason}"**.`,
      data: returns,
      suggestions: [
        'Show devotees with unsettled books',
        'Identify unusual database records',
      ],
    };
  }

  // 7. Next-Year Interested Devotees
  if (
    normalized.includes('next-year interested') ||
    normalized.includes('next year interest') ||
    normalized.includes('interested devotees')
  ) {
    const devotees = await tools.getNextYearInterestedDevotees(15);
    return {
      type: 'NEXT_YEAR_INTEREST',
      reply: `Here are **${devotees.length} devotees** who have confirmed next-year seva participation (Yes / High Probability):`,
      table: {
        headers: ['Member ID', 'Name', 'Mobile', 'Interest Status', 'District', 'Allocated'],
        rows: devotees.map((d) => [
          d.memberId,
          d.name,
          d.mobile1,
          d.nextYearInterest,
          d.district || 'N/A',
          d.allocatedBooksCount,
        ]),
      },
      data: devotees,
      suggestions: [
        'Generate a complete operational report',
        'How many devotees are registered?',
      ],
    };
  }

  // 8. Identify Inconsistencies / Anomalies
  if (
    normalized.includes('unusual') ||
    normalized.includes('inconsistent') ||
    normalized.includes('anomalies') ||
    normalized.includes('detect issues') ||
    normalized.includes('audit')
  ) {
    const anomalies = await tools.detectAnomalies();
    return {
      type: 'ANOMALIES_DETECTED',
      reply: `The AI Anomaly Engine conducted an audit of all active tables and detected **${anomalies.length} operational attention item(s)**:`,
      data: anomalies,
      suggestions: [
        'Show devotees with unsettled books',
        'Which print batch has the highest remaining stock?',
        'Generate a complete operational report',
      ],
    };
  }

  // 9. Complete Operational Report
  if (
    normalized.includes('complete operational report') ||
    normalized.includes('operational report') ||
    normalized.includes('executive summary')
  ) {
    const devoteeStats = await tools.getDevoteeOverview();
    const invStats = await tools.getInventoryStatus();
    const dispatchStats = await tools.getDispatchStatistics();
    const returnStats = await tools.getReturnReasonBreakdown();
    const anomalies = await tools.detectAnomalies();

    return {
      type: 'EXECUTIVE_REPORT',
      reply: `### 📊 DevoteeDesk Executive Operational Report\n\n- **Devotees Directory**: ${devoteeStats.totalDevotees} Total (${devoteeStats.activeDevotees} Active, ${devoteeStats.inactiveDevotees} Inactive, ${devoteeStats.deceasedDevotees} Deceased)\n- **Inventory Status**: ${invStats.totalBooks} Total Books (${invStats.availableBooks} Available, ${invStats.allocatedBooks} Allocated, ${invStats.settledBooks} Settled)\n- **Dispatches**: ${dispatchStats.totalDispatches} Dispatches (${dispatchStats.dispatchesThisMonth} This Month)\n- **Returns & Bounces**: ${returnStats.totalReturns} Returns (Top reason: ${returnStats.mostFrequentReason})\n- **Active Anomaly Alerts**: ${anomalies.length} Flagged Issues`,
      data: { devoteeStats, invStats, dispatchStats, returnStats, anomaliesCount: anomalies.length },
      suggestions: [
        'Export devotees report to Excel',
        'Export inventory report to Excel',
        'Identify unusual database records',
      ],
    };
  }

  // 10. Direct Search query (Search by Member ID, Name, Book, Batch)
  const searchMatch = await tools.searchRecords(prompt);
  if (
    searchMatch.devotees.length > 0 ||
    searchMatch.books.length > 0 ||
    searchMatch.batches.length > 0
  ) {
    return {
      type: 'SEARCH_RESULTS',
      reply: `Found matching records in database for **"${prompt}"**:`,
      data: searchMatch,
      suggestions: [
        'How many devotees are registered?',
        'How many books are available?',
      ],
    };
  }

  // General Fallback
  const generalStats = await tools.getDevoteeOverview();
  const generalInv = await tools.getInventoryStatus();
  return {
    type: 'GENERAL_RESPONSE',
    reply: `I am your **DevoteeDesk AI Operations Manager & Data Analyst**. I have live access to all ${generalStats.totalDevotees} devotee records, ${generalInv.totalBooks} inventory bill books, print batches, dispatches, and returns. Ask me any question, for example:`,
    suggestions: [
      'How many devotees are registered?',
      'How many books are available?',
      'Which print batch has the highest remaining stock?',
      'Show devotees with unsettled books',
      'Identify unusual database records',
      'Generate a complete operational report',
    ],
  };
}

module.exports = { processAIQuery };

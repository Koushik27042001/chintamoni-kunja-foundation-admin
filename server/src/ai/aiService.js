const { tools } = require('./tools');

const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'getDevoteeOverview',
      description: 'Get total registered devotees, active, inactive, deceased, and next-year interest counts.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getInventoryStatus',
      description: 'Get total books, available, allocated, settled counts and remaining stock percentage.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getBatchStockSummary',
      description: 'Get batch-wise book inventory sorted by highest remaining available stock.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getDevoteesWithUnsettledBooks',
      description: 'Find devotees currently holding unsettled / allocated bill books.',
      parameters: {
        type: 'object',
        properties: { limit: { type: 'number', description: 'Max records to return' } },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getDispatchStatistics',
      description: 'Get total dispatches, dispatches this month, and breakdown by mode (Post, Courier, Hand).',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getReturnReasonBreakdown',
      description: 'Get return/bounce statistics and the most frequent return reason.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getNextYearInterestedDevotees',
      description: 'List devotees marked interested (Yes or High Probability) for next year.',
      parameters: {
        type: 'object',
        properties: { limit: { type: 'number', description: 'Max records to return' } },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'searchRecords',
      description: 'Search devotees, books, and print batches by Member ID, name, mobile, book number, or location.',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string', description: 'Search keyword' } },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'detectAnomalies',
      description: 'Run automated anomaly audit for low inventory, deceased/inactive holders, and missing tracking.',
      parameters: { type: 'object', properties: {} },
    },
  },
];

const SYSTEM_PROMPT = `You are the DevoteeDesk AI Operations Manager and Data Analyst for Sri Sri Chintamoni Kunja Foundation.
STRICT RULES:
1. Never invent database numbers, devotee names, or inventory counts. Always invoke the provided tools to read verified MongoDB data.
2. Never confuse Available, Allocated, and Settled books. Never assume dispatch equals delivery or settlement.
3. Distinguish verified database facts from your operational recommendations.
4. Keep responses concise, structured in Markdown, and highlight anomalies clearly.`;

/**
 * Invokes configurable OpenAI-compatible LLM with tool calling when API key is present.
 * Returns null if unconfigured so the deterministic engine handles it cleanly.
 */
async function tryLLMWithTools(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const endpoint = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1/chat/completions';
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ];

  try {
    const res1 = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        tools: TOOL_DEFINITIONS,
        tool_choice: 'auto',
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res1.ok) return null;
    const json1 = await res1.json();
    const choice1 = json1.choices?.[0]?.message;
    if (!choice1) return null;

    if (!choice1.tool_calls || choice1.tool_calls.length === 0) {
      return {
        type: 'LLM_RESPONSE',
        reply: choice1.content,
        suggestions: [
          'Show devotees with unsettled books',
          'Identify unusual database records',
          'Generate a complete operational report',
        ],
      };
    }

    // Execute requested read-only backend tools
    messages.push(choice1);
    let capturedData = null;

    for (const tc of choice1.tool_calls) {
      const fnName = tc.function?.name;
      const fn = tools[fnName];
      let result = { error: `Unknown tool: ${fnName}` };
      if (fn) {
        const args = JSON.parse(tc.function.arguments || '{}');
        result = fnName === 'searchRecords' ? await fn(args.query) : await fn(args.limit);
        capturedData = result;
      }
      messages.push({
        role: 'tool',
        tool_call_id: tc.id,
        content: JSON.stringify(result),
      });
    }

    const res2 = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, temperature: 0.2 }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res2.ok) return null;
    const json2 = await res2.json();
    const finalContent = json2.choices?.[0]?.message?.content;
    if (!finalContent) return null;

    return {
      type: 'LLM_TOOL_RESPONSE',
      reply: finalContent,
      data: capturedData,
      suggestions: [
        'Identify unusual database records',
        'Which print batch has the highest remaining stock?',
        'Generate a complete operational report',
      ],
    };
  } catch {
    return null;
  }
}

/**
 * Deterministic Natural Language Query Engine (zero-hallucination fallback)
 */
async function processDeterministicQuery(prompt) {
  const normalized = (prompt || '').toLowerCase().trim();

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
      suggestions: ['Which return reason is most frequent?', 'How many books are available?'],
    };
  }

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
      suggestions: ['Show devotees with unsettled books', 'Identify unusual database records'],
    };
  }

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
      suggestions: ['Generate a complete operational report', 'How many devotees are registered?'],
    };
  }

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

  if (
    normalized.includes('complete operational report') ||
    normalized.includes('operational report') ||
    normalized.includes('executive summary')
  ) {
    const [devoteeStats, invStats, dispatchStats, returnStats, anomalies] = await Promise.all([
      tools.getDevoteeOverview(),
      tools.getInventoryStatus(),
      tools.getDispatchStatistics(),
      tools.getReturnReasonBreakdown(),
      tools.detectAnomalies(),
    ]);

    return {
      type: 'EXECUTIVE_REPORT',
      reply: `### 📊 DevoteeDesk Executive Operational Report\n\n- **Devotees Directory**: ${devoteeStats.totalDevotees} Total (${devoteeStats.activeDevotees} Active, ${devoteeStats.inactiveDevotees} Inactive, ${devoteeStats.deceasedDevotees} Deceased)\n- **Inventory Status**: ${invStats.totalBooks} Total Books (${invStats.availableBooks} Available, ${invStats.allocatedBooks} Allocated, ${invStats.settledBooks} Settled)\n- **Dispatches**: ${dispatchStats.totalDispatches} Dispatches (${dispatchStats.dispatchesThisMonth} This Month)\n- **Returns & Bounces**: ${returnStats.totalReturns} Returns (Top reason: ${returnStats.mostFrequentReason})\n- **Active Anomaly Alerts**: ${anomalies.length} Flagged Issues`,
      data: { devoteeStats, invStats, dispatchStats, returnStats, anomaliesCount: anomalies.length },
      suggestions: ['Show devotees with unsettled books', 'Identify unusual database records'],
    };
  }

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
      suggestions: ['How many devotees are registered?', 'How many books are available?'],
    };
  }

  const [generalStats, generalInv] = await Promise.all([
    tools.getDevoteeOverview(),
    tools.getInventoryStatus(),
  ]);
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

/**
 * Main entry point: tries configurable LLM provider first, falls back safely
 * to deterministic database query engine.
 */
async function processAIQuery(prompt) {
  const llmResponse = await tryLLMWithTools(prompt);
  if (llmResponse) return llmResponse;
  return await processDeterministicQuery(prompt);
}

module.exports = { processAIQuery };

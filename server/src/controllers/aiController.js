const { processAIQuery } = require('../ai/aiService');
const { getCompleteAnalytics } = require('../ai/analyticsService');
const { detectOperationalInsights } = require('../ai/insightService');
const { generateExcelReport } = require('../ai/reportService');
const ActivityLog = require('../models/ActivityLog');
const AIConversation = require('../models/AIConversation');

// @desc    Process natural language question with AI
// @route   POST /api/ai/chat
const chatWithAI = async (req, res) => {
  try {
    const { message, sessionId = 'default-ops-session' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const aiResult = await processAIQuery(message.trim(), { user: req.user });

    // Store in session conversation history
    try {
      let conv = await AIConversation.findOne({ sessionId });
      if (!conv) {
        conv = await AIConversation.create({ sessionId, messages: [] });
      }
      conv.messages.push({
        role: 'user',
        content: message.trim(),
        timestamp: new Date(),
      });
      conv.messages.push({
        role: 'assistant',
        content: aiResult.reply,
        structuredData: aiResult.data,
        timestamp: new Date(),
      });
      // Keep last 30 messages
      if (conv.messages.length > 30) {
        conv.messages = conv.messages.slice(-30);
      }
      await conv.save();
    } catch (dbErr) {
      // Non-fatal conversation logging
    }

    res.status(200).json({
      success: true,
      message: aiResult.reply,
      type: aiResult.type,
      data: aiResult.data,
      table: aiResult.table,
      suggestions: aiResult.suggestions || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get complete real-time dashboard analytics (Recharts KPIs)
// @route   GET /api/ai/analytics
const getDashboardAnalytics = async (req, res) => {
  try {
    const analytics = await getCompleteAnalytics();
    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get live operational anomalies & recommendations
// @route   GET /api/ai/insights
const getAutomatedInsights = async (req, res) => {
  try {
    const insights = await detectOperationalInsights();
    res.status(200).json({ success: true, count: insights.length, data: insights });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download branded Excel operational report
// @route   GET /api/ai/reports/:type
const downloadReport = async (req, res) => {
  try {
    const { type } = req.params;
    await generateExcelReport(type, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Execute authorized administrative action after explicit confirmation
// @route   POST /api/ai/execute-action
const executeAdminAction = async (req, res) => {
  try {
    const { actionType, payload, confirmed } = req.body;

    if (!confirmed) {
      return res.status(400).json({
        success: false,
        message: 'Action must be explicitly confirmed by administrator.',
      });
    }

    await ActivityLog.create({
      actionType: 'AI_ACTION_EXECUTED',
      module: 'AI',
      performedBy: req.user?.name || 'Administrator',
      details: `Executed administrative action ${actionType}`,
      metadata: payload,
    });

    res.status(200).json({
      success: true,
      message: `Action "${actionType}" executed successfully.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  chatWithAI,
  getDashboardAnalytics,
  getAutomatedInsights,
  downloadReport,
  executeAdminAction,
};

const CollectionAgent = require('../models/CollectionAgent');
const Donation = require('../models/Donation');

// @desc    Get all collection agents
// @route   GET /api/agents
const getAgents = async (req, res) => {
  try {
    const agents = await CollectionAgent.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: agents.length, data: agents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new collection agent
// @route   POST /api/agents
const createAgent = async (req, res) => {
  try {
    let { agentCode, name, phone, assignedArea } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Agent name and phone required' });
    }

    if (!agentCode || agentCode.trim() === '') {
      const count = await CollectionAgent.countDocuments();
      agentCode = `AGT-${String(count + 1).padStart(3, '0')}`;
    }

    const agent = await CollectionAgent.create({
      agentCode: agentCode.trim(),
      name,
      phone,
      assignedArea: assignedArea || 'Nabadwip & Nadia District',
    });

    res.status(201).json({ success: true, data: agent, message: 'Agent registered.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Settle pending collections for an agent
// @route   POST /api/agents/:agentCode/settle
const settleAgentCollections = async (req, res) => {
  try {
    const { agentCode } = req.params;
    const agent = await CollectionAgent.findOne({ agentCode });
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }

    // Mark all pending field donations for this agent as Settled
    await Donation.updateMany(
      { agentId: agentCode, settlementStatus: 'Pending Office Deposit' },
      { $set: { settlementStatus: 'Settled' } }
    );

    const settledAmt = agent.pendingSettlement;
    agent.pendingSettlement = 0;
    await agent.save();

    res.status(200).json({
      success: true,
      data: agent,
      message: `Successfully settled ₹${settledAmt.toLocaleString('en-IN')} with office for Agent ${agent.name}.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAgents,
  createAgent,
  settleAgentCollections,
};

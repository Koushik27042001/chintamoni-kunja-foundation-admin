const DispatchLog = require('../models/DispatchLog');
const Devotee = require('../models/Devotee');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all dispatch logs with filters
// @route   GET /api/dispatch
const getDispatches = async (req, res) => {
  try {
    const { memberId, dispatchMode, q, page = 1, limit = 50 } = req.query;
    let query = {};

    if (memberId) {
      query.memberId = memberId.trim().toUpperCase();
    }
    if (dispatchMode && dispatchMode !== 'All') {
      query.dispatchMode = dispatchMode;
    }
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      query.$or = [
        { memberId: regex },
        { devoteeName: regex },
        { trackingIdOrReceiver: regex },
        { courierName: regex },
        { itemDispatched: regex },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await DispatchLog.countDocuments(query);
    const dispatches = await DispatchLog.find(query)
      .sort({ dispatchDate: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
      count: dispatches.length,
      data: dispatches,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Log a new dispatch event
// @route   POST /api/dispatch
const logDispatch = async (req, res) => {
  try {
    const {
      memberId,
      itemDispatched = 'Bill Books',
      bookNumbers = [],
      batchName = '',
      dispatchMode,
      courierName = '',
      trackingIdOrReceiver,
      dispatchDate,
      remarks,
    } = req.body;

    if (!memberId || !dispatchMode || !trackingIdOrReceiver) {
      return res.status(400).json({
        success: false,
        message: 'Member ID, Dispatch Mode, and Tracking ID/Receiver are required.',
      });
    }

    const devotee = await Devotee.findOne({ memberId: memberId.trim().toUpperCase() });
    if (!devotee) {
      return res.status(404).json({ success: false, message: 'Devotee not found.' });
    }

    // Notice: Dispatch does NOT alter Book status. Preserves business rule!
    const dispatchEntry = await DispatchLog.create({
      memberId: devotee.memberId,
      devoteeName: devotee.name,
      itemDispatched: itemDispatched || 'Bill Books',
      bookNumbers: Array.isArray(bookNumbers) ? bookNumbers : [],
      batchName: batchName || '',
      dispatchMode,
      courierName: courierName || '',
      trackingIdOrReceiver: trackingIdOrReceiver.trim(),
      dispatchDate: dispatchDate || new Date(),
      operatorName: req.user?.name || 'Admin',
      remarks: remarks || '',
    });

    await ActivityLog.create({
      actionType: 'DISPATCH_LOGGED',
      module: 'Dispatch',
      performedBy: req.user?.name || 'Admin',
      memberId: devotee.memberId,
      details: `Dispatched ${itemDispatched} via ${dispatchMode} (${trackingIdOrReceiver}) to ${devotee.name}`,
    });

    res.status(201).json({
      success: true,
      message: 'Dispatch logged successfully.',
      data: dispatchEntry,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDispatches,
  logDispatch,
};

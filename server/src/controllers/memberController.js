const Member = require('../models/Member');

// @desc    Get all members with search & filters
// @route   GET /api/members
const getMembers = async (req, res) => {
  try {
    const { q, category, status } = req.query;
    let query = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { id: { $regex: q, $options: 'i' } },
        { mobile1: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const members = await Member.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching members',
    });
  }
};

// @desc    Get single member by id
// @route   GET /api/members/:id
const getMemberById = async (req, res) => {
  try {
    const member = await Member.findOne({ id: req.params.id }) || await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    res.status(200).json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new member
// @route   POST /api/members
const createMember = async (req, res) => {
  try {
    let { id, name, address1, address2, city, postOffice, district, state, pincode, country, mobile1, mobile2, email, category, status, notes } = req.body;

    if (!name || !mobile1) {
      return res.status(400).json({
        success: false,
        message: 'Name and primary contact (Mobile-1) are required.',
      });
    }

    // Auto-generate ID if not provided
    if (!id || id.trim() === '') {
      const count = await Member.countDocuments();
      id = `CKF-M-${String(count + 1).padStart(3, '0')}`;
    }

    // Check duplicate ID
    const existing = await Member.findOne({ id: id.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Member ID ${id} already exists. Please choose a unique ID.`,
      });
    }

    const member = await Member.create({
      id: id.trim(),
      name,
      address1: address1 || '',
      address2: address2 || '',
      city: city || 'Nabadwip',
      postOffice: postOffice || 'Nabadwip',
      district: district || 'Nadia',
      state: state || 'West Bengal',
      pincode: pincode || '741302',
      country: country || 'India',
      mobile1,
      mobile2: mobile2 || '',
      email: email || '',
      category: category || 'Life Member',
      status: status || 'Active',
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      data: member,
      message: 'Member registered successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk create/import members from CSV or Excel
// @route   POST /api/members/bulk
const bulkCreateMembers = async (req, res) => {
  try {
    const { members } = req.body;
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of members to import.',
      });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.name) {
        errors.push(`Row ${i + 1}: Name is required`);
        continue;
      }

      let memberId = m.id && String(m.id).trim();
      if (!memberId) {
        memberId = `CKF-M-${Date.now().toString().slice(-4)}${i}`;
      }

      try {
        const doc = await Member.findOneAndUpdate(
          { id: memberId },
          {
            $set: {
              name: m.name,
              address1: m.address1 || '',
              address2: m.address2 || '',
              city: m.city || 'Nabadwip',
              postOffice: m.postOffice || 'Nabadwip',
              district: m.district || 'Nadia',
              state: m.state || 'West Bengal',
              pincode: m.pincode || '741302',
              country: m.country || 'India',
              mobile1: m.mobile1 || '',
              mobile2: m.mobile2 || '',
              email: m.email || '',
              category: m.category || 'Life Member',
              status: m.status || 'Active',
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        results.push(doc);
      } catch (err) {
        errors.push(`Row ${i + 1} (${m.name}): ${err.message}`);
      }
    }

    res.status(200).json({
      success: true,
      importedCount: results.length,
      errorsCount: errors.length,
      errors,
      data: results,
      message: `Processed ${results.length} members successfully.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update member
// @route   PUT /api/members/:id
const updateMember = async (req, res) => {
  try {
    const member = await Member.findOneAndUpdate(
      { $or: [{ id: req.params.id }, { _id: req.params.id }] },
      req.body,
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    res.status(200).json({
      success: true,
      data: member,
      message: 'Member updated successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete member
// @route   DELETE /api/members/:id
const deleteMember = async (req, res) => {
  try {
    const member = await Member.findOneAndDelete({
      $or: [{ id: req.params.id }, { _id: req.params.id }],
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    res.status(200).json({
      success: true,
      message: `Member ${member.name} (${member.id}) removed.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk delete members
// @route   POST /api/members/bulk-delete
const bulkDeleteMembers = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide member IDs array to remove.',
      });
    }

    const result = await Member.deleteMany({
      $or: [{ id: { $in: ids } }, { _id: { $in: ids } }],
    });

    res.status(200).json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Successfully removed ${result.deletedCount} members.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMembers,
  getMemberById,
  createMember,
  bulkCreateMembers,
  updateMember,
  deleteMember,
  bulkDeleteMembers,
};

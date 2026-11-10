const Devotee = require('../models/Devotee');
const ActivityLog = require('../models/ActivityLog');
const ExcelJS = require('exceljs');
const { escapeRegex } = require('../utils/regexHelper');

// @desc    Get devotees with search, filters and pagination
// @route   GET /api/devotees
const getDevotees = async (req, res) => {
  try {
    const { q, status, nextYearInterest, district, page = 1, limit = 50 } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }
    if (nextYearInterest && nextYearInterest !== 'All') {
      query.nextYearInterest = nextYearInterest;
    }
    if (district && district !== 'All') {
      query.district = district;
    }

    const safeQ = escapeRegex(q);
    if (safeQ) {
      const regex = new RegExp(safeQ, 'i');
      query.$or = [
        { memberId: regex },
        { name: regex },
        { mobile1: regex },
        { mobile2: regex },
        { cityVillage: regex },
        { district: regex },
      ];
    }

    const parsedLimit = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const [total, devotees] = await Promise.all([
      Devotee.countDocuments(query),
      Devotee.find(query).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit).lean(),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: parsedPage,
      pages: Math.ceil(total / parsedLimit),
      count: devotees.length,
      data: devotees,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single devotee by memberId
// @route   GET /api/devotees/:memberId
const getDevoteeById = async (req, res) => {
  try {
    const devotee = await Devotee.findOne({ memberId: req.params.memberId.trim() });
    if (!devotee) {
      return res.status(404).json({ success: false, message: 'Devotee not found' });
    }
    res.status(200).json({ success: true, data: devotee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register a single devotee
// @route   POST /api/devotees
const createDevotee = async (req, res) => {
  try {
    let {
      memberId,
      name,
      gender,
      mobile1,
      mobile2,
      email,
      address1,
      address2,
      cityVillage,
      postOffice,
      district,
      state,
      pinCode,
      country,
      status,
      nextYearInterest,
      remarks,
    } = req.body;

    if (!memberId || !name || !mobile1) {
      return res.status(400).json({
        success: false,
        message: 'Member ID, Name, and Primary Mobile are mandatory.',
      });
    }

    const existing = await Devotee.findOne({ memberId: memberId.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Devotee with Member ID "${memberId}" already exists.`,
      });
    }

    const devotee = await Devotee.create({
      memberId: memberId.trim().toUpperCase(),
      name: name.trim(),
      gender: gender || 'Male',
      mobile1: mobile1.trim(),
      mobile2: (mobile2 || '').trim(),
      email: (email || '').trim().toLowerCase(),
      address1: address1 || '',
      address2: address2 || '',
      cityVillage: cityVillage || '',
      postOffice: postOffice || '',
      district: district || '',
      state: state || 'West Bengal',
      pinCode: pinCode || '',
      country: country || 'India',
      status: status || 'Active',
      nextYearInterest: nextYearInterest || 'Undecided',
      remarks: remarks || '',
    });

    await ActivityLog.create({
      actionType: 'DEVOTEE_REGISTERED',
      module: 'Devotee',
      performedBy: req.user?.name || 'Admin',
      memberId: devotee.memberId,
      details: `Registered devotee ${devotee.name} (${devotee.memberId})`,
    });

    res.status(201).json({ success: true, data: devotee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update devotee profile
// @route   PUT /api/devotees/:memberId
const updateDevotee = async (req, res) => {
  try {
    const devotee = await Devotee.findOne({ memberId: req.params.memberId.trim() });
    if (!devotee) {
      return res.status(404).json({ success: false, message: 'Devotee not found' });
    }

    const fields = [
      'name',
      'gender',
      'mobile1',
      'mobile2',
      'email',
      'address1',
      'address2',
      'cityVillage',
      'postOffice',
      'district',
      'state',
      'pinCode',
      'country',
      'status',
      'nextYearInterest',
      'remarks',
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) devotee[f] = req.body[f];
    });

    await devotee.save();

    await ActivityLog.create({
      actionType: 'DEVOTEE_UPDATED',
      module: 'Devotee',
      performedBy: req.user?.name || 'Admin',
      memberId: devotee.memberId,
      details: `Updated details for ${devotee.name} (${devotee.memberId})`,
    });

    res.status(200).json({ success: true, data: devotee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk Excel Import
// @route   POST /api/devotees/bulk-import
const bulkImportDevotees = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Excel file is required.' });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.worksheets[0];

    let imported = 0;
    let skipped = 0;
    let errors = [];

    const rows = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        // Skip header row
        const memberId = row.getCell(1).text?.trim();
        const name = row.getCell(2).text?.trim();
        const mobile1 = row.getCell(3).text?.trim();
        if (memberId && name && mobile1) {
          rows.push({
            memberId: memberId.toUpperCase(),
            name,
            mobile1,
            mobile2: row.getCell(4).text?.trim() || '',
            gender: row.getCell(5).text?.trim() || 'Male',
            cityVillage: row.getCell(6).text?.trim() || '',
            district: row.getCell(7).text?.trim() || '',
            state: row.getCell(8).text?.trim() || 'West Bengal',
            pinCode: row.getCell(9).text?.trim() || '',
            status: row.getCell(10).text?.trim() || 'Active',
            nextYearInterest: row.getCell(11).text?.trim() || 'Undecided',
          });
        }
      }
    });

    const seenInFile = new Set();
    const dedupedRows = [];
    for (const r of rows) {
      if (!seenInFile.has(r.memberId)) {
        seenInFile.add(r.memberId);
        dedupedRows.push(r);
      } else {
        skipped++;
      }
    }

    const existingDocs = await Devotee.find({
      memberId: { $in: dedupedRows.map((r) => r.memberId) },
    })
      .select('memberId')
      .lean();
    const existingSet = new Set(existingDocs.map((d) => d.memberId));

    const toInsert = dedupedRows.filter((r) => !existingSet.has(r.memberId));
    skipped += dedupedRows.length - toInsert.length;

    if (toInsert.length > 0) {
      await Devotee.insertMany(toInsert, { ordered: false });
      imported = toInsert.length;
    }

    res.status(200).json({
      success: true,
      message: `Import completed: ${imported} imported, ${skipped} duplicates skipped.`,
      imported,
      skipped,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export devotees to Excel
// @route   GET /api/devotees/export
const exportDevoteesExcel = async (req, res) => {
  try {
    const devotees = await Devotee.find().sort({ memberId: 1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Devotees');

    sheet.columns = [
      { header: 'Member ID', key: 'memberId', width: 14 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'Primary Mobile', key: 'mobile1', width: 16 },
      { header: 'Secondary Mobile', key: 'mobile2', width: 16 },
      { header: 'City / Village', key: 'cityVillage', width: 18 },
      { header: 'District', key: 'district', width: 16 },
      { header: 'State', key: 'state', width: 16 },
      { header: 'PIN Code', key: 'pinCode', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Next Year Interest', key: 'nextYearInterest', width: 18 },
      { header: 'Allocated Books', key: 'allocatedBooksCount', width: 16 },
      { header: 'Settled Books', key: 'settledBooksCount', width: 14 },
    ];

    devotees.forEach((d) => {
      sheet.addRow({
        memberId: d.memberId,
        name: d.name,
        gender: d.gender,
        mobile1: d.mobile1,
        mobile2: d.mobile2,
        cityVillage: d.cityVillage,
        district: d.district,
        state: d.state,
        pinCode: d.pinCode,
        status: d.status,
        nextYearInterest: d.nextYearInterest,
        allocatedBooksCount: d.allocatedBooksCount,
        settledBooksCount: d.settledBooksCount,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=devotees-list.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDevotees,
  getDevoteeById,
  createDevotee,
  updateDevotee,
  bulkImportDevotees,
  exportDevoteesExcel,
};

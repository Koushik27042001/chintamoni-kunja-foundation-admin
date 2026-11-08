const ExcelJS = require('exceljs');
const Devotee = require('../models/Devotee');
const Book = require('../models/Book');
const PrintBatch = require('../models/PrintBatch');
const DispatchLog = require('../models/DispatchLog');
const ReturnLog = require('../models/ReturnLog');
const SettlementLog = require('../models/SettlementLog');

/**
 * Generates branded, styled operational Excel reports for all DevoteeDesk modules.
 */
async function generateExcelReport(reportType, res) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'DevoteeDesk AI Operations Assistant';
  workbook.created = new Date();

  if (reportType === 'devotees') {
    const sheet = workbook.addWorksheet('Devotees Directory');
    sheet.columns = [
      { header: 'Member ID', key: 'memberId', width: 15 },
      { header: 'Full Name', key: 'name', width: 25 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'Primary Mobile', key: 'mobile1', width: 16 },
      { header: 'Secondary Mobile', key: 'mobile2', width: 16 },
      { header: 'Village / City', key: 'cityVillage', width: 18 },
      { header: 'District', key: 'district', width: 16 },
      { header: 'State', key: 'state', width: 16 },
      { header: 'PIN Code', key: 'pinCode', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Next-Year Interest', key: 'nextYearInterest', width: 18 },
      { header: 'Allocated Books', key: 'allocatedBooksCount', width: 16 },
      { header: 'Settled Books', key: 'settledBooksCount', width: 14 },
    ];

    const records = await Devotee.find().sort({ memberId: 1 });
    records.forEach((r) => sheet.addRow(r.toObject()));
  } else if (reportType === 'inventory') {
    const sheet = workbook.addWorksheet('Bill Book Inventory');
    sheet.columns = [
      { header: 'Book Number', key: 'bookNumber', width: 16 },
      { header: 'Batch Name', key: 'batchName', width: 20 },
      { header: 'Bill Start', key: 'startBillNumber', width: 14 },
      { header: 'Bill End', key: 'endBillNumber', width: 14 },
      { header: 'Total Pages', key: 'totalPages', width: 12 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Current Devotee ID', key: 'currentDevoteeId', width: 18 },
      { header: 'Current Devotee Name', key: 'currentDevoteeName', width: 24 },
      { header: 'Allocated At', key: 'allocatedAt', width: 20 },
      { header: 'Settled At', key: 'settledAt', width: 20 },
    ];

    const records = await Book.find().sort({ bookNumber: 1 });
    records.forEach((r) => sheet.addRow(r.toObject()));
  } else if (reportType === 'dispatches') {
    const sheet = workbook.addWorksheet('Dispatch Register');
    sheet.columns = [
      { header: 'Date', key: 'dispatchDate', width: 16 },
      { header: 'Member ID', key: 'memberId', width: 14 },
      { header: 'Devotee Name', key: 'devoteeName', width: 24 },
      { header: 'Item Dispatched', key: 'itemDispatched', width: 20 },
      { header: 'Mode', key: 'dispatchMode', width: 12 },
      { header: 'Courier / Service', key: 'courierName', width: 20 },
      { header: 'Tracking ID / Receiver', key: 'trackingIdOrReceiver', width: 25 },
      { header: 'Batch', key: 'batchName', width: 16 },
      { header: 'Operator', key: 'operatorName', width: 16 },
    ];

    const records = await DispatchLog.find().sort({ dispatchDate: -1 });
    records.forEach((r) => sheet.addRow(r.toObject()));
  } else if (reportType === 'returns') {
    const sheet = workbook.addWorksheet('Return & Bounce Register');
    sheet.columns = [
      { header: 'Date', key: 'returnDate', width: 16 },
      { header: 'Member ID', key: 'memberId', width: 14 },
      { header: 'Devotee Name', key: 'devoteeName', width: 24 },
      { header: 'Return Reason', key: 'returnReason', width: 25 },
      { header: 'Returned Books', key: 'returnedBooksText', width: 30 },
      { header: 'Previous Status', key: 'previousDevoteeStatus', width: 16 },
      { header: 'New Status', key: 'newDevoteeStatus', width: 14 },
      { header: 'Operator', key: 'operatorName', width: 16 },
    ];

    const records = await ReturnLog.find().sort({ returnDate: -1 });
    records.forEach((r) => {
      const obj = r.toObject();
      obj.returnedBooksText = Array.isArray(obj.returnedBooks) ? obj.returnedBooks.join(', ') : '';
      sheet.addRow(obj);
    });
  } else if (reportType === 'settlements') {
    const sheet = workbook.addWorksheet('Settlements Register');
    sheet.columns = [
      { header: 'Settlement No', key: 'settlementNo', width: 18 },
      { header: 'Date', key: 'settlementDate', width: 16 },
      { header: 'Member ID', key: 'memberId', width: 14 },
      { header: 'Devotee Name', key: 'devoteeName', width: 24 },
      { header: 'Settled Books Count', key: 'booksCount', width: 18 },
      { header: 'Total Calculated Pages', key: 'totalCalculatedPages', width: 22 },
      { header: 'Used Pages', key: 'usedPages', width: 14 },
      { header: 'Unused Pages', key: 'unusedPages', width: 14 },
      { header: 'Next-Year Interest', key: 'nextYearInterest', width: 18 },
      { header: 'Approved By', key: 'approvedByAdmin', width: 18 },
    ];

    const records = await SettlementLog.find().sort({ settlementDate: -1 });
    records.forEach((r) => {
      const obj = r.toObject();
      obj.booksCount = Array.isArray(obj.settledBooks) ? obj.settledBooks.length : 0;
      sheet.addRow(obj);
    });
  }

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=devoteedesk-${reportType}-report-${Date.now().toString().slice(-4)}.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();
}

module.exports = { generateExcelReport };

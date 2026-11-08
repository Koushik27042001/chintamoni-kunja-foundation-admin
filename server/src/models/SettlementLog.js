const mongoose = require('mongoose');

const settlementLogSchema = new mongoose.Schema(
  {
    settlementNo: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    memberId: {
      type: String,
      required: true,
      index: true,
    },
    devoteeName: {
      type: String,
      required: true,
    },
    settledBooks: [
      {
        bookNumber: { type: String, required: true },
        batchName: { type: String, required: true },
        startBillNumber: { type: Number, required: true },
        endBillNumber: { type: Number, required: true },
        totalPages: { type: Number, required: true },
      },
    ],
    totalCalculatedPages: {
      type: Number,
      required: true,
    },
    usedPages: {
      type: Number,
      required: true,
      min: 0,
    },
    unusedPages: {
      type: Number,
      required: true,
      min: 0,
    },
    nextYearInterest: {
      type: String,
      enum: ['Yes', 'No', 'Undecided', 'High Probability'],
      required: true,
      index: true,
    },
    settlementDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    approvedByAdmin: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SettlementLog', settlementLogSchema);

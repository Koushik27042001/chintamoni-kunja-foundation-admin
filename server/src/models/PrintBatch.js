const mongoose = require('mongoose');

const printBatchSchema = new mongoose.Schema(
  {
    batchName: {
      type: String,
      required: [true, 'Please provide batch name'],
      unique: true,
      trim: true,
      index: true,
    },
    batchPrefix: {
      type: String,
      required: [true, 'Please provide batch prefix'],
      uppercase: true,
      trim: true,
    },
    printDate: {
      type: Date,
      default: Date.now,
    },
    totalPages: {
      type: Number,
      required: [true, 'Total pages required'],
    },
    pagesPerBook: {
      type: Number,
      required: true,
      default: 100,
    },
    startBookNumber: {
      type: Number,
      required: [true, 'Start book number required'],
    },
    endBookNumber: {
      type: Number,
      required: [true, 'End book number required'],
    },
    totalBooks: {
      type: Number,
      required: true,
    },
    startBillNumber: {
      type: Number,
      required: true,
    },
    endBillNumber: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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

module.exports = mongoose.model('PrintBatch', printBatchSchema);

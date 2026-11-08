const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    bookNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PrintBatch',
      required: true,
      index: true,
    },
    batchName: {
      type: String,
      required: true,
      index: true,
    },
    startBillNumber: {
      type: Number,
      required: true,
    },
    endBillNumber: {
      type: Number,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
    },
    currentDevoteeId: {
      type: String,
      default: null,
      index: true,
    },
    currentDevoteeName: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Available', 'Allocated', 'Settled'],
      default: 'Available',
      index: true,
    },
    allocatedAt: {
      type: Date,
      default: null,
    },
    settledAt: {
      type: Date,
      default: null,
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

module.exports = mongoose.model('Book', bookSchema);

const mongoose = require('mongoose');

const dispatchLogSchema = new mongoose.Schema(
  {
    memberId: {
      type: String,
      required: true,
      index: true,
    },
    devoteeName: {
      type: String,
      required: true,
      trim: true,
    },
    itemDispatched: {
      type: String,
      required: true,
      default: 'Bill Books',
    },
    bookNumbers: [
      {
        type: String,
      },
    ],
    batchName: {
      type: String,
      default: '',
    },
    dispatchMode: {
      type: String,
      enum: ['Post', 'Courier', 'Hand'],
      required: true,
      index: true,
    },
    courierName: {
      type: String,
      default: '',
    },
    trackingIdOrReceiver: {
      type: String,
      required: true,
      trim: true,
    },
    dispatchDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    operatorName: {
      type: String,
      default: 'Admin',
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

module.exports = mongoose.model('DispatchLog', dispatchLogSchema);

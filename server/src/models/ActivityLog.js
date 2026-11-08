const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    actionType: {
      type: String,
      required: true,
      enum: [
        'BATCH_CREATED',
        'BOOKS_ISSUED',
        'BOOK_REPLACED',
        'DISPATCH_LOGGED',
        'RETURN_PROCESSED',
        'SETTLEMENT_COMPLETED',
        'DEVOTEE_REGISTERED',
        'DEVOTEE_UPDATED',
        'AI_ACTION_EXECUTED',
      ],
      index: true,
    },
    module: {
      type: String,
      required: true,
      enum: ['Devotee', 'Batch', 'Inventory', 'Dispatch', 'Return', 'Settlement', 'AI'],
      index: true,
    },
    performedBy: {
      type: String,
      required: true,
      default: 'Admin',
    },
    memberId: {
      type: String,
      default: null,
      index: true,
    },
    details: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);

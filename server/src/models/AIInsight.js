const mongoose = require('mongoose');

const aiInsightSchema = new mongoose.Schema(
  {
    insightKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['Inventory', 'Devotee', 'Settlement', 'Inconsistency', 'Dispatch'],
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ['Critical', 'Warning', 'Notice'],
      default: 'Warning',
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    affectedCount: {
      type: Number,
      default: 0,
    },
    affectedRecords: [
      {
        type: mongoose.Schema.Types.Mixed,
      },
    ],
    recommendedAction: {
      type: String,
      required: true,
    },
    actionType: {
      type: String,
      default: null,
    },
    isDismissed: {
      type: Boolean,
      default: false,
    },
    lastGeneratedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AIInsight', aiInsightSchema);

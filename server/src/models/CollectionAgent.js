const mongoose = require('mongoose');

const collectionAgentSchema = new mongoose.Schema(
  {
    agentCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Please add agent name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please add phone number'],
      trim: true,
    },
    assignedArea: {
      type: String,
      default: 'Nabadwip & Nadia District',
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    totalCollected: {
      type: Number,
      default: 0,
    },
    pendingSettlement: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CollectionAgent', collectionAgentSchema);


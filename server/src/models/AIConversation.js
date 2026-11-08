const mongoose = require('mongoose');

const aiConversationSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Operations Session',
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant', 'system', 'tool'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        structuredData: {
          type: mongoose.Schema.Types.Mixed,
          default: null,
        },
        toolCalls: {
          type: mongoose.Schema.Types.Mixed,
          default: null,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AIConversation', aiConversationSchema);

const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add blog title'],
      trim: true,
    },
    bengali: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      enum: ['Katha & Philosophy', 'History & Lineage', 'Festivals & Utsavs', 'Seva & Humanitarian'],
      default: 'Katha & Philosophy',
    },
    excerpt: {
      type: String,
      required: [true, 'Please add short excerpt'],
    },
    content: {
      type: String,
      required: [true, 'Please add full article content'],
    },
    author: {
      type: String,
      default: 'Sri Sri Chintamoni Kunja Foundation',
    },
    readTime: {
      type: String,
      default: '5 min read',
    },
    image: {
      type: String,
      default: '/assets/Opulent Gaura-Nitai and Madan Mohan Altar.png',
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Blog', blogSchema);

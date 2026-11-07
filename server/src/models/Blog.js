const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add blog title'],
      trim: true,
      index: true,
    },
    bengali: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: 'Katha & Philosophy',
      trim: true,
      index: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Please add short excerpt'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Please add full article content'],
    },
    author: {
      type: String,
      default: 'Sri Sri Chintamoni Kunja Foundation',
      trim: true,
    },
    readTime: {
      type: String,
      default: '5 min read',
    },
    image: {
      type: String,
      default: '/assets/Opulent Gaura-Nitai and Madan Mohan Altar.png',
    },
    public_id: {
      type: String,
      default: '',
    },
    storageProvider: {
      type: String,
      enum: ['cloudinary', 'local_asset', 'database'],
      default: 'local_asset',
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published',
      index: true,
    },
    // SEO & Meta Tag Fields
    slug: {
      type: String,
      trim: true,
      index: true,
      default: '',
    },
    metaTitle: {
      type: String,
      trim: true,
      default: '',
    },
    metaDescription: {
      type: String,
      trim: true,
      default: '',
    },
    metaKeywords: {
      type: [String],
      default: [],
    },
    canonicalUrl: {
      type: String,
      trim: true,
      default: '',
    },
    ogImage: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Blog', blogSchema);


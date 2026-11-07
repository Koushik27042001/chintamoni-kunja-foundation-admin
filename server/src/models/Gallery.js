const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add image title'],
      trim: true,
    },
    category: {
      type: String,
      default: 'Temple & Altar',
      trim: true,
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
    },
    image: {
      type: String,
      required: [true, 'Please provide image path or URL'],
    },
    public_id: {
      type: String,
      default: '',
    },
    storageProvider: {
      type: String,
      default: 'database',
    },
    caption: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Gallery', gallerySchema);


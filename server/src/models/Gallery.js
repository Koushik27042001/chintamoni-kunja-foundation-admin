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
      enum: ['Temple & Altar', 'Festivals & Utsavs', 'Anna Daan Seva', 'River Ghats & Dham', 'Devotees & Kirtan'],
      default: 'Temple & Altar',
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


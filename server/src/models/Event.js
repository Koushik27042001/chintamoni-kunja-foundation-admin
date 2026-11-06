const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add event title'],
      trim: true,
    },
    bengali: {
      type: String,
      default: '',
      trim: true,
    },
    season: {
      type: String,
      default: '',
      trim: true,
    },
    time: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      enum: ['Major Utsav', 'Pariwar Seva', 'Monthly Celebration', 'Special Seva'],
      default: 'Major Utsav',
    },
    desc: {
      type: String,
      required: [true, 'Please add description'],
    },
    seva: {
      type: String,
      default: 'Anna Daan & Puja Seva',
    },
    image: {
      type: String,
      default: '/assets/Krishna’s Golden Riverside Devotion.png',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    date: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Event', eventSchema);


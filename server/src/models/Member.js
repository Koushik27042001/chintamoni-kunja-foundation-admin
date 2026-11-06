const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please add member name'],
      trim: true,
    },
    address1: {
      type: String,
      default: '',
      trim: true,
    },
    address2: {
      type: String,
      default: '',
      trim: true,
    },
    city: {
      type: String,
      default: 'Nabadwip',
      trim: true,
    },
    postOffice: {
      type: String,
      default: 'Nabadwip',
      trim: true,
    },
    district: {
      type: String,
      default: 'Nadia',
      trim: true,
    },
    state: {
      type: String,
      default: 'West Bengal',
      trim: true,
    },
    pincode: {
      type: String,
      default: '741302',
      trim: true,
    },
    country: {
      type: String,
      default: 'India',
      trim: true,
    },
    mobile1: {
      type: String,
      required: [true, 'Please add primary contact number'],
      trim: true,
    },
    mobile2: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      enum: ['Life Member', 'General Member', 'Patron', 'Trustee', 'Volunteer'],
      default: 'Life Member',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Pending'],
      default: 'Active',
    },
    totalDonations: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Member', memberSchema);

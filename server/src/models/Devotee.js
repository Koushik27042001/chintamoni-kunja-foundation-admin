const mongoose = require('mongoose');

const devoteeSchema = new mongoose.Schema(
  {
    memberId: {
      type: String,
      required: [true, 'Please provide Member ID'],
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide devotee name'],
      trim: true,
      index: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male',
    },
    mobile1: {
      type: String,
      required: [true, 'Please provide primary mobile number'],
      trim: true,
      index: true,
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
    address1: {
      type: String,
      default: '',
    },
    address2: {
      type: String,
      default: '',
    },
    cityVillage: {
      type: String,
      default: '',
      index: true,
    },
    postOffice: {
      type: String,
      default: '',
    },
    district: {
      type: String,
      default: '',
      index: true,
    },
    state: {
      type: String,
      default: 'West Bengal',
      index: true,
    },
    pinCode: {
      type: String,
      default: '',
      index: true,
    },
    country: {
      type: String,
      default: 'India',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Deceased'],
      default: 'Active',
      index: true,
    },
    nextYearInterest: {
      type: String,
      enum: ['Yes', 'No', 'Undecided', 'High Probability'],
      default: 'Undecided',
      index: true,
    },
    entryDate: {
      type: Date,
      default: Date.now,
    },
    allocatedBooksCount: {
      type: Number,
      default: 0,
    },
    settledBooksCount: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Full-text search index across name, memberId, mobile1, cityVillage
devoteeSchema.index({
  memberId: 'text',
  name: 'text',
  mobile1: 'text',
  cityVillage: 'text',
  district: 'text',
});

module.exports = mongoose.model('Devotee', devoteeSchema);

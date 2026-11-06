const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide a valid email address'],
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  address: {
    type: String,
    trim: true,
    default: '',
  },
  purpose: {
    type: String,
    enum: [
      'Pilgrimage & Darshan Guidance',
      'Daily Anna Daan Seva Sponsorship',
      'Diksha & Lineage Inquiries',
      'Festival Volunteer Participation',
      'General Inquiry',
    ],
    default: 'General Inquiry',
  },
  message: {
    type: String,
    required: [true, 'Please enter your message or prayer request'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Contact', contactSchema);


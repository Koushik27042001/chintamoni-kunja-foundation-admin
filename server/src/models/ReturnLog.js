const mongoose = require('mongoose');

const returnLogSchema = new mongoose.Schema(
  {
    memberId: {
      type: String,
      required: true,
      index: true,
    },
    devoteeName: {
      type: String,
      required: true,
    },
    returnedBooks: [
      {
        type: String,
        required: true,
      },
    ],
    returnReason: {
      type: String,
      enum: [
        'Address Not Found',
        'Mobile Off / Unable to reach',
        'Refused to Accept',
        'Devotee Deceased',
        'Other Reason',
      ],
      required: true,
      index: true,
    },
    previousDevoteeStatus: {
      type: String,
      default: 'Active',
    },
    newDevoteeStatus: {
      type: String,
      required: true,
      enum: ['Inactive', 'Deceased'],
    },
    returnDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    operatorName: {
      type: String,
      default: 'Admin',
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

module.exports = mongoose.model('ReturnLog', returnLogSchema);

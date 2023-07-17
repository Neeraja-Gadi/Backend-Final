
const mongoose = require('mongoose');
const { Schema } = mongoose;

const logSchema = new Schema(
  {
    userDetailsID: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    isviewed: {
      type: Boolean,
      required: true,
      default: false,
    },
    isInterested: {
      type: Boolean,
      required: true,
      default: false,
    },
    isInterviewScheduled: {
      type: Boolean,
      required: true,
      default: false,
    },
    process: {
      type: String,
      required: true,
      enum: ['REJECTED', 'SELECTED', 'ONBOARDED'],
    },
  },
  { timestamps: true }
);

const Log = mongoose.model('Log', logSchema);

module.exports = Log;


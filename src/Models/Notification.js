const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:  "user",
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  isAccepted: {
    type: Boolean,
    default: false,
  },
  interviewDate: {
    type: Date,
  },
  isOnboarded: {
    type: Boolean,
    default: false,
  },
  isRejected: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);


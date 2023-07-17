const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

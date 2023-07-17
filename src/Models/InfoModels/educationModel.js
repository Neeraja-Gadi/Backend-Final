
const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const educationSchema = new mongoose.Schema(
  {
    userDetailsID: {
      type: ObjectId,
      ref: "user",
    },
    degreeName: {//changes
      type: String,
      required: true,
    },
    collegeName: {
      type: String,
      required: true,
    },
    educationLevel: {
      type: String,
      required: true,
      trim: true,
    },
    authority: {
      type: String,
      required: true,
      trim: true,
    },
    discipline: {
      type: String,
      required: true,
    },
    yearOfpassout: {
      type: Date,
      required: true
    },
    startYear: {//changes
      type: Date,
      required: true,
    },
    endYear: {//changes
      type: Date,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Education", educationSchema);

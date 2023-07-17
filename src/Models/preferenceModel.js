const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const preferenceSchema = new mongoose.Schema(
  {
    userDetailsID: {
      type: ObjectId,
      ref: "user",
    },
    highestEducation: {
      type: String,
      required: true
    },
    jobRole: {
      type: [String],
      required: true,
      trim: true
    },
    city: {
      type: [String],
      trim: true,
    },
    jobNature: {
      type: [String],
      required: true,
      enum:["Remote", "Onsite", "Hybrid", "Internship", "Full-Time", "Part-time", "WFH"],
      default: "Full-Time",
    },
    sector: { 
      type: String,
    },
    experienceOverall: {
        type: String,
        required: true
    },
    skills: {
      type: [String],
      trim: true
    },
    salary: {
        type: String

    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("TalentPreference", preferenceSchema);

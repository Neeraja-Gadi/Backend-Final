
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const revenueSchema = new mongoose.Schema(
  {
    userDetailsID: {
      type: ObjectId,
      ref: "Recruiters"
    },
    recruiterPlan: {
      type: String,
      required: true,
      enum: ["Gold", "Silver", "Platinum"]
    },
    jobPostno: {
      type: Number,
      required: true
    },
    duration: {
      type: Number
    },
    start: {
      type: Date,
      default: Date.now()
    },
    skillsAnalytics: {
      type : Boolean,
      default: true,
    },
    workEvidence: {
      type : Boolean,
      default: false,
    },
    verifiedProfiles: {
      type : Boolean,
      default: false,
    },
    directEngagement: {
      type : Boolean,
      default: true,
    },
    scheduleInterview: {
      type : Boolean,
      default: true,
    },
    conductAssessment: {
      type : Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    status:{
      type : Boolean,
      default:true
    },
    renewable:{
      type : Boolean,
      default: false
    },
    renewableCount: {
      type : Number,
    planName:{
      type : String,
    }
  },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RevenueR', revenueSchema);

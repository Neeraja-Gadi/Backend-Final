
const mongoose = require("mongoose");
const { Schema } = mongoose;

const experienceSchema = new Schema(
  {
    userDetailsID: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    experienceType: {
      type: String,
      required: true
    },
    jobStatus: {
      type: String,
      default: 'Active'
    },
    jobRole: {
      type: String,
      required: true
    },
    companyType: {
      type: String,
      enum: ["MNC", "Start-Ups", "Government", "Service-Based", "Product-Based"]
    },
    location: {
      type: String,
      required: true
    },
    skills: {
      type: [String],
      required: true
    },
    companyName: {
      type: String,
      required: true
    },
    responsivePoC: {
      type: [{
        name: {
          type: String,
          required: true
        },
        position: {
          type: String,
          required: true
        },
        email: {
          type: String,
          required: true
        },
        contactPhone: {
          type: String,
          default: null
        },
        link: {
          type: String,
          required: true
        }
      }],
      required: true
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true
      
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Experience", experienceSchema);

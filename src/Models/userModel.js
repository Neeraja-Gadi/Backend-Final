const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    recruiter: {
      type: Boolean,
      required: true,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },
    resetToken: {
      type: String,
    },
    resetExpriry: {
      type: String
    },
    isDeleted:{
      type: Boolean,
      Default: false
    }},
  
  { timestamps: true }
);


module.exports = mongoose.model("user", userSchema);


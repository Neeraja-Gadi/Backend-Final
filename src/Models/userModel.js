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

// userSchema.pre('save', async function (next) {
//   try {
//     if (!this.isModified('password')) {
//       return next();
//     }
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// userSchema.methods.comparePassword = async function (password) {
//   try {
//     return await bcrypt.compare(password, this.password);
//   } catch (error) {
//     throw new Error(error);
//   }
// };

// userSchema.methods.generatePasswordReset = function () {
//   this.resetToken = crypto.randomBytes(20).toString('hex');
//   this.resetExpriry = Date.now() + 3600000; // Reset token expires in 1 hour
// };
module.exports = mongoose.model("user", userSchema);


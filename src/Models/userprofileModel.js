

const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const userprofileSchema = new mongoose.Schema(
  {
    userDetailsID: {
      type: ObjectId,
      ref: "user"
    },
    profileLink: {
      key: { type: String },
      url: { type: String }
    },
    aboutMe: {
      type: String,
      required: true
    },
    gender: {
      type: String,
      required: true,
      enum: ["M", "F", "Not Prefer to Say"]
    },
    doB: {
      type: Date,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    location: {//address 
      type: String,
      required: true

    },
    state:{
      type: String,

    },
    gitLink: {//worklink
      type: String
    },
    document: {
      key: { type: String },
      url: { type: String }
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);
userprofileSchema.statics.findByKeyAndId = async function (key, id) {
  return this.findOne({ _id: id, "profileLink.key": key });
};
module.exports = mongoose.model("userProfile", userprofileSchema);

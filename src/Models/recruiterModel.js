const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const recruiterProfileSchema = new Schema({
  userDetailsID:{
    type: ObjectId,
    ref: "user"
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  professionalSummary: {
    type: String
  },
  isDeleted:{
    type: Boolean,
    Default: false
  },
  workExperience: [
    {
      company: {
        type: String,
        
      },
      jobTitle: {
        type: String,
        
      },
    }
  ],
  awards: [
      {type :  String}
  ],
  socialMediaLinks: {
        linkedin : { type: String} ,
        twitter : { type: String},   
    }
  },
  { timestamps: true },
);

const RecruiterProfile = mongoose.model('Recruiters', recruiterProfileSchema);

module.exports = RecruiterProfile;

const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const projectsSchema = new mongoose.Schema(
    {
        userDetailsID: {
            type: ObjectId,
            ref: "user"
        },
        skills:{
            type: [String],
            required: true
        },
        projectType:  {
          type: String,
          required: true
        },
        projectTitle: {
            type: String,
            required: true
        },
        startDate: {
            type: String,
            required: true,
          },
        endDate: {
            type: String,
            required: true
          },
        organizationName: {
            type: String,
      
        },
        description:{
            type: String,
        },
        url:{
            type:String,
        },
        isDeleted:{
            type: Boolean,
            default: false
          },
    },
    {
        timestamps: true
    }
)
module.exports = mongoose.model("Projects", projectsSchema);

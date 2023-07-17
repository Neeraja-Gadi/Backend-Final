const mongoose = require ("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const skillsSchema = new mongoose.Schema(
    {
        userDetailsID: {
            type: ObjectId,
            ref: "user"
        
        },
        primarySkills:
        {
            type: [String],
            required: true
        },
        secondarySkills:
        {
            type: [String],
            required: true
        },
        isDeleted:{
            type: Boolean,
            Default: false
          }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Skills", skillsSchema);


const mongoose = require ("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const TalentAplicationsSchema = new mongoose.Schema(
    {
        userDetailsID: {
            type: ObjectId,
            ref: "user",
            required: true
        },

        AppliedJobsId:
        {
            type: [ObjectId],
            ref: "Job"
        },

        Applied:
        {
            type: Boolean,
            Default: false
        },
        
    },

    { timestamps: true }
);

module.exports = mongoose.model("TalentappliedJobs", TalentAplicationsSchema);


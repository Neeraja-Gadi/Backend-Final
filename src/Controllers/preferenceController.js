const talentModel = require("../Models/preferenceModel");
const jobModel = require("../Models/jobModel");
const Joi = require("joi");


const createPreference = async (req, res) => {
  try {
    const schema = Joi.object({
      userDetailsID: Joi.string(),
      highestEducation: Joi.string().required(),
      jobRole: Joi.array().items(Joi.string()).required(),
      city: Joi.array().items(Joi.string()),
      sector: Joi.string(),
      experienceOverall: Joi.string().required(),
      skills: Joi.array().items(Joi.string()),
      salary: Joi.string(),
      jobNature: Joi.array().items(Joi.string().default("Full-Time")),
      isDeleted: Joi.boolean().default(false)
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .send({ status: false, message: error.message });
    }
    const preference = await talentModel.create(value);
    return res
        .status(200)
        .send({ status: true, data: preference, message: 'Preference data created' });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};
// ***********************************************************************************************************************
const updatePreference = async (req, res) => {
  try {
    const schema = Joi.object({
      userDetailsID: Joi.string(),
      highestEducation: Joi.string(),
      jobRole: Joi.array().items(Joi.string()),
      city: Joi.array().items(Joi.string()),
      sector: Joi.string(),
      experienceOverall: Joi.string(),
      skills: Joi.array().items(Joi.string()),
      salary: Joi.string(),
      isDeleted: Joi.boolean().default(false),
      jobNature: Joi.array().items(Joi.string().default("Full-Time")),
    }).min(1);
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .send({ status: false, message: error.message });
    }
    const preference = await talentModel.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true }
    );
    if (!preference) {
      return res.status(404).send({ status: false, message: 'Preference data not found' });
    }
    return res
      .status(200)
      .send({ status: true, data: preference, message: 'Preference data updated' });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

// ***********************************************************************************************************************

const fetchPreference = async (req, res) => {
  try {
    const preference = await talentModel.findById(req.params.id);
    if (!preference) {
      return res.status(404).send({ status: false, message: 'Talent preference not found' });
    }
    return res.status(200).json({ status: true, data: preference, message: 'Preference data found' });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// ***********************************************************************************************************************

const deletePreference = async (req, res) => {
  try {
    const preference = await talentModel.findByIdAndDelete(req.params.id);
    if (!preference) {
      return res.status(404).send({ status: false, message: 'Talent preference not found'});
    }

    return res.status(200).json({ status: true, message: 'Talent preference deleted' });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// ******************************************************************************************************************

const searchJobsByPreferences = async (req, res) => {
  const userDetailsID = req.params.userDetailsID;

  try {
    // Find the user's preferences based on userDetailsID
    const userPreferences = await talentModel.findOne({
      userDetailsID: userDetailsID,
    });

    if (!userPreferences) {
      return res.status(404).send({ status: false, message: 'Preference data not found' });
    }

    // Extract preferences data
    const {
      highestEducation,
      jobNature,
      jobRole,
      city,
      sector,
      location,
      skills,
      experienceOverall,
    } = userPreferences;

    const matchingJobs = await jobModel.find({
      $or: [
        { highestEducation: { $in: highestEducation } },
        { jobNature: { $in: jobNature } },
        { jobRole: { $in: jobRole } },
        { location: { $in: city } },
        { sector : {$in: sector } },
        { location : {$in: location } },
        { primarySkills : {$in: skills} },
        { experience : {$in: experienceOverall} }
      ],
    });

    return res.status(200).send({status:true, data: matchingJobs , message: "Success"});
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {
  createPreference,
  updatePreference,
  fetchPreference,
  deletePreference,
  searchJobsByPreferences
};

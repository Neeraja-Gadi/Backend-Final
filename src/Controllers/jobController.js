const jobModel = require("../Models/jobModel");
const projectsModel = require("../Models/InfoModels/projectsModel");
const recruiterModel = require("../Models/recruiterModel");
const Joi = require('joi');
const revenueModel = require("../Models/revenueRModel");
// ****************Month validity data***********************************************************************
const strictJobPost = async (req, res) => {
  try {
    const userDetailsID = req.params.userDetailsID;

    // Find the subscription plan for the recruiter
    const subscriptionPlans = await revenueModel.findOne({
      _id: req.params.id,
      userDetailsID,
      isDeleted: false
    });
    if (!subscriptionPlans) {
      return res.status(404).json({ status: false, message: 'Plans not found' });
    }
    // Find the number of job posts made by the recruiter
    const jobPostsCount = await jobModel.countDocuments({
      userDetailsID,
      recruiterPlan: subscriptionPlans._id
    });
    // Check if the job posts count exceeds the plan's jobPostno limit
    if (jobPostsCount >= subscriptionPlans.jobPostno) {
      return res.status(403).json({ status: false, message: 'Job posting limit exceeded' });
    }
    // Allow the job posting since the limit is not exceeded
 
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};
const jobInfo = async (req, res) => {
  try {
    const userDetailsID = req.params.userDetailsID;
    const recruiter = await recruiterModel.find({userDetailsID});
    if (!recruiter) {
      return res.status(400).send({ status: false, message: 'You are not authorized.' });
    }
    const { jobRole, jobCategory, experience, primarySkills, secondarySkills, jobDescription, location, company, highestEducation, salary, sector, isDeleted, recruiterPlan, gender } = req.body;
    const jobSchema = Joi.object({
      userDetailsID :Joi.string().required() ,
      recruiterPlan :Joi.string().required() , 
      jobRole: Joi.array().items(Joi.string().required()).required(),
      jobCategory : Joi.string().required(),
      experience: Joi.array().items(Joi.string().required()).required(),
      primarySkills: Joi.array().items(Joi.string().required()).required(),
      secondarySkills: Joi.array().items(Joi.string().required()).required(),
      recruiterPlan: Joi.string().required(),
      jobDescription: Joi.string().allow(null, ''),
      gender: Joi.string(),
      salary: Joi.string().required(),
      location: Joi.string().required(),
      company: Joi.string().allow(null, ''),
      sector: Joi.string().allow(null, ''),
      isDeleted: Joi.boolean(),
      highestEducation: Joi.array().items(Joi.string().required()).required()
    })
    const validationResult = jobSchema.validate(req.body, { abortEarly: false });
    if (validationResult.error) {
      return res.status(400).send({ status: false, message: validationResult.error.details.map(d => d.message) });
    }
    // Calculate the expiration date (one month from the current date)
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 1);

    const data = await jobModel.create({
      userDetailsID,
      recruiterPlan,
      jobCategory,
      jobRole,
      experience,
      primarySkills,
      secondarySkills,
      jobDescription,
      location,
      gender,
      company,
      highestEducation,
      salary,
      sector,
      isDeleted,
      expirationDate
    });

    if (data) {
      return res.status(201).send({ status: true, data: data, message: 'Job-Post data created' });
    }
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};
const deleteJob = async function (req, res) {
  try {
    const id = req.params.id;
    const jobData = await projectsModel.findByIdAndUpdate(id, { $set: { isDeleted: true } });
    if (!jobData) {
      return res.status(404).send({ status: false, message: 'jobData data not found' });
    }
    res.status(200).json({ status: true, message: 'Job information deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
const updateJobData = async function (req, res) {
  try {
    const jobSchema = Joi.object({
      userDetailsID: Joi.string(),
      recruiterPlan: Joi.string().required(),
      jobCategory: Joi.string().required(),
      jobRole: Joi.array().items(Joi.string()).required(),
      experience: Joi.array().items(Joi.string()).required(),
      primarySkills: Joi.array().items(Joi.string()).required(),
      secondarySkills: Joi.array().items(Joi.string()).required(),
      sector: Joi.string().required(),
      jobDescription: Joi.string().allow(null, ""),
      salary: Joi.string().required(),
      highestEducation: Joi.array().items(Joi.string()).required(),
      company: Joi.string().allow(null, ""),
      location: Joi.string().required(),
      isDeleted: Joi.boolean(),
      isExpired: Joi.boolean(),
      isField: Joi.boolean(),
      gender: Joi.string().valid("M", "F", "Not Prefer to Say").required(),
    });
    const validationResult = jobSchema.validate(req.body, { abortEarly: false });
    if (validationResult.error) {
      return res
        .status(400)
        .send({ status: false, message: validationResult.error.details[0].message });
    }
    const id = req.params.id;
    let jobData = await jobModel.findById(id);
    if (!jobData) {
      return res.status(404).send({ status: false, message: "Job data not found" });
    }
    jobData.userDetailsID = req.body.userDetailsID;
    jobData.recruiterPlan = req.body.recruiterPlan;
    jobData.jobCategory = req.body.jobCategory;
    jobData.jobRole = req.body.jobRole;
    jobData.experience = req.body.experience;
    jobData.primarySkills = req.body.primarySkills;
    jobData.secondarySkills = req.body.secondarySkills;
    jobData.sector = req.body.sector;
    jobData.jobDescription = req.body.jobDescription;
    jobData.salary = req.body.salary;
    jobData.highestEducation = req.body.highestEducation;
    jobData.company = req.body.company;
    jobData.location = req.body.location;
    jobData.isDeleted = req.body.isDeleted;
    jobData.isExpired = req.body.isExpired;
    jobData.isField = req.body.isField;
    jobData.gender = req.body.gender;

    const updatedData = await jobData.save();
    return res
      .status(200)
      .send({ status: true, data: updatedData, message: "Job data updated" });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
// *****************************************************************************************************
const searchJobs = async (req, res) => {
  try {
    const {
      jobRole,
      experience,
      primarySkills,
      secondarySkills,
      jobDescription,
      highestEducation,
      company,
      location,
      discipline
    } = req.query;

    const query = {};

    if (jobRole) {
      const jobRoleArray = jobRole.split(",");
      query.jobRole = { $in: jobRoleArray.map(jobRole => new RegExp(jobRole.trim(), 'i')) };
    }
    if (experience) {
      const experienceArray = experience.split(",");
      query.experience = { $in: experienceArray.map(experience => new RegExp(experience.trim(), 'i')) };
    }
    if (primarySkills) {
      const skillsArray = primarySkills.split(",");
      query.primarySkills = { $in: skillsArray.map(skill => new RegExp(skill.trim(), 'i')) };
    }
    if (secondarySkills) {
      const skillsArray = secondarySkills.split(",");
      query.secondarySkills = { $in: skillsArray.map(skill => new RegExp(skill.trim(), 'i')) };
    }
    if (jobDescription) {
      query.jobDescription = { $regex: jobDescription, $options: 'i' };
    }
    if (highestEducation) {
      query.highestEducation = { $regex: highestEducation, $options: 'i' };
    }
    if (company) {
      query.company = { $regex: company, $options: 'i' };
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (discipline) {
      query.discipline = { $regex: discipline, $options: 'i' };
    }

    const jobs = await jobModel.find({ $or: [query] })
    res.json({
      status: true,
      data: jobs
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
};
//******************count recruiter with jobpost and show details of jobpost with a recruiter information */
const jobpostbyRecruiter = async function (req, res) {
  try {
    const id = req.params.id;
    const jobData = await jobModel.find({ userDetailsID: id }).select('-_id -updatedAt -createdAt -__v -isDeleted -userDetailsID -recruiterPlan');
    if (!jobData) {
      return res.status(404).send({ status: false, message: 'jobData not found' });
    }

    const jobCount = await jobModel.countDocuments({ userDetailsID: id });

    const jobDataWithCount = jobData.map(job => ({ ...job._doc }));

    res.status(200).json({ status: true, count: jobCount, data: jobDataWithCount });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
}
module.exports = { jobpostbyRecruiter,strictJobPost, jobInfo, searchJobs, updateJobData, deleteJob };



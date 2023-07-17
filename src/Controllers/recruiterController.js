const recruiterModel = require("../Models/recruiterModel");
const { AuthorityPoints, EducationLevelPoints, ExperienceLevelPoints, ProjectTypePoints, ExperienceTypePoints } = require("../Constrains/authority.js");
const userModel = require("../Models/userModel");
const Joi = require('joi');
const mongoose = require('mongoose');
const jobModel = require("../Models/jobModel");
const educationModel = require("../Models/InfoModels/educationModel");
const experienceModel = require("../Models/InfoModels/experienceModel");
const userprofileModel = require("../Models/userprofileModel");
const skillsModel = require("../Models/InfoModels/skillsModel");
const projectsModel = require("../Models/InfoModels/projectsModel");
const preferenceModel = require("../Models/preferenceModel");
const revenueRModel = require('../Models/revenueRModel');


// Import the RecruiterPlan model
//********recruiterInfo*******************recruiterInfo********************recruiterInfo**********************/
const recruiterInfo = async function (req, res) {
  try {
    const recruiterSchema = Joi.object({
      userDetailsID: Joi.string().required(),
      fullName: Joi.string().required(),
      email: Joi.string().required(),
      phoneNumber: Joi.string().required(),
      professionalSummary: Joi.string(),
      workExperience: Joi.array().items(
        Joi.object({
          company: Joi.string().required(),
          jobTitle: Joi.string().required()
        })
      ),
      awards: Joi.array().items(Joi.string()),
      socialMediaLinks: Joi.object({
        linkedin: Joi.string().required(),
        twitter: Joi.string()
      }),
      __v: Joi.number().allow(null),
      isDeleted: Joi.boolean().default(false)
    });

    const validationResult = recruiterSchema.validate(req.body, { abortEarly: false });
    if (validationResult.error) {
      return res.status(400).send({ status: false, message: validationResult.error.details[0].message });
    }

    // Create new recruiter data
    const data = await recruiterModel.create(req.body);
    if (data) {
      return res.status(200).send({ status: true, data: data, message: 'Recruiter data created' });
    }
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};
const recruiterInformation = async function (req, res) {
  try {
    const id = req.params.id;
    const recruiterData = await recruiterModel.find({ _id: id });
    if (!recruiterData) {
      return res.status(404).send({ status: false, message: 'recruiterData data not found' });
    }
    res.status(200).send({ status: true, data: recruiterData });
  }
  catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

const deleteRecruiter = async function (req, res) {
  try {
    const id = req.params.id;
    const recruiterData = await recruiterModel.findByIdAndUpdate(id, { $set: { isDeleted: true } });
    if (!recruiterData) {
      return res.status(404).send({ status: false, message: 'recruiterData data not found' });
    }

    res.status(200).json({ status: true, message: 'Recruiter information deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

const updateRecruiterData = async function (req, res) {
  try {
    const recruiterSchema = Joi.object({
      fullName: Joi.string(),
      email: Joi.string(),
      phoneNumber: Joi.string(),
      professionalSummary: Joi.string(),
      workExperience: Joi.array().items(
        Joi.object({
          company: Joi.string().required(),
          jobTitle: Joi.string().required()
        })
      ),
      awards: Joi.array().items(Joi.string()),
      socialMediaLinks: Joi.object({
        linkedin: Joi.string(),
        twitter: Joi.string()
      })
    });

    const validationResult = recruiterSchema.validate(req.body, { abortEarly: false });
    if (validationResult.error) {
      return res.status(400).send({ status: false, message: validationResult.error.details[0].message });
    }

    const id = req.params.id;
    let recruiterData = await recruiterModel.findById({ _id: id });
    if (!recruiterData) {
      return res.status(404).send({ status: false, message: 'Recruiter data not found' });
    }

    recruiterData.fullName = req.body.fullName || recruiterData.fullName;
    recruiterData.email = req.body.email || recruiterData.email;
    recruiterData.phoneNumber = req.body.phoneNumber || recruiterData.phoneNumber;
    recruiterData.professionalSummary = req.body.professionalSummary || recruiterData.professionalSummary;
    recruiterData.workExperience = req.body.workExperience || recruiterData.workExperience;
    recruiterData.awards = req.body.awards || recruiterData.awards;
    recruiterData.socialMediaLinks = req.body.socialMediaLinks || recruiterData.socialMediaLinks;

    const updatedData = await recruiterModel.findByIdAndUpdate({ _id: id }, recruiterData, { new: true });
    return res.status(200).send({ status: true, data: updatedData, message: 'Recruiter data updated' });


  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
//***********getRecruiterPlan*******************getRecruiterPlan********************getRecruiterPlan***********/

const getRecruiterPlan = async (req, res) => {
  try {
    const userDetailsID = req.params.userDetailsID;
    const recruiterInfo = await recruiterModel.findOne({ userDetailsID });

    // If the recruiter is not found, handle the case
    if (!recruiterInfo) {
      return res.status(404).send({ status: false, message: 'Recruiter not found' });
    }

    // Find the recruiter's subscription plans
    const subscriptionPlans = await revenueRModel.find({ userDetailsID });
    if (!subscriptionPlans) {
      return res.status(404).send({ status: false, message: 'subscriptionPlans not found' });
    }

    // Calculate the remaining days and expiry date for each plan
    const currentDate = new Date();
    const formattedPlans = subscriptionPlans.map(plan => {
      const endDate = new Date(plan.start);
      endDate.setDate(endDate.getDate() + plan.duration);

      const remainingDays = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24));

      // Update the plan's status and renewable based on remaining days
      if (remainingDays < 0) {
        plan.status = false;
      }

      return {
        id:plan._id ,
        status: plan.status,
        start: plan.start,
        renewable: plan.renewable,
        recruiterPlan: plan.recruiterPlan,
        jobPostno: plan.jobPostno,
        duration: plan.duration,
        expiryDate: endDate.toISOString(),
        remainingDays
      };
    });

    // Categorize the plans into Gold, Silver, and Platinum
    const categorizedPlans = {
      Gold: formattedPlans.filter(plan => plan.recruiterPlan === 'Gold'),
      Silver: formattedPlans.filter(plan => plan.recruiterPlan === 'Silver'),
      Platinum: formattedPlans.filter(plan => plan.recruiterPlan === 'Platinum'),
    };

    // Format and send the response
    const response = {
      recruiterInfo,
      plans: formattedPlans,
      totalPlans: formattedPlans.length,
    };

    return res.status(200).send({ status: true, data: response, message: 'Recruiter information with their plans found' });
  } catch (err) {
    // Handle internal server error
    res.status(500).send({ status: false, message: err.message });
  }
};
// post api for plan***********************************************************************************************
const RevenuePlan = async function (req, res) {
  try {
    const { userDetailsID, recruiterPlan, jobPostno, start } = req.body;
    const planOptions = {
      Silver: {
        jobPostno: [
          { count: 1, duration: 15 },
          { count: 3, duration: 60 },
          { count: 10, duration: 180 },
        ],
        defaults: {
          skillsAnalytics: true,
          workEvidence: true,
          verifiedProfiles: false,
          directEngagement: true,
          scheduleInterview: true,
          conductAssessment: false,
        },
      },
      Gold: {
        jobPostno: [
          { count: 1, duration: 30 },
          { count: 3, duration: 90 },
          { count: 10, duration: 180 },
        ],
        defaults: {
          skillsAnalytics: true,
          workEvidence: false,
          verifiedProfiles: false,
          directEngagement: true,
          scheduleInterview: true,
          conductAssessment: false,
        },
      },
      Platinum: {
        jobPostno: [
          { count: 1, duration: 30 },
          { count: 3, duration: 90 },
          { count: 10, duration: 180 },
        ],
        defaults: {
          skillsAnalytics: true,
          workEvidence: true,
          verifiedProfiles: true,
          directEngagement: true,
          scheduleInterview: true,
          conductAssessment: true,
        },
      },
    };
    const revenueSchema = Joi.object({
      userDetailsID: Joi.string().required(),
      recruiterPlan: Joi.string().valid("Gold", "Silver", "Platinum").required(),
      jobPostno: Joi.number().required(),
      start: Joi.string(),
      isDeleted: Joi.boolean().default(false),
      skillsAnalytics: Joi.boolean(),
      workEvidence: Joi.boolean(),
      verifiedProfiles: Joi.boolean(),
      directEngagement: Joi.boolean(),
      scheduleInterview: Joi.boolean(),
      conductAssessment: Joi.boolean()
    });

    const validationResult = revenueSchema.validate(req.body, { abortEarly: false });
    if (validationResult.error) {
      const errorMessages = validationResult.error.details.map(detail => detail.message);
      return res.status(400).send({ status: false, message: errorMessages });
    }
    const selectedPlanOption = planOptions[recruiterPlan].jobPostno.find(option => option.count === jobPostno);
    if (!selectedPlanOption) {
      return res.status(400).send({ status: false, message: 'Invalid combination of recruiter plan and job post number' });
    }

    const { duration } = selectedPlanOption;
    const defaults = planOptions[recruiterPlan].defaults;

    // Create the subscription plan in the revenueModel
    const revenueData = { ...req.body, duration, ...defaults };
    const data = await revenueRModel.create(revenueData);

    return res.status(200).send({ status: true, data: data, message: 'Subscription plan created' });

  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};
// **************Plan With Job Post Information*********************limit***Integration*****************************
//working

// const PlanWithJobPostInformation = async (req, res) => {
//   try {
//     const {userDetailsID ,id} = req.params;

//     const subscriptionPlans = await revenueRModel.findOne({
//       _id:id,
//       userDetailsID,
//       isDeleted: false
//     });

//     if (!subscriptionPlans) {
//       return res.status(404).json({ status: false, message: 'Plans not found' });
//     }
//     const currentDate = new Date();
//     const expiryDate = new Date(subscriptionPlans.start);
//     expiryDate.setDate(expiryDate.getDate() + subscriptionPlans.duration);

//     const isSubscriptionActive = currentDate <= expiryDate;

//     const jobPosts = await jobModel.find({
//       userDetailsID,
//       recruiterPlan: subscriptionPlans
//     });
//     // Update the isExpired and isDeleted fields for each job post
//     for (const jobPost of jobPosts) {
//       const createdAt = new Date(jobPost.createdAt);
//       const expiry = new Date(createdAt);
//       expiry.setMonth(expiry.getMonth() + 1); // Set expiry to one month after createdAt

//       if (currentDate > expiry) {
//         jobPost.isExpired = true;
//         jobPost.isDeleted = true;
//       }
//     }
//     await Promise.all(jobPosts.map(jobPost => jobPost.save())); // Save the updated job posts

//     const jobCount = jobPosts.length;

//     const remainingDays = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
//     const status = remainingDays >= 0 && isSubscriptionActive;
//     const limit = false;

//     if (jobCount >= subscriptionPlans.jobPostno) {
//       limit = true;
//     }
//     const planDetails = {
//       userDetailsID: subscriptionPlans.userDetailsID,
//       isSubscriptionActive: isSubscriptionActive,
//       status: status,
//       limit,
//       jobPostno: subscriptionPlans.jobPostno,
//       start: subscriptionPlans.start,
//       duration: subscriptionPlans.duration,
//       createdAt: subscriptionPlans.createdAt,
//       updatedAt: subscriptionPlans.updatedAt,
//       expiryDate: expiryDate.toISOString(),
//       remainingDays: remainingDays,
//       jobCount: jobCount,
//       jobPosts: jobPosts.map((jobPost) => ({
//         _id: jobPost._id,
//         jobRole: jobPost.jobRole,
//         jobDescription: jobPost.jobDescription,
//         highestEducation: jobPost.highestEducation,
//         experience: jobPost.experience,
//         primarySkills: jobPost.primarySkills,
//         secondarySkills: jobPost.secondarySkills,
//         sector: jobPost.sector,
//         location: jobPost.location,
//         company: jobPost.company,
//         gender: jobPost.gender,
//         expiry: jobPost.isExpired,
//         deleted: jobPost.isDeleted,
//       })),
//     };
//     res.status(200).json({ status: true, data: [planDetails] });
//   } catch (err) {
//     res.status(500).json({ status: false, message: err.message });
//   }
// };

const PlanWithJobPostInformation = async (req, res) => {
  try {
    const userDetailsID = req.params.userDetailsID;

    const subscriptionPlans = await revenueRModel.findOne({
      _id: req.params.id,
      userDetailsID,
      isDeleted: false
    })

    if (!subscriptionPlans) {
      return res.status(404).json({ status: false, message: 'Plans not found' });
    }
    const currentDate = new Date();
    const expiryDate = new Date(subscriptionPlans.start);
    expiryDate.setDate(expiryDate.getDate() + subscriptionPlans.duration);

    const isSubscriptionActive = currentDate <= expiryDate;

    const jobPosts = await jobModel.find({
      userDetailsID
    });
    // Update the isExpired and isDeleted fields for each job post
    for (const jobPost of jobPosts) {
      const createdAt = new Date(jobPost.createdAt);
      const expiry = new Date(createdAt);
      expiry.setMonth(expiry.getMonth() + 1); // Set expiry to one month after createdAt

      if (currentDate > expiry) {
        jobPost.isExpired = true;
        jobPost.isDeleted = true;
      }
    }
    await Promise.all(jobPosts.map(jobPost => jobPost.save())); // Save the updated job posts

    const jobCount = jobPosts.length;

    const remainingDays = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
    const status = remainingDays >= 0 && isSubscriptionActive;
    let limit = false;

    if (jobCount >= subscriptionPlans.jobPostno) {
      limit = true;
    }
    const planDetails = {
      userDetailsID: subscriptionPlans.userDetailsID,
      isSubscriptionActive: isSubscriptionActive,
      status: status,
      limit,
      subscription: subscriptionPlans.recruiterPlan,
      jobPostno: subscriptionPlans.jobPostno,
      start: subscriptionPlans.start,
      duration: subscriptionPlans.duration,
      createdAt: subscriptionPlans.createdAt,
      updatedAt: subscriptionPlans.updatedAt,
      expiryDate: expiryDate.toISOString(),
      remainingDays: remainingDays,
      jobCount: jobCount,
      jobPosts: jobPosts.map((jobPost) => ({
        _id: jobPost._id,
        jobCategory: jobPost.jobCategory,
        jobRole: jobPost.jobRole,
        jobDescription: jobPost.jobDescription,
        highestEducation: jobPost.highestEducation,
        experience: jobPost.experience,
        primarySkills: jobPost.primarySkills,
        secondarySkills: jobPost.secondarySkills,
        sector: jobPost.sector,
        location: jobPost.location,
        company: jobPost.company,
        gender: jobPost.gender,
        expiry: jobPost.isExpired,
        deleted: jobPost.isDeleted,
      })),
    };
    return res.status(200).send({ status: true, data: [planDetails], message: 'Success' });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};
// *********************jobSearch************************jobSearch*************************jobSearch**************//

const searchJobseekerGeneral = async (req, res) => {
  try {
    const { experience, educationalLevel, discipline, primarySkills } = req.query;

    const query = {};

    if (experience) {
      const experienceArray = experience.split(",");
      query.experience = { $in: experienceArray.map(experience => new RegExp(experience.trim(), 'i')) };
    }

    if (educationalLevel) {
      query.educationLevel = { $regex: educationalLevel, $options: 'i' };
    }

    if (discipline) {
      query.discipline = { $regex: discipline, $options: 'i' };
    }

    if (primarySkills) {
      query.primarySkills = { $regex: primarySkills, $options: 'i' };
    }

    const skillDetails = await mongoose.model('Skills').find(query).populate('userDetailsID.skills');

    const educationDetails = await mongoose.model('Education').find(query).populate('userDetailsID.education');
    const experienceDetails = await mongoose.model('Experience').find(query).populate('UserDetailsID.experience');

    console.log('skillDetails:', skillDetails);
    console.log('educationDetails:', educationDetails);
    console.log('experienceDetails:', experienceDetails);

    const data = { skillDetails, educationDetails, experienceDetails };

    if (skillDetails.length === 0 && educationDetails.length === 0 && experienceDetails.length === 0) {
      return res.status(404).json({ status: false, message: 'Data not found' });
    }

    return res.status(200).send({ status: true, data: data, message: 'Success' });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: error.message });
  }
};
// **************recruiterSearch************recruiterSearch*******************recruiterSearch****************//
async function recruiterSearch(req, res) {
  try {
    const { primarySkills, secondarySkills, experience, educationLevel, location } = req.query;
    const schema = Joi.object({
      primarySkills: Joi.string().allow(''),
      secondarySkills: Joi.string().allow(''),
      experience: Joi.string().allow(''),
      educationLevel: Joi.string().allow(''),
      location: Joi.string().allow('')
    });
    const validation = schema.validate(req.query, { abortEarly: false });
    if (validation.error) {
      return res.status(400).send({ message: validation.error.details.map(d => d.message) });
    }
    const skillsQuery = {};
    if (primarySkills) {
      skillsQuery.primarySkills = { $in: primarySkills.split(",").map(s => new RegExp(`^${s.trim()}$`, 'i')) };
    }
    if (secondarySkills) {
      skillsQuery.secondarySkills = { $in: secondarySkills.split(",").map(s => new RegExp(`^${s.trim()}$`, 'i')) };
    }
    const educationQuery = {};
    if (educationLevel) {
      educationQuery.educationLevel = { $in: educationLevel.split(",").map(level => new RegExp(`^${level.trim()}$`, 'i')) };
    }
    const experienceArray = experience ? experience.split(",").map(s => s.trim()) : [];
    const userProfileQuery = {};
    if (location) {
      userProfileQuery.location = { $in: location.split(",").map(loc => new RegExp(`^${loc.trim()}$`, 'i')) };
    }
    const users = await userModel.find({ recruiter: false });
    const education = await educationModel.find(educationQuery, 'userDetailsID educationLevel collegeName authority discipline yearOfpassout');
    const experienceResults = await experienceModel.find({}, 'userDetailsID experience');
    const skills = await skillsModel.find(skillsQuery, 'userDetailsID primarySkills secondarySkills');
    const userProfiles = await userprofileModel.find(userProfileQuery, 'userDetailsID location');
    const result = users.map((user) => {
      const userExperience = experienceResults.find(ex => ex.userDetailsID && ex.userDetailsID.toString() === user._id.toString()) || {};
      const userEducation = education.find(e => e.userDetailsID && e.userDetailsID.toString() === user._id.toString()) || {};
      const userSkills = skills.find(s => s.userDetailsID && s.userDetailsID.toString() === user._id.toString()) || {};
      const userProfile = userProfiles.find(p => p.userDetailsID && p.userDetailsID.toString() === user._id.toString()) || {};
      let matchCount = 0;
      if (primarySkills && userSkills.primarySkills && userSkills.primarySkills.some(s => primarySkills.split(",").map(p => p.trim()).includes(s))) {
        matchCount++;
      }
      if (secondarySkills && userSkills.secondarySkills && userSkills.secondarySkills.some(s => secondarySkills.split(",").map(p => p.trim()).includes(s))) {
        matchCount++;
      }
      if (experienceArray.length > 0 && userExperience.experience && experienceArray.includes(userExperience.experience)) {
        matchCount++;

      }
      if (educationLevel && userEducation.educationLevel && educationLevel.split(",").map(level => new RegExp(`^${level.trim()}$`, 'i')).some(regex => regex.test(userEducation.educationLevel))) {
        matchCount++;
      }
      if (location && userProfile.location && location.split(",").map(loc => new RegExp(`^${loc.trim()}$`, 'i')).some(regex => regex.test(userProfile.location))) {
        matchCount++;
      }
      if (matchCount === 0) {
        return null;
      } else {
        return {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          educationLevel: userEducation.educationLevel || '',
          collegeName: userEducation.collegeName || '',
          authority: userEducation.authority || '',
          discipline: userEducation.discipline || '',
          yearOfpassout: userEducation.yearOfpassout || '',
          experience: userExperience.experience || {},
          primarySkills: userSkills.primarySkills || '',
          secondarySkills: userSkills.secondarySkills || '',
          location: userProfile.location || ''
        };
      }
    }).filter(result => result !== null);
    res.status(200).send({ status: true, data: result, message: 'Success' });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//*******Job Post based Exact Match (jobRole & highestEducation) with primaryskills %tile match *******i had removed PREP******

// const PREP = async function (req, res) {
//   try {
//     const ID = req.params.id; // Assuming params_id is the ID of the job post

//     const jobPost = await jobModel.findById({ _id: ID }).populate('recruiterPlan', 'recruiterPlan');

//     if (!jobPost) {
//       return res.status(404).json({ success: false, error: 'Job post not found' });
//     }

//     const { recruiterPlan, jobRole, highestEducation, primarySkills } = jobPost;

//     const allUsers = await userModel.find({ recruiter: false, isDeleted: false }).lean();

//     const userDetailsArray = []; // Array to store all the userDetails objects

//     await Promise.all(
//       allUsers.map(async (user) => {
//         const educationDetails = await educationModel.find({ userDetailsID: user._id }).lean();
//         const experienceDetails = await experienceModel.find({ userDetailsID: user._id }).lean();
//         const skillsDetails = await skillsModel.findOne({ userDetailsID: user._id }).lean();
//         const projectDetails = await projectsModel.find({ userDetailsID: user._id }).lean();
//         const userProfile = await userprofileModel.findOne({ userDetailsID: user._id }).lean();
//         const preferenceDetails = await preferenceModel.findOne({ userDetailsID: user._id }).lean();

//         const { userDetailsID, recruiter, isDeleted: userIsDeleted, _id: userId, createdAt, updatedAt, __v, password, ...filteredUser } = user;

//         // Exclude fields from educationDetails
//         const filteredEducationDetails = educationDetails.map((education) => {
//           const { userDetailsID, isDeleted: educationIsDeleted, _id: educationId, createdAt, updatedAt, __v, ...filteredEducation } = education;
//           return filteredEducation;
//         });

//         // Exclude fields from experienceDetails
//         const filteredExperienceDetails = experienceDetails.map((experience) => {
//           const { userDetailsID, isDeleted: experienceIsDeleted, _id: experienceId, createdAt, updatedAt, __v, ...filteredExperience } = experience;
//           return filteredExperience;
//         });
//         // Exclude fields from skillsDetails
//         const { userDetailsID: skillsUserDetailsID, createdAt: skillsCreatedAt, updatedAt: skillsUpdatedAt, __v: skillsV, isDeleted: skillsIsDeleted, _id: skillsId, ...filteredSkillsDetails } = skillsDetails;
//         // Exclude fields from projectDetails
//         const filteredProjectDetails = projectDetails.map((project) => {
//           const { userDetailsID, isDeleted: projectIsDeleted, _id: projectId, createdAt, updatedAt, __v, ...filteredProject } = project;
//           return filteredProject;
//         });
//         const filteredPreferenceDetails = preferenceDetails ? (({ _id, userDetailsID, createdAt, updatedAt, isDeleted, __v, ...filteredPrefs }) => filteredPrefs)(preferenceDetails) : null;
//         // Exclude fields from userProfile
//         const { userDetailsID: userProfileDetailsID, createdAt: userProfileCreatedAt, updatedAt: userProfileUpdatedAt, __v: userProfileV, isDeleted: userProfileIsDeleted, _id: userProfileId, ...filteredUserProfile } = userProfile;
//         // Calculate the score for education level
//         const highestEducationPoints = preferenceDetails?.highestEducation ? EducationLevelPoints[preferenceDetails.highestEducation] || 0 : 0;
//         // Calculate the score for experience level
//         const experienceLevelPoints = preferenceDetails?.experienceOverall ? ExperienceLevelPoints[preferenceDetails.experienceOverall] || 0 : 0;
//         // Calculate the score for project type
//         const projectTypePoints = projectDetails.length > 0 ? ProjectTypePoints[projectDetails[0].projectType] || 0 : 0;
//         // Calculate the score for experience type
//         const experienceTypePoints = experienceDetails.length > 0 ? ExperienceTypePoints[experienceDetails[0].experienceType] || 0 : 0;
//         // Calculate the score for authority
//         const authorityPoints = educationDetails.length > 0 ? AuthorityPoints[educationDetails[0].authority] || 0 : 0;
//         // Calculate the overall score for the user
//         const totalScore =
//           highestEducationPoints +
//           experienceLevelPoints +
//           projectTypePoints +
//           experienceTypePoints +
//           authorityPoints;
//         const userDetails = {
//           HiRank: totalScore,
//           user: filteredUser,
//           educationDetails: filteredEducationDetails,
//           experienceDetails: filteredExperienceDetails,
//           skillsDetails: filteredSkillsDetails,
//           projectDetails: filteredProjectDetails,
//           userProfile: filteredUserProfile,
//           preferenceDetails: filteredPreferenceDetails,
//         };
//         if (
//           filteredPreferenceDetails.jobRole.includes(jobRole) &&
//           filteredPreferenceDetails.highestEducation === highestEducation
//         ) {
//           userDetails.primarySkillPercentageMatch = primarySkillPercentageMatch;
//         }
//         userDetailsArray.push(userDetails);
//       })
//     );
//     const advancePool = [];
//     const proficientPool = [];
//     const expertPool = [];
//     userDetailsArray.forEach((userDetails) => {
//       const { educationDetails, preferenceDetails, skillsDetails } = userDetails;
//       const authority = educationDetails.length > 0 ? educationDetails[0].authority : authority;
//       const experienceOverall = preferenceDetails?.experienceOverall;
//       let pool;
//       if (
//         (authority === 'Central Govt' ||
//           authority === 'State Govt' ||
//           authority === 'Deemed University' ||
//           authority === 'Private') &&
//         (experienceOverall === 'Fresher' ||
//           experienceOverall === '1 Year' ||
//           experienceOverall === '2 Year')
//       ) {
//         pool = advancePool;
//       } else if (
//         (authority === 'IIT' ||
//           authority === 'IIM' ||
//           authority === 'IISc' ||
//           authority === 'NIT') &&
//         (experienceOverall === '4 Year' || experienceOverall === '5 Year' || experienceOverall === '3 Year')
//       ) {
//         pool = proficientPool;
//       } else {
//         pool = expertPool;
//       }

//       const requiredPrimarySkills = jobPost.primarySkills;
//       const primarySkillMatchCount = Array.isArray(skillsDetails.primarySkills) ? skillsDetails.primarySkills.filter((skill) => requiredPrimarySkills.includes(skill)).length : 0;
//       const primarySkillPercentageMatch = (primarySkillMatchCount / requiredPrimarySkills.length) * 100;
//       userDetails.primarySkillPercentageMatch = primarySkillPercentageMatch;

//       pool.push(userDetails);
//     });

//     // Based on the recruiterPlan, push matched users to the appropriate pools
//     const { recruiterPlan: jobRecruiterPlan } = jobPost.recruiterPlan;
//     const poolMap = {
//       Gold: advancePool,
//       Silver: proficientPool,
//       Platinum: expertPool,
//     };

//     const matchedUsers = poolMap[jobRecruiterPlan];

//     res.status(200).json({ success: true, matchedUsers });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };



// const PREP = async function (req, res) {
//   try {
//     const ID = req.params.id; // Assuming params_id is the ID of the job post

//     const jobPost = await jobModel.findById({ _id: ID }).populate('recruiterPlan', 'recruiterPlan');

//     if (!jobPost) {
//       return res.status(404).send({ status: false, error: 'Job post not found' });
//     }

//     const { recruiterPlan, jobRole, highestEducation, primarySkills } = jobPost;

//     const allUsers = await userModel.find({ recruiter: false, isDeleted: false }).lean();

//     const userDetailsArray = []; // Array to store all the userDetails objects

//     await Promise.all(
//       allUsers.map(async (user) => {
//         const educationDetails = await educationModel.find({ userDetailsID: user._id }).lean();
//         const experienceDetails = await experienceModel.find({ userDetailsID: user._id }).lean();
//         const skillsDetails = await skillsModel.findOne({ userDetailsID: user._id }).lean();
//         const projectDetails = await projectsModel.find({ userDetailsID: user._id }).lean();
//         const userProfile = await userprofileModel.findOne({ userDetailsID: user._id }).lean();
//         const preferenceDetails = await preferenceModel.findOne({ userDetailsID: user._id }).lean();

//         const { userDetailsID, recruiter, isDeleted: userIsDeleted, _id: userId, createdAt, updatedAt, __v, password, ...filteredUser } = user;

//         // Exclude fields from educationDetails
//         const filteredEducationDetails = educationDetails.map((education) => {
//           const { userDetailsID, isDeleted: educationIsDeleted, _id: educationId, createdAt, updatedAt, __v, ...filteredEducation } = education;
//           return filteredEducation;
//         });

//         // Exclude fields from experienceDetails
//         const filteredExperienceDetails = experienceDetails.map((experience) => {
//           const { userDetailsID, isDeleted: experienceIsDeleted, _id: experienceId, createdAt, updatedAt, __v, ...filteredExperience } = experience;
//           return filteredExperience;
//         });
//         // Exclude fields from skillsDetails
//         const { userDetailsID: skillsUserDetailsID, createdAt: skillsCreatedAt, updatedAt: skillsUpdatedAt, __v: skillsV, isDeleted: skillsIsDeleted, _id: skillsId, ...filteredSkillsDetails } = skillsDetails;
//         // Exclude fields from projectDetails
//         const filteredProjectDetails = projectDetails.map((project) => {
//           const { userDetailsID, isDeleted: projectIsDeleted, _id: projectId, createdAt, updatedAt, __v, ...filteredProject } = project;
//           return filteredProject;
//         });
//         const filteredPreferenceDetails = preferenceDetails ? (({ _id, userDetailsID, createdAt, updatedAt, isDeleted, __v, ...filteredPrefs }) => filteredPrefs)(preferenceDetails) : null;
//         // Exclude fields from userProfile
//         const { userDetailsID: userProfileDetailsID, createdAt: userProfileCreatedAt, updatedAt: userProfileUpdatedAt, __v: userProfileV, isDeleted: userProfileIsDeleted, _id: userProfileId, ...filteredUserProfile } = userProfile;
//         // Calculate the score for education level
//         const highestEducationPoints = preferenceDetails?.highestEducation ? EducationLevelPoints[preferenceDetails.highestEducation] || 0 : 0;
//         // Calculate the score for experience level
//         const experienceLevelPoints = preferenceDetails?.experienceOverall ? ExperienceLevelPoints[preferenceDetails.experienceOverall] || 0 : 0;
//         // Calculate the score for project type
//         const projectTypePoints = projectDetails.length > 0 ? ProjectTypePoints[projectDetails[0].projectType] || 0 : 0;
//         // Calculate the score for experience type
//         const experienceTypePoints = experienceDetails.length > 0 ? ExperienceTypePoints[experienceDetails[0].experienceType] || 0 : 0;
//         // Calculate the score for authority
//         const authorityPoints = educationDetails.length > 0 ? AuthorityPoints[educationDetails[0].authority] || 0 : 0;
        
//         // Calculate the overall score for the user
//         const totalScore =
//           highestEducationPoints +
//           experienceLevelPoints +
//           projectTypePoints +
//           experienceTypePoints +
//           authorityPoints;
//         const userDetails = {
//           HiRank: totalScore,
//           user: filteredUser,
//           educationDetails: filteredEducationDetails,
//           experienceDetails: filteredExperienceDetails,
//           skillsDetails: filteredSkillsDetails,
//           projectDetails: filteredProjectDetails,
//           userProfile: filteredUserProfile,
//           preferenceDetails: filteredPreferenceDetails,
//         };

//         if (
//           filteredPreferenceDetails.jobRole.includes(jobRole) &&
//           filteredPreferenceDetails.highestEducation === highestEducation
//         ) {
//           userDetails.primarySkillPercentageMatch = primarySkillPercentageMatch;
//         }
//         userDetailsArray.push(userDetails);
//       })
//     );

//     const advancePool = [];
//     const proficientPool = [];
//     const expertPool = [];
//     userDetailsArray.forEach((userDetails) => {
//       const { educationDetails, preferenceDetails, skillsDetails } = userDetails;
//       const authority = educationDetails.length > 0 ? educationDetails[0].authority : authority;
//       const experienceOverall = preferenceDetails?.experienceOverall;
//       let pool;
//       if (
//         (authority === 'Central Govt' ||
//           authority === 'State Govt' ||
//           authority === 'Deemed University' ||
//           authority === 'Private') &&
//         (experienceOverall === 'Fresher' ||
//           experienceOverall === '1 Year' ||
//           experienceOverall === '2 Year')
//       ) {
//         pool = advancePool;
//       } else if (
//         (authority === 'IIT' ||
//           authority === 'IIM' ||
//           authority === 'IISc' ||
//           authority === 'NIT') &&
//         (experienceOverall === '4 Year' || experienceOverall === '5 Year' || experienceOverall === '3 Year')
//       ) {
//         pool = proficientPool;
//       } else {
//         pool = expertPool;
//       }

//       const requiredPrimarySkills = jobPost.primarySkills;
//       const primarySkillMatchCount = Array.isArray(skillsDetails.primarySkills) ? skillsDetails.primarySkills.filter((skill) => requiredPrimarySkills.includes(skill)).length : 0;
//       const primarySkillPercentageMatch = (primarySkillMatchCount / requiredPrimarySkills.length) * 100;
//       userDetails.primarySkillPercentageMatch = primarySkillPercentageMatch;

//       pool.push(userDetails);
//     });

//     // Based on the recruiterPlan, push matched users to the appropriate pools
//     const { recruiterPlan: jobRecruiterPlan } = jobPost.recruiterPlan;
//     const poolMap = {
//       Gold: advancePool,
//       Silver: proficientPool,
//       Platinum: expertPool,
//     };

//     const matchedUsers = poolMap[jobRecruiterPlan];

//     res.status(200).send({ status: true, data: matchedUsers, message: 'Success' });
//   } catch (error) {
//     res.status(500).send({ status: false, error: error.message });
//   }
// };

const PREP = async function (req, res) {
  try {
    const ID = req.params.id; // Assuming params_id is the ID of the job post

    const jobPost = await jobModel.findById(ID).populate('recruiterPlan', 'recruiterPlan');

    if (!jobPost) {
      return res.status(404).send({ status: false, error: 'Job post not found' });
    }

    const { recruiterPlan, jobRole, highestEducation, primarySkills } = jobPost;

    const allUsers = await userModel.find({ recruiter: false, isDeleted: false }).lean();

    const userDetailsArray = []; // Array to store all the userDetails objects

    await Promise.all(
      allUsers.map(async (user) => {
        const educationDetails = await educationModel.find({ userDetailsID: user._id }).lean();
        const experienceDetails = await experienceModel.find({ userDetailsID: user._id }).lean();
        const skillsDetails = await skillsModel.findOne({ userDetailsID: user._id }).lean();
        const projectDetails = await projectsModel.find({ userDetailsID: user._id }).lean();
        const userProfile = await userprofileModel.findOne({ userDetailsID: user._id }).lean();
        const preferenceDetails = await preferenceModel.findOne({ userDetailsID: user._id }).lean();

        if (!userProfile) {
          // Skip the current user and continue with the next iteration
          return;
        }

        const { userDetailsID, recruiter, isDeleted: userIsDeleted, _id: userId, createdAt, updatedAt, __v, password, ...filteredUser } = user;

        const filteredEducationDetails = educationDetails.map((education) => {
          const { userDetailsID, isDeleted: educationIsDeleted, _id: educationId, createdAt, updatedAt, __v, ...filteredEducation } = education;
          return filteredEducation;
        });

        const filteredExperienceDetails = experienceDetails.map((experience) => {
          const { userDetailsID, isDeleted: experienceIsDeleted, _id: experienceId, createdAt, updatedAt, __v, ...filteredExperience } = experience;
          return filteredExperience;
        });

        const { userDetailsID: skillsUserDetailsID, createdAt: skillsCreatedAt, updatedAt: skillsUpdatedAt, __v: skillsV, isDeleted: skillsIsDeleted, _id: skillsId, ...filteredSkillsDetails } = skillsDetails;

        const filteredProjectDetails = projectDetails.map((project) => {
          const { userDetailsID, isDeleted: projectIsDeleted, _id: projectId, createdAt, updatedAt, __v, ...filteredProject } = project;
          return filteredProject;
        });

        const filteredPreferenceDetails = preferenceDetails ? (({ _id, userDetailsID, createdAt, updatedAt, isDeleted, __v, ...filteredPrefs }) => filteredPrefs)(preferenceDetails) : null;

        const { userDetailsID: userProfileDetailsID, createdAt: userProfileCreatedAt, updatedAt: userProfileUpdatedAt, __v: userProfileV, isDeleted: userProfileIsDeleted, _id: userProfileId, ...filteredUserProfile } = userProfile;

        const highestEducationPoints = preferenceDetails?.highestEducation ? EducationLevelPoints[preferenceDetails.highestEducation] || 0 : 0;

        const experienceLevelPoints = preferenceDetails?.experienceOverall ? ExperienceLevelPoints[preferenceDetails.experienceOverall] || 0 : 0;

        const projectTypePoints = projectDetails.length > 0 ? ProjectTypePoints[projectDetails[0].projectType] || 0 : 0;

        const experienceTypePoints = experienceDetails.length > 0 ? ExperienceTypePoints[experienceDetails[0].experienceType] || 0 : 0;

        const authorityPoints = educationDetails.length > 0 ? AuthorityPoints[educationDetails[0].authority] || 0 : 0;

        const totalScore = highestEducationPoints + experienceLevelPoints + projectTypePoints + experienceTypePoints + authorityPoints;

        const userDetails = {
          HiRank: totalScore,
          user: filteredUser,
          educationDetails: filteredEducationDetails,
          experienceDetails: filteredExperienceDetails,
          skillsDetails: filteredSkillsDetails,
          projectDetails: filteredProjectDetails,
          userProfile: filteredUserProfile,
          preferenceDetails: filteredPreferenceDetails,
        };

        if (filteredPreferenceDetails && filteredPreferenceDetails.jobRole.includes(jobRole) && filteredPreferenceDetails.highestEducation === highestEducation) {
          const requiredPrimarySkills = jobPost.primarySkills;
          const primarySkillMatchCount = Array.isArray(skillsDetails.primarySkills) ? skillsDetails.primarySkills.filter((skill) => requiredPrimarySkills.includes(skill)).length : 0;
          const primarySkillPercentageMatch = (primarySkillMatchCount / requiredPrimarySkills.length) * 100;
          userDetails.primarySkillPercentageMatch = primarySkillPercentageMatch;
        }

        userDetailsArray.push(userDetails);
      })
    );

    const advancePool = [];
    const proficientPool = [];
    const expertPool = [];

    userDetailsArray.forEach((userDetails) => {
      const { educationDetails, preferenceDetails, skillsDetails } = userDetails;
      const authority = educationDetails.length > 0 ? educationDetails[0].authority : null;
      const experienceOverall = preferenceDetails?.experienceOverall;
      let pool;

      if (
        (authority === 'Central Govt' ||
          authority === 'State Govt' ||
          authority === 'Deemed University' ||
          authority === 'Private') &&
        (experienceOverall === 'Fresher' ||
          experienceOverall === '1 Year' ||
          experienceOverall === '2 Year')
      ) {
        pool = advancePool;
      } else if (
        (authority === 'IIT' ||
          authority === 'IIM' ||
          authority === 'IISc' ||
          authority === 'NIT') &&
        (experienceOverall === '4 Year' ||
          experienceOverall === '5 Year' ||
          experienceOverall === '3 Year')
      ) {
        pool = proficientPool;
      } else {
        pool = expertPool;
      }

      pool.push(userDetails);
    });

    const poolMap = {
      Gold: advancePool,
      Silver: proficientPool,
      Platinum: expertPool,
    };

    const jobRecruiterPlan = jobPost.recruiterPlan.recruiterPlan;
    const matchedUsers = poolMap[jobRecruiterPlan];

    res.status(200).send({ status: true, data: matchedUsers, message: 'Success' });
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};


module.exports = {
  recruiterInformation, recruiterInfo, updateRecruiterData, recruiterSearch, PREP,
  searchJobseekerGeneral, deleteRecruiter, RevenuePlan, getRecruiterPlan, PlanWithJobPostInformation
};
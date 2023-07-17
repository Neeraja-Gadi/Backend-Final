const express = require('express');
const router = express.Router();
const userController = require("../Controllers/userController");
const infoController = require("../Controllers/infoController");
const jobController = require("../Controllers/jobController");
const recruiterController = require("../Controllers/recruiterController");
const skillmappingController = require("../Controllers/skillmappingController")

const talentController = require("../Controllers/preferenceController");
// const {
//     createNotification,
//     getNotificationsByRecipient,
//     getNotificationsBySender,
//     acceptTalent,
//     declineTalent,
//     scheduleInterview,
//     onboardTalent,
//     rejectTalent,
//   } = require('../Controllers/notificationController');
// **********************************Education*************************************************************
router.post("/education", infoController.educationInfo);
router.put("/education/:id", infoController.updateEducationData);
router.get("/educationInformationByID/:id", infoController.educationInformationByID);//get education info from req.params.id
router.delete('/Education/:id', infoController.deleteEducation);
// **********************************Experience************************************************************
router.post("/experience", infoController.experienceInfo);
router.put("/experience/:id", infoController.updateExperienceData);
router.get("/experienceInformationByID/:id", infoController.experienceInformationByID);//get experience info from req.params.id
router.delete('/Experience/:id', infoController.deleteExperience);
// **********************************Projects**************************************************************
router.post("/project", infoController.projectInfo);
router.get("/projectInformationByID/:id", infoController.projectInformationByID);//get project info from req.params.id
router.get("/getProjectByUserDetailsID/:id", infoController.getProjectByUserDetailsID);//get project info from req.params.UserDetailsID
router.delete('/Projects/:id', infoController.deleteProject);
router.put('/Projectss/:id', infoController.updateProject);
// **********************************Skills_Details********************************************************
router.post("/skill", infoController.skillsInfo);
router.put("/skill/:id", infoController.updateSkillsData);
router.get("/skillsInformation/:id", infoController.skillsInformationByID);//get skills info from req.params.id
router.delete('/Skills/:id', infoController.deleteSkills);
// **********************************User_Profile********************************************************S3
router.post('/userProfile', userController.userGeneral);//s3 post request
router.put("/kumar/:id", userController.updateuserProfile);
router.get("/userProfile/:id", userController.getUserProfileById);//get UserProfile info from req.params.id
router.get("/getProfileImg/:id", userController.getSingleImage);//get single image aws s3 via req.params.id
router.delete('/userProfile/:id', userController.deleteuserProfile);
// router.delete('/kumar/:id', userController.deleteSingleImage);
router.put('/SingleImageUpdate/:id', userController.SingleImageUpdate);
router.patch('/updateUserIsApplied/:id', userController.updateUserIsApplied);
// **********************************Talent_Preference_****************************************************
router.post('/talentPreference', talentController.createPreference);
router.put("/updatePreference/:id", talentController.updatePreference);
router.get("/fetchPreference/:id", talentController.fetchPreference);//get Talent preference info from req.params.id
router.delete("/deletePreference/:id", talentController.deletePreference);
router.get('/searchJobsByPreferences/:userDetailsID', talentController.searchJobsByPreferences);
// **********************************Recuiter_Details*******************************************************
router.post("/recruiter", recruiterController.recruiterInfo);
router.put("/recruiter/:id", recruiterController.updateRecruiterData);
router.get("/recruiter/:id", recruiterController.recruiterInformation);//get Recruiter info from req.params.id
router.delete('/Recruiter/:id', recruiterController.deleteRecruiter);
// **********************************Job_Details************************************************************
router.post("/job/:userDetailsID", jobController.jobInfo);
router.put("/job/:id", jobController.updateJobData);
router.get("/jobpostbyRecruiter/:id", jobController.jobpostbyRecruiter);//get Job post info from req.params.id
router.delete('/Jobs/:id', jobController.deleteJob);
// **********************************Revenue****************************************************************
router.post("/revenueR", recruiterController.RevenuePlan);

// *********************************************************************************************************

router.get("/jobs", jobController.searchJobs); //general job search for user or jobseeker
router.get("/allusers", recruiterController.recruiterSearch); // multiple search for recruiter
router.get("/allrecruiter", recruiterController.searchJobseekerGeneral);// general recruiter search for candidate
router.get('/TalentRecommendations/:id', userController.TalentRecommendations);//Talent(ID)_based-Job_Post
router.get('/PREP/:id', recruiterController.PREP);//it is finding right fit pool based
router.get('/getRecruiterPlan/:userDetailsID', recruiterController.getRecruiterPlan);
router.get('/PlanWithDetails/:userDetailsID/:id', recruiterController.PlanWithJobPostInformation);
router.get("/personal/:id", infoController.personalInfo);//get personal info from req.params.id
// router.get('/getUserDetails/:id',recruiterController.getUserDetailsWithMatchedJobPost);
// ******************************login_&_Resister***********************************************************
router.post("/create", userController.register);
router.post('/login', userController.loginUser);
router.post('/resendtoken', userController.sendToken);
router.post('/resetPassword/:userid/:token', userController.verifyAndUpdatePassword);

// *******************************SkillMapping*****************************************************

router.post('/insertskillstemplates',skillmappingController.insertskillstemplates)
router.get('/getskillstemplates',skillmappingController.getskillstemplates)

// ******************************Notifications**************************************************************
// router.post('/notifications/:sender', createNotification);
// router.get('/notifications/recipient/:recipient', getNotificationsByRecipient);
// router.get('/notifications/sender/:sender', getNotificationsBySender);
// router.post('/notifications/accept/:recipient', acceptTalent);
// router.post('/notifications/decline/:recipient', declineTalent);
// router.post('/notifications/schedule-interview/:sender', scheduleInterview);
// router.post('/notifications/onboard/:sender', onboardTalent);
// router.post('/notifications/reject/:sender', rejectTalent);
module.exports = router;
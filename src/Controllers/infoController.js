const educationModel = require("../Models/InfoModels/educationModel.js");
const experienceModel = require("../Models/InfoModels/experienceModel.js");
const projectsModel = require("../Models/InfoModels/projectsModel.js");
const userprofileModel = require("../Models/userprofileModel");
const skillsModel = require("../Models/InfoModels/skillsModel.js");
const userModel = require("../Models/userModel.js");
const Joi = require('joi');
// ********************************************************************************************************************

const educationInfo = async function (req, res) {
  try {
    const educationSchema = Joi.object({
      userDetailsID: Joi.string().required(),
      educationLevel: Joi.string().required(),
      collegeName: Joi.string().required(),
      authority: Joi.string().required(),
      discipline: Joi.string().required(),
      degreeName: Joi.string().required(),
      yearOfpassout: Joi.string().required(),
      startYear: Joi.string().required(),
      endYear: Joi.string().required(),
    });
    const validationResult = educationSchema.validate(req.body, {
      abortEarly: false,
    });
    if (validationResult.error) {
      return res
        .status(400)
        .send({ status: false, message: validationResult.error.details[0].message });
    }

    const date = new Date(req.body.startYear);
    const endDate = new Date(req.body.endYear);
    const formattedEducationData = {
      ...req.body,
      startYear: "" + date.getFullYear() + "-" + ((1 + date.getMonth()) < 10 ? "0" + (1 + date.getMonth()) : (1 + date.getMonth())) + "-" + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()),
      endYear: "" + endDate.getFullYear() + "-" + ((1 + endDate.getMonth()) < 10 ? "0" + (1 + endDate.getMonth()) : (1 + endDate.getMonth())) + "-" + (endDate.getDate() < 10 ? "0" + endDate.getDate() : endDate.getDate()),
    };

    const data = await educationModel.create(formattedEducationData);
    if (data)
      return res
        .status(201)
        .send({ status: true, data: { ...data._doc, startYear: formattedEducationData.startYear, endYear: formattedEducationData.endYear }, message: 'Education data created' });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const updateEducationData = async function (req, res) {
  try {
    const educationSchema = Joi.object({
      userDetailsID: Joi.string(),
      educationLevel: Joi.string(),
      collegeName: Joi.string(),
      authority: Joi.string(),
      discipline: Joi.string(),
      degreeName: Joi.string(),
      yearOfpassout: Joi.string(),
      startYear: Joi.string(),
      endYear: Joi.string(),
    });

    const validationResult = educationSchema.validate(req.body, {
      abortEarly: false,
    });

    if (validationResult.error) {
      return res
        .status(400)
        .send({ status: false, message: validationResult.error.details[0].message });
    }

    const date = new Date(req.body.startYear);
    const endDate = new Date(req.body.endYear);
    const formattedEducationData = {
      ...req.body,
      startYear: "" + date.getFullYear() + "-" + ((1 + date.getMonth()) < 10 ? "0" + (1 + date.getMonth()) : (1 + date.getMonth())) + "-" + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()),
      endYear: "" + endDate.getFullYear() + "-" + ((1 + endDate.getMonth()) < 10 ? "0" + (1 + endDate.getMonth()) : (1 + endDate.getMonth())) + "-" + (endDate.getDate() < 10 ? "0" + endDate.getDate() : endDate.getDate()),
    };

    const id = req.params.id;
    let educationData = {};
    educationData = await educationModel.findById(id);
    if (!educationData) {
      return res.status(404).send({ status: false, message: 'Education data not found' });
    }

    const updatedData = await educationModel.findByIdAndUpdate(id, formattedEducationData, { new: true });

    // Format the startYear and endYear in the response
    const formattedResponse = {
      ...updatedData._doc,
      startYear: formattedEducationData.startYear,
      endYear: formattedEducationData.endYear,
    };

    return res
      .status(200)
      .send({ status: true, data: formattedResponse, message: 'Education data updated' });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
const educationInformationByID = async function (req, res) {
  try {
    const id = req.params.id;
    const educationData = await educationModel.findById(id);
    if (!educationData) {
      return res.status(404).send({ status: false, message: 'Education data not found' });
    }
    const date=new Date(req.body.startYear);
    const endDate=new Date(req.body.endYear);
    const formattedEducationData = {
      ...educationData._doc,
      startYear:""+date.getFullYear()+"-"+((1+date.getMonth())<10?"0"+(1+date.getMonth()):(1+date.getMonth()))+"-"+(date.getDate()<10?"0"+startYear.getDate():date.getDate()),
      endYear:""+endDate.getFullYear()+"-"+((1+endDate.getMonth())<10?"0"+(1+endDate.getMonth()):(1+endDate.getMonth()))+"-"+(endDate.getDate()<10?"0"+endDate.getDate():endDate.getDate())

    };
    return res.status(200).send({ status: true, data: formattedEducationData });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
function formatDate(date) {
  const formattedDate = new Date(date);
  const day = String(formattedDate.getDate()).padStart(2, '0');
  const month = String(formattedDate.getMonth() + 1).padStart(2, '0');
  const year = formattedDate.getFullYear();
  return `${day}/${month}/${year}`;
}
const deleteEducation = async function (req, res) {
  try {
    const id = req.params.id;
    const educationData = await educationModel.findByIdAndUpdate(id, { $set: { isDeleted: true } });
    if (!educationData) {
      return res.status(404).send({ status: false, message: 'Education data not found' });
    }
    return res.status(200).send({ status: true, message: 'Education information deleted successfully' });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
//***********************************************************************************************************/

const experienceInfo = async function (req, res) {
  try {
    const experienceSchema = Joi.object({
      userDetailsID: Joi.string().required(),
      experienceType: Joi.string().required(),
      jobStatus: Joi.string(),
      jobRole: Joi.string().required(),
      companyType: Joi.string(),
      location: Joi.string().required(),
      skills: Joi.array().items().required(),
      companyName: Joi.string().required(),
      startDate: Joi.string().required(),
      endDate: Joi.string().required(),
      isDeleted: Joi.boolean().default(false),
    });
    const validationResult = experienceSchema.validate(req.body, { abortEarly: false });
    if (validationResult.error) {
      return res.status(400).send({ status: false, message: validationResult.error.details[0].message });
    };

    const date = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    const formattedExperienceData = {
      ...req.body,
      startDate: "" + date.getFullYear() + "-" + ((1 + date.getMonth()) < 10 ? "0" + (1 + date.getMonth()) : (1 + date.getMonth())) + "-" + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()),
      endDate: "" + endDate.getFullYear() + "-" + ((1 + endDate.getMonth()) < 10 ? "0" + (1 + endDate.getMonth()) : (1 + endDate.getMonth())) + "-" + (endDate.getDate() < 10 ? "0" + endDate.getDate() : endDate.getDate()),
    };

    const data = await experienceModel.create(formattedExperienceData);
    if (data)
      return res.status(201).send({ status: true, data: data, message: 'Experience data created' });

    // Additional response if data creation fails
    return res.status(500).send({ status: false, message: 'Failed to create experience data' });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

const updateExperienceData = async function (req, res) {
  try {
    const { id }= req.params;

    const experienceSchema = Joi.object({
      userDetailsID: Joi.string(),
      experienceType: Joi.string(),
      jobStatus: Joi.string(),
      jobRole: Joi.string(),
      companyType: Joi.string(),
      location: Joi.string(),
      skills: Joi.array().items(Joi.string()),
      companyName: Joi.string(),
      startDate: Joi.string(),
      endDate: Joi.string(),
    });


    const validationResult = experienceSchema.validate(req.body, { abortEarly: false });
    if (validationResult.error) {
      return res.status(400).send({ status: false, message: validationResult.error.details[0].message });
    }
    const date = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    const formattedExperienceData = {
      ...req.body,
      startDate: "" + date.getFullYear() + "-" + ((1 + date.getMonth()) < 10 ? "0" + (1 + date.getMonth()) : (1 + date.getMonth())) + "-" + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()),
      endDate: "" + endDate.getFullYear() + "-" + ((1 + endDate.getMonth()) < 10 ? "0" + (1 + endDate.getMonth()) : (1 + endDate.getMonth())) + "-" + (endDate.getDate() < 10 ? "0" + endDate.getDate() : endDate.getDate()),
    };

   
    const data = await experienceModel.findByIdAndUpdate(id,formattedExperienceData, { new: true });
    if (!data) {
      return res.status(404).send({ status: false, message: 'Experience data not found' });
    }

    return res.status(200).send({ status: true, data: data, message: 'Experience data updated' });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
const experienceInformationByID = async function (req, res) {
  try {
    const id = req.params.id;
    const experienceData = await experienceModel.findOne({ _id: id });
    if (!experienceData) {
      return res.status(404).send({ status: false, message: 'Experience data not found' });
    }
    const date=new Date(experienceData.startDate);
    const endDate=new Date(experienceData.endDate);
    const formattedExperienceData = {
      ...experienceData._doc,
      startDate:""+date.getFullYear()+"-"+((1+date.getMonth())<10?"0"+(1+date.getMonth()):(1+date.getMonth()))+"-"+(date.getDate()<10?"0"+date.getDate():date.getDate()),
      endDate:""+endDate.getFullYear()+"-"+((1+endDate.getMonth())<10?"0"+(1+endDate.getMonth()):(1+endDate.getMonth()))+"-"+(endDate.getDate()<10?"0"+endDate.getDate():endDate.getDate()),
      createdDate: formatDate(experienceData.createdAt),
      updatedDate: formatDate(experienceData.updatedAt),
    };

    return res.status(200).send({ status: true, data: formattedExperienceData });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const deleteExperience = async function (req, res) {
  try {
    const id = req.params.id;
    const experienceData = await experienceModel.findByIdAndUpdate(id, { $set: { isDeleted: true } });
    if (!experienceData) {
      return res.status(404).send({ status: false, message: 'Experience data not found' });
    }
    res.status(200).send({ status: true, message: 'Experience information deleted successfully' });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

// ********************************************************************************************************************

const projectInfo = async (req, res) => {
  try {
    const projectSchema = Joi.object({
      userDetailsID: Joi.string().required(),
      skills: Joi.array().items((Joi.string()).required()).required(),
      projectType: Joi.string().required(),
      projectTitle: Joi.string().required(),
      startDate: Joi.string().required(),
      endDate: Joi.string().required(),
      organizationName: Joi.string(),
      experienceType: Joi.string(),
      description: Joi.string(),
      url: Joi.string(),
      isDeleted: Joi.boolean().default(false)
    });
    const validationResult = projectSchema.validate(req.body, { abortEarly: false });
    if (validationResult.error) {
      return res.status(400).send({ status: false, message: validationResult.error.details[0].message });
    }
    const data = await projectsModel.create(req.body);
    return res.status(201).send({ status: true, data: data, message: 'Project data created' });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const projectSchema = Joi.object({
      userDetailsID: Joi.string(),
      skills: Joi.array().items(Joi.string()),
      projectType: Joi.string(),
      projectTitle: Joi.string(),
      startDate: Joi.string(),
      endDate: Joi.string(),
      organizationName: Joi.string(),
      description: Joi.string(),
      url: Joi.string(),
      isDeleted: Joi.boolean()
    });

    const validationResult = projectSchema.validate(req.body, { abortEarly: false });
    if (validationResult.error) {
      return res.status(400).send({ status: false, message: validationResult.error.details[0].message });
    }

    const date = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    const formattedProjectData = {
      ...req.body,
      startDate: "" + date.getFullYear() + "-" + ((1 + date.getMonth()) < 10 ? "0" + (1 + date.getMonth()) : (1 + date.getMonth())) + "-" + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()),
      endDate: "" + endDate.getFullYear() + "-" + ((1 + endDate.getMonth()) < 10 ? "0" + (1 + endDate.getMonth()) : (1 + endDate.getMonth())) + "-" + (endDate.getDate() < 10 ? "0" + endDate.getDate() : endDate.getDate()),
    };

    const data = await projectsModel.findByIdAndUpdate(id, formattedProjectData, { new: true });

    if (!data) {
      return res.status(404).send({ status: false, message: 'Project not found' });
    }

    return res.status(200).send({ status: true, data: data, message: 'Project data updated' });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

const projectInformationByID = async function (req, res) {
  try {
    const id = req.params.id;
    const projectData = await projectsModel.findOne({ _id: id });
    if (!projectData) {
      return res.status(404).send({ status: false, message: 'projectData not found' });
    }
    const date=new Date(projectData.startDate);
    const endDate=new Date(projectData.endDate);
    const formattedProjectData = {
      ...projectData._doc,
      startDate:""+date.getFullYear()+"-"+((1+date.getMonth())<10?"0"+(1+date.getMonth()):(1+date.getMonth()))+"-"+(date.getDate()<10?"0"+date.getDate():date.getDate()),
      endDate:""+endDate.getFullYear()+"-"+((1+endDate.getMonth())<10?"0"+(1+endDate.getMonth()):(1+endDate.getMonth()))+"-"+(endDate.getDate()<10?"0"+endDate.getDate():endDate.getDate()),
      createdDate: formatDate(projectData.createdAt),
      updatedDate: formatDate(projectData.updatedAt),
    };
    res.status(200).send({ status: true, data: formattedProjectData });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

// *****************************************************************************************************

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await projectsModel.findByIdAndRemove(id);
    if (!data) {
      return res.status(404).send({ status: false, message: 'Project not found' });
    }
    return res.status(200).send({ status: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};


//********************************************************************************************************************

const skillsInfo = async function (req, res) {
  try {
    const skillsSchema = Joi.object({
      userDetailsID: Joi.string().required(),
      primarySkills: Joi.array().items(Joi.string()).required(),
      secondarySkills: Joi.array().items(Joi.string()).required(),
    });
    const validationResult = skillsSchema.validate(req.body, { abortEarly: false });
    if (validationResult.error) {
      return res.status(400).send({ status: false, message: validationResult.error.details[0].message });
    };
    const data = await skillsModel.create(req.body);
    if (data)
      return res.status(201).send({ status: true, data: data, message: 'Skills data created' });

  } catch (err) {
    res.status(500).send({ status: false, message: err.message })
  }
};

const updateSkillsData = async function (req, res) {
  try {
    const skillsSchema = Joi.object({
      userDetailsID: Joi.string(),
      primarySkills: Joi.array().items(Joi.string()),
      secondarySkills: Joi.array().items(Joi.string()),
    });
    const validationResult = skillsSchema.validate(req.body, { abortEarly: false });
    if (validationResult.error) {
      return res
        .status(400)
        .send({ status: false, message: validationResult.error.details[0].message });
    }

    const userID = req.params.id;
    let skillData = await skillsModel.findOne({ _id: userID });
    if (!skillData) {
      return res.status(404).send({ status: false, message: "Skill data not found" });
    }

    if (req.body.primarySkills) {
      req.body.primarySkills.forEach((skill) => {
        if (!skillData.primarySkills.includes(skill)) {
          skillData.primarySkills.push(skill);
        }
      });
    }

    if (req.body.secondarySkills) {
      req.body.secondarySkills.forEach((skill) => {
        if (!skillData.secondarySkills.includes(skill)) {
          skillData.secondarySkills.push(skill);
        }
      });
    }

    const updatedData = await skillsModel.findByIdAndUpdate(
      { _id: skillData._id },
      skillData,
      { new: true }
    );
    return res.status(200).send({ status: true, data: updatedData, message: "Skill data updated" });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const skillsInformationByID = async function (req, res) {
  try {
    const id = req.params.id;
    const skillsData = await skillsModel.findOne({ _id: id });
    if (!skillsData) {
      return res.status(404).send({ status: false, message: 'skillsData data not found' });
    }
    let formattedSkillsData;
    if (Array.isArray(skillsData)) {
      formattedSkillsData = skillsData.map((data) => ({
        ...data._doc,
        createdDate: formatDate(data.createdAt),
        updatedDate: formatDate(data.updatedAt),
      }));
    } else {
      formattedSkillsData = {
        ...skillsData._doc,
        createdDate: formatDate(skillsData.createdAt),
        updatedDate: formatDate(skillsData.updatedAt),
      };
    }
    res.status(200).send({ status: true, data: formattedSkillsData });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

const deleteSkills = async function (req, res) {
  try {
    const id = req.params.id;
    const skillsData = await skillsModel.findByIdAndUpdate(id, { $set: { isDeleted: true } });
    if (!skillsData) {
      return res.status(404).send({ status: false, message: 'skillsData data not found' });
    }
    res.status(200).send({ status: true, message: 'Skills information deleted successfully' });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

// ********************************************************************************************************************

const personalInfo = async function (req, res) {
  try {
    const id = req.params.id
    const user = await userModel.find({ _id: id })
    const educationData = await educationModel.find({ userDetailsID: id  ,isDeleted : false})
    const experienceData = await experienceModel.find({ userDetailsID: id  , isDeleted : false})
    const skills = await skillsModel.find({ userDetailsID: id })
    const userprofile = await userprofileModel.find({ userDetailsID: id ,isDeleted : false })
    const projects = await projectsModel.find({ userDetailsID: id ,isDeleted : false })
    const data = { user, educationData, experienceData, skills, userprofile, projects }
    if (!data) {
      return res.status(404).send({ status: false, message: 'Personal Data data not found' });
    }
    return res.status(200).send({ status: true, data: data, message: 'Personal Data Found' });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message })
  }
};


module.exports = { educationInfo, educationInformationByID, deleteEducation, updateEducationData, experienceInformationByID, deleteExperience, experienceInfo, updateExperienceData, skillsInformationByID, skillsInfo, updateSkillsData, deleteSkills, deleteProject, projectInformationByID, updateProject, projectInfo, personalInfo };
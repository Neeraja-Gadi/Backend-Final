const userModel = require("../Models/userModel");
const educationModel = require('../Models/InfoModels/educationModel');
const experienceModel = require('../Models/InfoModels/experienceModel');
const skillsModel = require('../Models/InfoModels/skillsModel');
const userprofileModel = require('../Models/userprofileModel');
const jobModel = require('../Models/jobModel');
const bcrypt = require("bcrypt");
const { sendMail } = require("../Middlewares/sendMail");
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { upload } = require('./awsController.js');
const { s3Client, GetObjectCommand } = require('./awsController.js');
// const { DeleteObjectCommand } = require('./awsController.js');
const path = require("path");
const { Readable } = require("stream");
// const { DeleteObjectsCommand } = require("@aws-sdk/client-s3");

// ********************************************************************************************************************
const userGeneral = async function (req, res) {
  try {
    upload.fields([
      { name: 'profileLink', maxCount: 1 },
      { name: 'document', maxCount: 1 },
    ])(req, res, async function (err) {
      if (err) {
        return res.status(500).send({ status: false, message: err.message });
      }

      const { userDetailsID, gitLink, gender, doB, phone, location, aboutMe, salary } = req.body;
      const { profileLink, document } = req.files;

      if (!profileLink || !document) {
        return res.status(400).send({ status: false, message: 'profileLink and document are required' });
      }

      const userProfileData = {
        userDetailsID,
        gitLink,
        gender,
        doB,
        phone,
        location,
        aboutMe,
        salary,
        profileLink: {
          key: req.files.profileLink[0].key,
          url: req.files.profileLink[0].location
        },
        document: {
          key: req.files.document[0].key,
          url: req.files.document[0].location
        }
      };

      const data = await userprofileModel.create(userProfileData);

      if (data) {
        return res.status(200).send({ status: true, data: data, message: 'User profile data created' });
      }
    });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

const updateuserProfile = async function (req, res) {
  try {
    const id = req.params.id;

    upload.fields([
      { name: 'profileLink', maxCount: 1 },
      { name: 'document', maxCount: 1 },
    ])(req, res, async function (err) {
      if (err) {
        return res.status(500).send({ status: false, message: err.message });
      }

      const { userDetailsID, gitLink, gender, doB, phone, location, aboutMe, salary } = req.body;
      const { profileLink, document } = req.files;

      const userProfileData = {
        userDetailsID,
        gitLink,
        gender,
        doB,
        phone,
        location,
        aboutMe,
        salary
      };

      // Handle file uploads if files exist
      if (profileLink || document) {
        if (profileLink) {
          userProfileData.profileLink = {
            key: req.files.profileLink[0].key,
            url: req.files.profileLink[0].location
          };
        }

        if (document) {
          userProfileData.document = {
            key: req.files.document[0].key,
            url: req.files.document[0].location
          };
        }
      }

      const updatedUserProfile = await userprofileModel.findByIdAndUpdate(id, userProfileData, { new: true });

      if (!updatedUserProfile) {
        return res.status(404).send({ status: false, message: 'User profile not found' });
      }

      return res.status(200).send({ status: true, data: updatedUserProfile, message: 'User profile updated successfully' });
    });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

// **********************************delete s3*************************************************************

const deleteProfile = async function (req, res) {
  try {
    const id = req.params.id;
    const key = req.params.key;
    if (!id) {
      return res.status(400).send({ status: false, message: 'User profile ID is missing' });
    }

    const userProfile = await userprofileModel.findByKeyAndId(key, id);
    if (!userProfile) {
      return res.status(404).send({ status: false, message: 'User profile not found' });
    }

    const { profileLink } = userProfile;
    if (profileLink && profileLink.key) {
      const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: profileLink.key,
      };

      await s3Client.send(new DeleteObjectsCommand(deleteParams));
    }

    // Delete the profileLink from MongoDB
    userProfile.profileLink = undefined;
    await userProfile.save();

    return res.status(200).send({ status: true, message: 'Profile link and file deleted successfully' });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

// ***************************************************************************************************************
const deleteuserProfile = async function (req, res) {
  try {
    const id = req.params.id; //mongoose userprofile id
    const userprofileData = await userprofileModel.findByIdAndUpdate(id, { $set: { isDeleted: true } });
    if (!userprofileData) {
      return res.status(404).send({ status: false, message: 'userprofileData data not found' });
    }
    res.status(200).json({ status: true, message: 'userprofileData information deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// ***************************************************************************************************************

const getUserProfileById = async function (req, res) {
  try {
    const id = req.params.id;

    const userProfile = await userprofileModel.findById(id);

    if (!userProfile) {
      return res.status(404).send({ status: false, message: 'User profile not found' });
    }

    return res.status(200).send({ status: true, data: userProfile, message: 'User profile retrieved successfully' });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};
// ********************************************************************************************************************
const register = async function (req, res) {
  try {
    const { firstName, lastName, email, recruiter, password } = req.body;
    const userSchema = Joi.object({
      firstName: Joi.string().pattern(new RegExp("^[a-zA-Z]")).required(),
      lastName: Joi.string().pattern(new RegExp("^[a-zA-Z]")).required(),
      email: Joi.string().email().required(),
      recruiter: Joi.boolean().required(),
      password: Joi.string().min(8).max(15).required()
    });
    const validationResult = userSchema.validate(req.body);
    if (validationResult.error) {
      return res.status(400).send({ status: false, message: validationResult.error.details[0].message });
    }
    const userEmail = await userModel.findOne({ email });
    if (userEmail) {
      return res.status(400).send({ status: false, message: "User already exists" });
    }
    const user = await userModel.create({ firstName, lastName, email, password, recruiter });
    if (user) {
      return res.status(201).send({ status: true, message: "User created successfully", data: user });
    } else {
      return res.status(40).send({ status: false, message: "User creation failed" });
    }
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};
//**************************************************************************************************************
const sendToken = async function (req, res) {
  const { email } = req.body;
  let userDB = await userModel.findOne({ email });
  if (!userDB) return res.status(400).send({ message: "Invalid User email provided" });
  //creating token using jwt and bcrypt to hash the token
  const token = jwt.sign({ userId: userDB._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
  // console.log(token)
  //creating expiry after 1 hour
  let expiry = new Date(Date.now() + 3600 * 1000);
  //updating users collection with resetToken and resetExpiry Time
  const resetUpdateDB = await userModel.findOneAndUpdate(
    { email: email },
    {
      $set: {
        resetToken: token,
        resetExpiry: expiry,
      },
    },
    { returnNewDocument: true }
  );
  let link = `http://localhost:3000/resetPassword/${userDB._id}/${token}`;
  // let link = `http://localhost:3000/resetPassword/${userDB._id}/${token}`;
  await sendMail(userDB.email, "Password Reset App - Reset your password", `Hello! ${email}, You have requested to reset your password.
  Please click the following link to reset your password: ${link}`);
  res.status(200).send({
    status: true, data: resetUpdateDB, token: token,
    message: "Reset link sent to mail",
  });
}


// **************************************************************************
const verifyAndUpdatePassword =  async function(req, res) {
  const { userid, token } = req.params;
  let userDB = await userModel.findOne({ _id: userid });
  //checking user is in db or not
  if (!userDB)
    return res.status(400).send({ Error: "Invalid Link or Expired" });
  //checking token is present in db is the token sent by the user or not
  const isTokenValid = userDB.resetToken === token;
  //checking if the time limit to change the password has the expired
  //  const isntExpired = userDB.resetExpiry > Date.now();
   // Checking if the reset expiry time has expired
  //  const resetExpiryDate = new Date(userDB.resetExpiry);
   const resetExpiryDate = new Date();
   resetExpiryDate.setHours(resetExpiryDate.getHours() + 1);
   const isntExpired = resetExpiryDate > Date.now();
   console.log('resetExpiry:', userDB.resetExpiry);
   console.log('current time:', Date.now());
  //  console.log(isTokenValid, isntExpired);
  if (isTokenValid && isntExpired) {
    const { password } = req.body;
    const hashedNewPassword = await bcrypt.hash(password, Number(10));
    //deleting the token and expiry time after updating password
    const updatePasswordDB = await userModel.findOneAndUpdate(
      { _id: userid},
      {
        $set: { password: hashedNewPassword },
        $unset: {
          resetExpiry: 1,
          resetToken: 1,
        },
      },
      { returnNewDocument: true }
    );

    return res.status(200).send({status:true , data : updatePasswordDB ,message: "password updated successfully" });
  }
  return  res.status(400).send({ Error: "Invalid Link"});
}
// **************************************************************************

const loginUser = async function (req, res) {
  try {
    const { email, password } = req.body;
    const userSchema = Joi.object({
      password: Joi.string().min(8).max(15).required(),
      email: Joi.string().email().required()
    });
    const validationResult = userSchema.validate(req.body);
    if (validationResult.error) {
      return res.status(400).send({ status: false, message: validationResult.error.details[0].message });
    }
    const user = await userModel.findOne({ email:email, isDeleted: false });
    if (!user) {
     return res.status(404).send({ status: false, message: "Invalid username or password" });
    }
    const bcryptdecodedPassword = await bcrypt.compare(password, user.password)
    if (bcryptdecodedPassword) return res.status(404).send({ status: false, message: "Incorrect password" });
    const token = jwt.sign(user._id.toString(), "Hiclousia"); // should be kept in the env file
    return res.status(200).send({ status: true, message: "User logged in successfully", token: token, data: user });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
//*********************************single image update*********************************************************
// const SingleImageUpdate = async function (req, res) {
//   try {
//     const id = req.params.id;

//     upload.fields([
//       { name: 'profileLink', maxCount: 1 }
//     ])(req, res, async function (err) {
//       if (err) {
//         return res.status(500).send({ status: false, message: err.message });
//       }

//       const { userDetailsID } = req.body;
//       const { profileLink } = req.files;

//       const userProfileData = {
//         userDetailsID
//       };

//       // Handle file uploads if files exist
//       if (profileLink) {
//         if (profileLink) {
//           userProfileData.profileLink = {

//             url: req.files.profileLink[0].location
//           };
//         }
//       }
//       const updatedUserProfile = await userprofileModel.findByIdAndUpdate(id, userProfileData, { new: true });

//       if (!updatedUserProfile) {
//         return res.status(404).send({ status: false, message: 'User profile not found' });
//       }

//       return res.status(200).send({ status: true, data: updatedUserProfile, message: 'User profile updated successfully' });
//     });
//   } catch (err) {
//     res.status(500).send({ status: false, message: err.message });
//   }
// };


const SingleImageUpdate = async function (req, res) {
  try {
    const id = req.params.id;

    upload.fields([
      { name: 'profileLink', maxCount: 1 }
    ])(req, res, async function (err) {
      if (err) {
        return res.status(500).send({ status: false, message: err.message });
      }

      // const { userDetailsID } = req.body;
      const { profileLink } = req.files;

      const userProfileData = {
        // userDetailsID
      };

      // Handle file uploads if files exist
      if (profileLink) {
        if (profileLink) {
          userProfileData.profileLink = {

            url: req.files.profileLink[0].location
          };
        }
      }
      const updatedUserProfile = await userprofileModel.findOneAndUpdate({userDetailsID:id}, userProfileData, { new: true });

      if (!updatedUserProfile) {
        return res.status(404).send({ status: false, message: 'User profile not found' });
      }

      return res.status(200).send({ status: true, data: updatedUserProfile, message: 'User profile updated successfully' });
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
// **************************************************************************************************************
const findJobMatches = async function (req, res) {
  try {
    const userId = req.params.id; //USERID

    // Fetch user details
    const userDetails = await userModel.findById(userId);
    if (!userDetails) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch user's education details
    const educationDetails = await educationModel
      .findOne({ userDetailsID: userDetails._id })
      .lean();

    // Fetch user's experience details
    const experienceDetails = await experienceModel
      .findOne({ userDetailsID: userDetails._id })
      .lean();

    // Fetch user's skills details
    const skillsDetails = await skillsModel
      .findOne({ userDetailsID: userDetails._id })
      .lean();

    // Fetch user's profile details
    const userProfileDetails = await userprofileModel
      .findOne({ userDetailsID: userDetails._id })
      .lean();

    // Convert userProfileDetails.location to string
    const locationString = userProfileDetails.location.toString();

    // Perform word matches in jobModel fields
    const jobMatches = await jobModel.find({
      $or: [
        { jobRole: { $in: experienceDetails.jobRole } },
        { highestEducation: { $elemMatch: { educationLevel: educationDetails.educationLevel } } },
        { experience: { $in: experienceDetails.experience } },
        { location: { $regex: locationString, $options: "i" } },
      ],
    });

    res.json({ jobMatches });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

async function getSingleImage(req, res) {
  const id = req.params.id;
  try {
    // Fetch the document from MongoDB
    const userDetails = await userprofileModel.findOne({ userDetailsID: id });
    if (!userDetails || !userDetails.profileLink) {
      return res.status(404).json({ message: "User details not found or profile image not available" });
    }

    const { key } = userDetails.profileLink;

    // Retrieve the image from S3 bucket
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    };
    const data = await s3Client.send(new GetObjectCommand(params));
    const stream = Readable.from(data.Body);

    // Determine the content type based on the file extension
    const contentType = getContentType(key);
    if (!contentType) {
      return res.status(500).json({ message: "Invalid image file format" });
    }

    // Set the content type header
    res.set("Content-Type", contentType);

    // Send the image data as the response
    stream.pipe(res);
  } catch (error) {
    console.error("Error retrieving profile image:", error);
    res.status(500).json({ message: "Error retrieving profile image" });
  }
}

// Function to determine the content type based on the file extension
function getContentType(filename) {
  const extension = path.extname(filename).toLowerCase();
  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    // Add more cases for other image formats if needed
    default:
      return null; // Invalid file format
  }
}


const updateUserIsApplied = async (req, res) => {
  try {
    const userId = req.params.id; // Assuming the user ID is passed as a parameter in the request URL
    const { isApplied } = req.body; // Assuming the new value for isApplied is passed in the request body

    // Update the isApplied value for the user with the given ID
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { isApplied },
      { new: true } // To return the updated user object
    );

    if (!updatedUser) {
      return res.status(404).send({ status: false, message: 'User not found' });
    }

    return res.status(200).send({ status: true, data: updatedUser, message: 'User isApplied updated successfully' });
  } catch (error) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const TalentRecommendations = async function (req, res) {
  try {
    const userId = req.params.id; // USERID

    // Fetch user details
    const userDetails = await userModel.findById(userId);
    if (!userDetails) {
      return res.status(404).send({ status: false, message: "User not found" });
    }

    // Fetch user's education details
    const educationDetails = await educationModel
      .findOne({ userDetailsID: userDetails._id })
      .lean();

    // Fetch user's experience details
    const experienceDetails = await experienceModel
      .findOne({ userDetailsID: userDetails._id })
      .lean();

    // Fetch user's skills details
    const skillsDetails = await skillsModel
      .findOne({ userDetailsID: userDetails._id })
      .lean();

    // Fetch user's profile details
    const userProfileDetails = await userprofileModel
      .findOne({ userDetailsID: userDetails._id })
      .lean();

    // Convert userProfileDetails.location to string
    const locationString = userProfileDetails.location.toString();

    // Prepare search query for job matching
    const searchQuery = {
      $or: [
        { jobRole: { $in: experienceDetails.jobRole } },
        { highestEducation: { $in: educationDetails.educationLevel } },
        { experience: { $in: experienceDetails.experience } },
        { location: { $regex: locationString, $options: "i" } },
      ],
    };

    // Perform word matches in jobModel fields
    const jobMatches = await jobModel.find(searchQuery);

    res.status(200).send({ status: true, data: jobMatches, message: 'Success' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: false, message: "Internal server error" });
  }
};

module.exports = { register, loginUser, userGeneral, 
  deleteuserProfile,getSingleImage , updateUserIsApplied ,
  findJobMatches, updateuserProfile, getUserProfileById, SingleImageUpdate, 
  sendToken, verifyAndUpdatePassword, TalentRecommendations,deleteProfile };
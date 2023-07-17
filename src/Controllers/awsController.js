const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
// const deleteProfile = require("./userController"); // Import the deleteProfile function from the separate file

const s3Client = new S3Client({
  region: process.env.AWS_REGION_NAME,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});


const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME,
    // META DATA FOR PUTTING FIELD NAME
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    // SET / MODIFY ORIGINAL FILE NAME
    key: function (req, file, cb) {
      cb(null, `${Date.now()}_${path.basename(file.originalname)}`);
    },
  }),
  // SET DEFAULT FILE SIZE UPLOAD LIMIT
  limits: { fileSize: 1024 * 1024 * 50 }, // 50MB
});

module.exports = {
  upload,
  s3Client,
  GetObjectCommand,
DeleteObjectCommand,
  // deleteProfile
};

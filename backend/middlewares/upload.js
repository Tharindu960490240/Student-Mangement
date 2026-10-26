require("dotenv").config();

const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");

const { S3Client } = require("@aws-sdk/client-s3");

/* ===============================
   VALIDATE ENV (DEBUG SAFE)
=============================== */
if (
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_SECRET_ACCESS_KEY ||
  !process.env.AWS_BUCKET_NAME
) {
  console.warn("Missing AWS environment variables");
}

/* ===============================
   AWS S3 CONFIG
=============================== */
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/* ===============================
   FILE FILTER
=============================== */
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG and WEBP images are allowed"), false);
  }
};

/* ===============================
   CREATE UPLOADER FACTORY
=============================== */
const createUploader = (folder) => {
  return multer({
    storage: multerS3({
      s3,
      bucket: process.env.AWS_BUCKET_NAME,
      contentType: multerS3.AUTO_CONTENT_TYPE,

      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },

      key: (req, file, cb) => {
        const ext = path.extname(file.originalname);

        let filePath = "";

        if (folder === "profile_pic") {
          const userId = req.user?.id || "temp";
          filePath = `profile_pic/${userId}/profile-${Date.now()}${ext}`;
        } else if (folder === "ads") {
          const adId = req.params.adId || "temp";
          const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

          filePath = `ads/${adId}/${uniqueName}${ext}`;
        } else {
          const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

          filePath = `${folder}/${uniqueName}${ext}`;
        }

        cb(null, filePath);
      },

      /* ===============================
         🔥 THIS IS THE FIX
         compress BEFORE upload
      =============================== */
      shouldTransform: (req, file, cb) => {
        cb(null, true);
      },

      transforms: (req, file, cb) => {
        let size, quality;

        if (folder === "profile_pic") {
          size = 300;
          quality = 60;
        } else {
          size = 1200;
          quality = 85;
        }

        cb(null, [
          {
            id: "compressed",
            key: (req, file, cb2) => cb2(null, file.key),
            transform: (req, file, cb2) => {
              cb2(
                null,
                sharp().resize({ width: size }).jpeg({ quality })
              );
            },
          },
        ]);
      },
    }),

    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  });
};
/* ===============================
   UPLOADERS
=============================== */
const uploadAds = createUploader("ads");
const uploadProfile = createUploader("profile_pic");

/* ===============================
   EXPORTS
=============================== */
module.exports = {
  uploadAds,
  uploadProfile,
  s3,
};
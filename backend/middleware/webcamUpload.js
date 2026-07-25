const multer = require("multer");

const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloudinary = require("../config/cloudinary");

// ===================================
// Cloudinary Storage
// ===================================

const storage = new CloudinaryStorage({
  cloudinary,

  params: {
    folder: "AI_Mock_Interview/Webcam",

    resource_type: "video",

    allowed_formats: ["mp4", "webm", "mov", "avi"],
  },
});
// ===================================
// Multer Upload
// ===================================

const webcamUpload = multer({
  storage,

  limits: {
    fileSize: 100 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "video/mp4",

      "video/webm",

      "video/quicktime",

      "video/x-msvideo",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Only video files are allowed."),

        false,
      );
    }
  },
});

module.exports = webcamUpload;

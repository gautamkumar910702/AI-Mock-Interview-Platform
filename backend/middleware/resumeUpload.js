const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");

// Create uploads/resumes folder if not exists

const uploadPath = path.join(__dirname, "../uploads/resumes");

fs.ensureDirSync(uploadPath);

// Storage

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "-");

    cb(null, uniqueName);
  },
});

// File Filter

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed."), false);
  }
};

// Upload Middleware

const resumeUpload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = resumeUpload;

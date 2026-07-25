const multer = require("multer");

// ======================================================
// Memory Storage
// ======================================================

const storage = multer.memoryStorage();

// ======================================================
// Allowed Video Types
// ======================================================

const allowedMimeTypes = [
  "video/webm",

  "video/mp4",

  "video/ogg",

  "video/quicktime",
];

// ======================================================
// File Filter
// ======================================================

const fileFilter = (req, file, cb) => {
  const baseMimeType = String(file.mimetype || "")
    .split(";", 1)[0]
    .trim()
    .toLowerCase();

  if (
    !allowedMimeTypes.includes(baseMimeType) &&
    !baseMimeType.startsWith("video/")
  ) {
    return cb(
      new Error("Only WebM, MP4, OGG and MOV video files are allowed."),

      false,
    );
  }

  cb(null, true);
};

// ======================================================
// Multer Configuration
// ======================================================

const uploadVideo = multer({
  storage,

  fileFilter,

  limits: {
    // 100 MB

    fileSize: 100 * 1024 * 1024,

    files: 1,
  },
});

// ======================================================
// Export
// ======================================================

module.exports = uploadVideo;

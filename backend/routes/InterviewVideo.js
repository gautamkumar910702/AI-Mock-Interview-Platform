const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const uploadVideo = require("../middleware/uploadVideo");

const {
  uploadInterviewVideo,

  getInterviewVideo,

  getInterviewVideoHistory,

  deleteInterviewVideo,
} = require("../controllers/InterviewVideoController");

// ======================================================
// Upload Interview Video
// ======================================================

router.post(
  "/upload",

  authMiddleware,

  uploadVideo.single("video"),

  uploadInterviewVideo,

  (error, req, res, next) => {
    if (error) {
      return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
        success: false,

        message: error.message || "Invalid interview video upload.",
      });
    }

    next();
  },
);

// ======================================================
// Interview Video History
// ======================================================

router.get(
  "/history",

  authMiddleware,

  getInterviewVideoHistory,
);

// ======================================================
// Get Interview Video By Interview ID
// ======================================================

router.get(
  "/:interviewId",

  authMiddleware,

  getInterviewVideo,
);

// ======================================================
// Delete Interview Video
// ======================================================

router.delete(
  "/:id",

  authMiddleware,

  deleteInterviewVideo,
);

module.exports = router;

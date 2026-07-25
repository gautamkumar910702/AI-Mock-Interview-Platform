const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const webcamUpload = require("../middleware/webcamUpload");

const {
  uploadWebcamInterview,
  getWebcamHistory,
} = require("../controllers/WebcamController");

// =====================================
// Upload Webcam Interview
// =====================================

router.post(
  "/upload",
  authMiddleware,
  webcamUpload.single("video"),
  uploadWebcamInterview,
);

// =====================================
// Webcam History
// =====================================

router.get("/history", authMiddleware, getWebcamHistory);

module.exports = router;

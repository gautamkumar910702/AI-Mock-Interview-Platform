const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  startInterview,

  getInterview,

  submitAnswer,

  finishInterview,

  getInterviewHistory,

  getDashboardStats,

  getDashboardAnalytics,
} = require("../controllers/InterviewController");

// ======================================================
// Interview
// ======================================================

// Start New Interview
router.post(
  "/start",

  authMiddleware,

  startInterview,
);

// Submit Answer
router.post(
  "/submit-answer",

  authMiddleware,

  submitAnswer,
);

// Finish Interview
router.post(
  "/finish",

  authMiddleware,

  finishInterview,
);

// ======================================================
// Dashboard
// ======================================================

// Dashboard Statistics
router.get(
  "/dashboard-stats",

  authMiddleware,

  getDashboardStats,
);

// Dashboard Analytics
router.get(
  "/dashboard-analytics",

  authMiddleware,

  getDashboardAnalytics,
);

// Interview History
router.get(
  "/history",

  authMiddleware,

  getInterviewHistory,
);

// ======================================================
// Interview Details
// ======================================================

// Get Interview By ID
router.get(
  "/:id",

  authMiddleware,

  getInterview,
);

// ======================================================

module.exports = router;

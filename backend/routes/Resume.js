const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const resumeUpload = require("../middleware/resumeUpload");

const {
  uploadResume,
  getResumeHistory,
  getResumeById,
  deleteResume,
} = require("../controllers/ResumeController");

// ================= Upload Resume =================

router.post(
  "/upload",
  authMiddleware,
  resumeUpload.single("resume"),
  uploadResume,
);

// ================= Resume History =================

router.get("/history", authMiddleware, getResumeHistory);

// ================= Get Resume =================

router.get("/:id", authMiddleware, getResumeById);

// ================= Delete Resume =================

router.delete("/:id", authMiddleware, deleteResume);

module.exports = router;

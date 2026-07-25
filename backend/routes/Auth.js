const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const authMiddleware = require("../middleware/authMiddleware");

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  profile,
  uploadProfileImage,
  updateProfile,
} = require("../controllers/AuthController");

// Public Routes
router.post("/register", register);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

// Protected Routes
router.get("/profile", authMiddleware, profile);

// Upload Profile Image
router.post(
  "/upload-profile",
  authMiddleware,
  upload.single("image"),
  uploadProfileImage,
);
// Update Profile
router.put("/update-profile", authMiddleware, updateProfile);
module.exports = router;

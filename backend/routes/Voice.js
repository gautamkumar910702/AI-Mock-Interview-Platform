const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const { evaluateVoice } = require("../controllers/VoiceController");

// ================================
// Evaluate Voice Answer
// ================================

router.post("/evaluate", authMiddleware, evaluateVoice);

module.exports = router;

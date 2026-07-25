const mongoose = require("mongoose");

// ==========================================
// Interview Video Schema
// ==========================================

const interviewVideoSchema = new mongoose.Schema(
  {
    // ======================================
    // User
    // ======================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ======================================
    // Interview
    // ======================================

    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
      index: true,
    },

    // ======================================
    // Cloudinary Video
    // ======================================

    videoUrl: {
      type: String,
      required: true,
      trim: true,
    },

    cloudinaryId: {
      type: String,
      required: true,
      trim: true,
    },

    // ======================================
    // Recording Details
    // ======================================

    duration: {
      type: Number,
      default: 0,
      min: 0,
    },

    fileSize: {
      type: Number,
      default: 0,
      min: 0,
    },

    format: {
      type: String,
      default: "webm",
      trim: true,
    },

    recordingStartedAt: {
      type: Date,
      default: Date.now,
    },

    recordingEndedAt: {
      type: Date,
      default: null,
    },

    // ======================================
    // Interview Question
    // ======================================

    question: {
      type: String,
      default: "",
      trim: true,
    },

    // ======================================
    // User Answer / Transcript
    // ======================================

    answer: {
      type: String,
      default: "",
      trim: true,
    },

    // ======================================
    // AI Evaluation
    // ======================================

    aiScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    aiFeedback: {
      type: String,
      default: "",
      trim: true,
    },

    aiStrengths: {
      type: [String],
      default: [],
    },

    aiWeaknesses: {
      type: [String],
      default: [],
    },

    betterAnswer: {
      type: String,
      default: "",
      trim: true,
    },

    confidenceScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ======================================
    // AI Evaluation Status
    // ======================================

    aiEvaluated: {
      type: Boolean,
      default: false,
    },

    // ======================================
    // Face Analysis
    // ======================================

    eyeContactScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    faceVisibilityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    smileScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    postureScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ======================================
    // Voice Analysis
    // ======================================

    voiceClarityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    speechPace: {
      type: Number,
      default: 0,
      min: 0,
    },

    fillerWords: {
      type: Number,
      default: 0,
      min: 0,
    },

    confidenceLevel: {
      type: String,
      enum: ["Poor", "Average", "Good", "Excellent"],
      default: "Average",
    },
  },

  {
    timestamps: true,
  },
);

// ==========================================
// Indexes
// ==========================================

// User interview history
interviewVideoSchema.index({
  user: 1,
  createdAt: -1,
});

// One main recording per interview
interviewVideoSchema.index(
  {
    user: 1,
    interview: 1,
  },
  {
    unique: true,
  },
);

// AI evaluated videos
interviewVideoSchema.index({
  aiEvaluated: 1,
});

// ==========================================
// Export Model
// ==========================================

module.exports = mongoose.model("InterviewVideo", interviewVideoSchema);

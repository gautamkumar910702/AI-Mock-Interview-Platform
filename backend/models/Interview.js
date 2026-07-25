const mongoose = require("mongoose");

// ==========================================
// Question Schema
// ==========================================

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,

      required: true,

      trim: true,
    },

    answer: {
      type: String,

      default: "",

      trim: true,
    },

    score: {
      type: Number,

      default: 0,

      min: 0,

      max: 10,
    },

    feedback: {
      type: String,

      default: "",

      trim: true,
    },

    timeTaken: {
      type: Number,

      default: 0,
    },

    answeredAt: {
      type: Date,

      default: null,
    },

    // ======================================
    // AI Evaluation
    // ======================================

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
    },

    confidenceScore: {
      type: Number,

      default: 0,

      min: 0,

      max: 100,
    },
  },

  {
    _id: true,
  },
);
// ==========================================
// Interview Schema
// ==========================================

const interviewSchema = new mongoose.Schema(
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
    // Interview Details
    // ======================================

    category: {
      type: String,

      required: true,

      trim: true,
    },

    difficulty: {
      type: String,

      enum: ["Easy", "Medium", "Hard"],

      required: true,
    },

    totalQuestions: {
      type: Number,

      required: true,

      min: 1,
    },

    // ======================================
    // Questions
    // ======================================

    questions: {
      type: [questionSchema],

      default: [],
    },

    // ======================================
    // Overall AI Result
    // ======================================

    overallScore: {
      type: Number,

      default: 0,

      min: 0,

      max: 100,
    },

    overallFeedback: {
      type: String,

      default: "",

      trim: true,
    },

    overallConfidence: {
      type: Number,

      default: 0,

      min: 0,

      max: 100,
    },

    communicationScore: {
      type: Number,

      default: 0,

      min: 0,

      max: 100,
    },

    technicalScore: {
      type: Number,

      default: 0,

      min: 0,

      max: 100,
    },

    confidenceLevel: {
      type: String,

      enum: ["Poor", "Average", "Good", "Excellent"],

      default: "Average",
    }, // ======================================
    // Interview Status
    // ======================================

    status: {
      type: String,

      enum: ["Pending", "In Progress", "Completed"],

      default: "Pending",
    },

    // ======================================
    // Recording
    // ======================================

    videoUrl: {
      type: String,

      default: "",

      trim: true,
    },

    recordingDuration: {
      type: Number,

      default: 0,
    },

    // ======================================
    // AI Evaluation Status
    // ======================================

    aiEvaluated: {
      type: Boolean,

      default: false,
    },

    // ======================================
    // Interview Time
    // ======================================

    startedAt: {
      type: Date,

      default: Date.now,
    },

    completedAt: {
      type: Date,

      default: null,
    },
  },

  {
    timestamps: true,
  },
);

// ==========================================
// Indexes
// ==========================================

interviewSchema.index({
  user: 1,

  createdAt: -1,
});

interviewSchema.index({
  status: 1,
});

// ==========================================
// Export
// ==========================================

module.exports = mongoose.model(
  "Interview",

  interviewSchema,
);

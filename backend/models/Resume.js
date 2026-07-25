const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },

    resumeUrl: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    atsScore: {
      type: Number,
      default: 0,
    },

    strengths: [
      {
        type: String,
      },
    ],

    weaknesses: [
      {
        type: String,
      },
    ],

    missingSkills: [
      {
        type: String,
      },
    ],

    suggestions: [
      {
        type: String,
      },
    ],

    summary: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Resume", resumeSchema);

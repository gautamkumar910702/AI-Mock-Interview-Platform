const mongoose = require("mongoose");

const webcamInterviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Auth",

      required: true,
    },

    videoUrl: {
      type: String,

      required: true,
    },

    publicId: {
      type: String,

      required: true,
    },

    question: {
      type: String,

      required: true,
    },

    transcript: {
      type: String,

      default: "",
    },

    aiScore: {
      type: Number,

      default: 0,
    },

    aiFeedback: {
      type: String,

      default: "",
    },
    duration: {
      type: Number,

      default: 0,
    },

    status: {
      type: String,

      enum: ["Pending", "Completed"],

      default: "Pending",
    },
  },

  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "WebcamInterview",

  webcamInterviewSchema,
);

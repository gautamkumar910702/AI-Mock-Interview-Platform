const WebcamInterview = require("../models/WebcamInterview");

// =======================================
// Upload Webcam Interview
// =======================================

const uploadWebcamInterview = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,

        message: "Video file is required",
      });
    }

    const {
      question,

      transcript,

      duration,
    } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,

        message: "Question is required",
      });
    }

    const interview = await WebcamInterview.create({
      user: req.user.id,

      videoUrl: req.file.path,

      publicId: req.file.filename,

      question,

      transcript,

      duration,
    });
    return res.status(201).json({
      success: true,

      message: "Webcam Interview Uploaded Successfully",

      interview,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,

      message: error.message || "Server Error",
    });
  }
};

// =======================================
// Get Webcam Interview History
// =======================================

const getWebcamHistory = async (req, res) => {
  try {
    const interviews = await WebcamInterview.find({
      user: req.user.id,
    })

      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,

      interviews,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,

      message: error.message || "Server Error",
    });
  }
};

module.exports = {
  uploadWebcamInterview,

  getWebcamHistory,
};

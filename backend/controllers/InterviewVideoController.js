const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const InterviewVideo = require("../models/InterviewVideo");
const Interview = require("../models/Interview");

// ======================================================
// Upload Interview Video
// ======================================================

const uploadInterviewVideo = async (req, res) => {
  try {
    console.log("\n========== INTERVIEW VIDEO UPLOAD START ==========");

    // ==================================================
    // Get User ID
    // ==================================================

    const userId = req.user?.id || req.user?._id;

    // ==================================================
    // Get Request Body
    // ==================================================

    const { interviewId, question, answer, duration } = req.body;

    // ==================================================
    // Debug Information
    // ==================================================

    console.log("User ID:", userId);

    console.log("Interview ID:", interviewId);

    console.log(
      "Video File:",
      req.file
        ? {
            originalname: req.file.originalname,

            mimetype: req.file.mimetype,

            size: req.file.size,
          }
        : null,
    );

    // ==================================================
    // Validate User
    // ==================================================

    if (!userId) {
      return res.status(401).json({
        success: false,

        message: "Unauthorized. User information not found.",
      });
    }

    // ==================================================
    // Validate Interview ID
    // ==================================================

    if (!interviewId) {
      return res.status(400).json({
        success: false,

        message: "Interview ID is required.",
      });
    }

    // ==================================================
    // Validate Video File
    // ==================================================

    if (!req.file) {
      return res.status(400).json({
        success: false,

        message: "Video file is required.",
      });
    }

    // ==================================================
    // Validate Video Buffer
    // ==================================================

    if (!req.file.buffer || req.file.buffer.length === 0) {
      return res.status(400).json({
        success: false,

        message: "Uploaded video file is empty.",
      });
    }

    // ==================================================
    // Verify Interview + Ownership
    // ==================================================

    const interview = await Interview.findOne({
      _id: interviewId,
      user: userId,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,

        message: "Interview not found or unauthorized access.",
      });
    }

    // ==================================================
    // Upload Video To Cloudinary
    // ==================================================

    console.log("Uploading video to Cloudinary...");

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "AI-Mock-Interview",

          resource_type: "video",
        },

        (error, result) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);

            reject(error);

            return;
          }

          resolve(result);
        },
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    // ==================================================
    // Validate Cloudinary Result
    // ==================================================

    if (!uploadResult || !uploadResult.secure_url || !uploadResult.public_id) {
      throw new Error("Cloudinary returned an invalid upload response.");
    }

    console.log("Cloudinary Upload Successful:");

    console.log({
      publicId: uploadResult.public_id,

      secureUrl: uploadResult.secure_url,

      format: uploadResult.format,

      bytes: uploadResult.bytes,

      duration: uploadResult.duration,
    });

    // ==================================================
    // Check Existing Interview Video
    // ==================================================

    const existingVideo = await InterviewVideo.findOne({
      user: userId,
      interview: interviewId,
    });

    // ==================================================
    // Delete Previous Cloudinary Video
    // ==================================================

    if (existingVideo && existingVideo.cloudinaryId) {
      try {
        console.log("Removing previous interview video...");

        await cloudinary.uploader.destroy(existingVideo.cloudinaryId, {
          resource_type: "video",
        });
      } catch (deleteError) {
        console.warn(
          "Previous Cloudinary video could not be deleted:",
          deleteError.message,
        );
      }
    }

    // ==================================================
    // Parse Duration
    // ==================================================

    const parsedDuration = Number(duration);

    const finalDuration =
      Number.isFinite(parsedDuration) && parsedDuration >= 0
        ? parsedDuration
        : Number(uploadResult.duration) || 0;

    // ==================================================
    // Determine Video Format
    // ==================================================

    const videoFormat =
      uploadResult.format || req.file.mimetype?.split("/")[1] || "webm";

    // ==================================================
    // Recording End Time
    // ==================================================

    const recordingEndedAt = new Date();

    const recordingStartedAt =
      finalDuration > 0
        ? new Date(recordingEndedAt.getTime() - finalDuration * 1000)
        : new Date();

    // ==================================================
    // Create / Update Interview Video
    // ==================================================

    let interviewVideo;

    if (existingVideo) {
      existingVideo.videoUrl = uploadResult.secure_url;

      existingVideo.cloudinaryId = uploadResult.public_id;

      existingVideo.question = question || "";

      existingVideo.answer = answer || "";

      existingVideo.duration = finalDuration;

      existingVideo.fileSize = uploadResult.bytes || req.file.size || 0;

      existingVideo.format = videoFormat;

      existingVideo.recordingStartedAt = recordingStartedAt;

      existingVideo.recordingEndedAt = recordingEndedAt;

      // Reset AI video evaluation
      // because this is a new recording.

      existingVideo.aiEvaluated = false;

      existingVideo.aiScore = 0;

      existingVideo.aiFeedback = "";

      existingVideo.aiStrengths = [];

      existingVideo.aiWeaknesses = [];

      existingVideo.betterAnswer = "";

      interviewVideo = await existingVideo.save();
    } else {
      interviewVideo = await InterviewVideo.create({
        user: userId,

        interview: interviewId,

        videoUrl: uploadResult.secure_url,

        cloudinaryId: uploadResult.public_id,

        question: question || "",

        answer: answer || "",

        duration: finalDuration,

        fileSize: uploadResult.bytes || req.file.size || 0,

        format: videoFormat,

        recordingStartedAt,

        recordingEndedAt,

        aiEvaluated: false,
      });
    }

    // ==================================================
    // Update Interview Video Information
    // ==================================================

    interview.videoUrl = uploadResult.secure_url;

    interview.recordingDuration = finalDuration;

    await interview.save();

    // ==================================================
    // Success Logs
    // ==================================================

    console.log("Interview Video MongoDB ID:", interviewVideo._id);

    console.log("========== INTERVIEW VIDEO UPLOAD SUCCESS ==========\n");

    // ==================================================
    // Success Response
    // ==================================================

    return res.status(201).json({
      success: true,

      message: "Interview video uploaded successfully.",

      videoUrl: interviewVideo.videoUrl,

      interviewVideo,
    });
  } catch (error) {
    console.error("\n========== INTERVIEW VIDEO UPLOAD ERROR ==========");

    console.error("Error Name:", error.name);

    console.error("Error Message:", error.message);

    console.error("Complete Error:", error);

    console.error("====================================================\n");

    return res.status(500).json({
      success: false,

      message: error.message || "Unable to upload interview video.",
    });
  }
};

// ======================================================
// Get Interview Video
// ======================================================

const getInterviewVideo = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const userId = req.user?.id || req.user?._id;

    // ==================================================
    // Validation
    // ==================================================

    if (!interviewId) {
      return res.status(400).json({
        success: false,

        message: "Interview ID is required.",
      });
    }

    // ==================================================
    // Find Interview Video
    // ==================================================

    const interviewVideo = await InterviewVideo.findOne({
      interview: interviewId,

      user: userId,
    })

      .populate(
        "interview",
        "category difficulty overallScore overallFeedback status completedAt",
      )

      .populate("user", "fullName email profileImage");

    // ==================================================
    // Video Not Found
    // ==================================================

    if (!interviewVideo) {
      return res.status(404).json({
        success: false,

        message: "Interview video not found.",
      });
    }

    // ==================================================
    // Success
    // ==================================================

    return res.status(200).json({
      success: true,

      interviewVideo,
    });
  } catch (error) {
    console.error("Get Interview Video Error:", error);

    return res.status(500).json({
      success: false,

      message: error.message || "Unable to get interview video.",
    });
  }
};

// ======================================================
// Get Interview Video History
// ======================================================

const getInterviewVideoHistory = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    // ==================================================
    // Find Videos
    // ==================================================

    const videos = await InterviewVideo.find({
      user: userId,
    })

      .populate(
        "interview",
        "category difficulty overallScore overallFeedback status completedAt",
      )

      .sort({
        createdAt: -1,
      });

    // ==================================================
    // Success
    // ==================================================

    return res.status(200).json({
      success: true,

      totalVideos: videos.length,

      videos,
    });
  } catch (error) {
    console.error("Get Interview Video History Error:", error);

    return res.status(500).json({
      success: false,

      message: error.message || "Unable to get interview video history.",
    });
  }
};

// ======================================================
// Delete Interview Video
// ======================================================

const deleteInterviewVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.user?.id || req.user?._id;

    // ==================================================
    // Find Video
    // ==================================================

    const interviewVideo = await InterviewVideo.findOne({
      _id: id,

      user: userId,
    });

    // ==================================================
    // Video Not Found
    // ==================================================

    if (!interviewVideo) {
      return res.status(404).json({
        success: false,

        message: "Interview video not found or unauthorized access.",
      });
    }

    // ==================================================
    // Delete From Cloudinary
    // ==================================================

    if (interviewVideo.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(
          interviewVideo.cloudinaryId,

          {
            resource_type: "video",
          },
        );
      } catch (cloudinaryError) {
        console.error("Cloudinary Delete Error:", cloudinaryError);
      }
    }

    // ==================================================
    // Remove Video Information From Interview
    // ==================================================

    await Interview.findOneAndUpdate(
      {
        _id: interviewVideo.interview,

        user: userId,
      },

      {
        $set: {
          videoUrl: "",

          recordingDuration: 0,
        },
      },
    );

    // ==================================================
    // Delete MongoDB Video Record
    // ==================================================

    await InterviewVideo.findByIdAndDelete(interviewVideo._id);

    // ==================================================
    // Success
    // ==================================================

    return res.status(200).json({
      success: true,

      message: "Interview video deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Interview Video Error:", error);

    return res.status(500).json({
      success: false,

      message: error.message || "Unable to delete interview video.",
    });
  }
};

// ======================================================
// Export Controllers
// ======================================================

module.exports = {
  uploadInterviewVideo,

  getInterviewVideo,

  getInterviewVideoHistory,

  deleteInterviewVideo,
};

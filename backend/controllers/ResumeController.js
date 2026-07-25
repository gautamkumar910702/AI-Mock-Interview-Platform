const Resume = require("../models/Resume");
const pdfParse = require("pdf-parse");
const fs = require("fs-extra");

const analyzeResume = require("../utils/resumeAnalyzer");

// ======================================
// Upload Resume
// ======================================

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please Upload Resume PDF",
      });
    }

    // Read Uploaded PDF

    const pdfBuffer = await fs.readFile(req.file.path);

    // Extract Text

    const pdfData = await pdfParse(pdfBuffer);

    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim() === "") {
      await fs.remove(req.file.path);

      return res.status(400).json({
        success: false,
        message: "Unable to Read Resume",
      });
    }

    // Analyze Resume using Gemini

    const analysis = await analyzeResume(resumeText);
    // Save Resume Analysis

    const resume = await Resume.create({
      user: req.user.id,

      resumeUrl: req.file.path,

      fileName: req.file.originalname,

      atsScore: analysis.atsScore,

      strengths: analysis.strengths,

      weaknesses: analysis.weaknesses,

      missingSkills: analysis.missingSkills,

      suggestions: analysis.suggestions,

      summary: analysis.summary,
    });

    // Delete Local File (Cloudinary use karoge to baad me remove kar denge)

    await fs.remove(req.file.path);

    return res.status(201).json({
      success: true,

      message: "Resume Analyzed Successfully",

      resume,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
// ======================================
// Get Resume History
// ======================================

const getResumeHistory = async (req, res) => {
  try {
    const resumes = await Resume.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,

      resumes,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ======================================
// Get Resume By ID
// ======================================

const getResumeById = async (req, res) => {
  try {
    const { id } = req.params;

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        success: false,

        message: "Resume Not Found",
      });
    }

    if (resume.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,

        message: "Unauthorized Access",
      });
    }

    return res.status(200).json({
      success: true,

      resume,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ======================================
// Delete Resume
// ======================================

const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        success: false,

        message: "Resume Not Found",
      });
    }

    if (resume.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,

        message: "Unauthorized Access",
      });
    }

    await Resume.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,

      message: "Resume Deleted Successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
// ======================================
// Export
// ======================================

module.exports = {
  uploadResume,

  getResumeHistory,

  getResumeById,

  deleteResume,
};

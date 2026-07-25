import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

import { toast } from "react-toastify";

import {
  FaFilePdf,
  FaCloudUploadAlt,
  FaArrowLeft,
} from "react-icons/fa";

import "./ResumeAnalyzer.css";

function ResumeAnalyzer() {

  const navigate = useNavigate();

  const [resume, setResume] = useState(null);

  const [loading, setLoading] = useState(false);
    // ==========================
  // Select Resume
  // ==========================

  const handleFileChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    if (file.type !== "application/pdf") {

      toast.error("Only PDF files are allowed.");

      return;

    }

    setResume(file);

  };
    // ==========================
  // Upload Resume
  // ==========================

  const handleUpload = async () => {

    if (!resume) {

      toast.error("Please Select Resume");

      return;

    }

    try {

      setLoading(true);

      const formData = new FormData();

      formData.append("resume", resume);

      const token = localStorage.getItem("token");
            const response = await api.post(
        "/resume/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(response.data.message);

      navigate(
        `/resume-result/${response.data.resume._id}`
      );

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Resume Analysis Failed"
      );

    } finally {

      setLoading(false);

    }

  };
    return (
    <div className="resume-page">

      <div className="resume-card">

        <h1>🤖 AI Resume Analyzer</h1>

        <p>
          Upload your Resume and get an AI-powered ATS Score,
          strengths, weaknesses and improvement suggestions.
        </p>

        {/* ================= Resume Upload ================= */}

        <div className="upload-box">

          <FaCloudUploadAlt className="upload-icon" />

          <h3>Upload Resume (PDF)</h3>

          <p>
            Maximum File Size : 5 MB
          </p>

          <input
            type="file"
            accept=".pdf"
            id="resume"
            hidden
            onChange={handleFileChange}
          />

          <label
            htmlFor="resume"
            className="choose-btn"
          >
            <FaFilePdf />
            Choose Resume
          </label>

          {resume && (

            <div className="selected-file">

              <FaFilePdf className="pdf-icon" />

              <span>{resume.name}</span>

            </div>

          )}

        </div>

        {/* ================= Buttons ================= */}

        <div className="resume-buttons">

          <button
            className="analyze-btn"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading
              ? "Analyzing Resume..."
              : "Analyze Resume"}
          </button>

          <button
            className="back-btn"
            onClick={() => navigate("/dashboard")}
          >
            <FaArrowLeft />
            Back to Dashboard
          </button>

        </div>

      </div>

    </div>
  );
  }

export default ResumeAnalyzer;
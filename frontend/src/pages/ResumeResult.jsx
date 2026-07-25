import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";

import { toast } from "react-toastify";

import {
  FaArrowLeft,
  FaDownload,
  FaCheckCircle,
  FaTimesCircle,
  FaTools,
  FaRobot,
} from "react-icons/fa";

import "./ResumeResult.css";

function ResumeResult() {

  const navigate = useNavigate();

  const { id } = useParams();

  const [loading, setLoading] = useState(true);

  const [resume, setResume] = useState(null);

  // ===========================
  // Fetch Resume
  // ===========================

  async function fetchResume() {

    try {

      const token = localStorage.getItem("token");
            const response = await api.get(
        `/resume/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResume(response.data.resume);

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Unable to Load Resume Report"
      );

      navigate("/resume-history");

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    const task = setTimeout(fetchResume, 0);

    return () => clearTimeout(task);

  }, []);

  // ===========================
  // Loading
  // ===========================

  if (loading) {

    return (
      <div className="resume-loading">
        <h2>Analyzing Resume...</h2>
      </div>
    );

  }

  if (!resume) {

    return null;

  }  return (

    <div className="resume-result-page">

      <div className="resume-result-card">

        {/* ================= Header ================= */}

        <div className="result-header">

          <FaRobot className="robot-icon" />

          <h1>AI Resume Analysis Report</h1>

          <p>
            Here is your AI generated ATS analysis and
            personalized feedback.
          </p>

        </div>

        {/* ================= ATS Score ================= */}

        <div className="score-card">

          <div className="score-circle">

            <h2>{resume.atsScore}%</h2>

          </div>

          <div className="score-details">

            <h2>ATS Score</h2>

            <p>

              <strong>Resume :</strong>{" "}

              {resume.fileName}

            </p>

            <p>

              <strong>Summary :</strong>{" "}

              {resume.summary}

            </p>

          </div>

        </div>

        {/* ================= Strengths ================= */}

        <div className="result-section">

          <h2>

            <FaCheckCircle />

            {" "}Strengths

          </h2>

          <ul>

            {resume.strengths.map((item, index) => (

              <li key={index}>

                {item}

              </li>

            ))}

          </ul>

        </div>
                {/* ================= Weaknesses ================= */}

        <div className="result-section">

          <h2>

            <FaTimesCircle />

            {" "}Weaknesses

          </h2>

          <ul>

            {resume.weaknesses.map((item, index) => (

              <li key={index}>

                {item}

              </li>

            ))}

          </ul>

        </div>

        {/* ================= Missing Skills ================= */}

        <div className="result-section">

          <h2>

            <FaTools />

            {" "}Missing Skills

          </h2>

          <ul>

            {resume.missingSkills.map((item, index) => (

              <li key={index}>

                {item}

              </li>

            ))}

          </ul>

        </div>

        {/* ================= Suggestions ================= */}

        <div className="result-section">

          <h2>

            💡 Suggestions

          </h2>

          <ul>

            {resume.suggestions.map((item, index) => (

              <li key={index}>

                {item}

              </li>

            ))}

          </ul>

        </div>
                {/* ================= Buttons ================= */}

        <div className="result-buttons">

          <button
            className="download-btn"
            onClick={() => window.print()}
          >
            <FaDownload />
            Download Report
          </button>

          <button
            className="back-btn"
            onClick={() => navigate("/resume-history")}
          >
            <FaArrowLeft />
            Back to History
          </button>

        </div>

      </div>

    </div>

  );

}

export default ResumeResult;
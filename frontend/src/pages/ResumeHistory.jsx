import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../services/api";

import { toast } from "react-toastify";

import {
  FaFilePdf,
  FaTrash,
  FaEye,
  FaArrowLeft,
  FaCalendarAlt,
} from "react-icons/fa";

import "./ResumeHistory.css";

function ResumeHistory() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [resumes, setResumes] = useState([]);

  // Fetch Resume History
  // ===========================

  async function fetchHistory() {

    try {

      const token = localStorage.getItem("token");

      const response = await api.get(
        "/resume/history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResumes(response.data.resumes);

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Unable to Load Resume History"
      );

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    const task = setTimeout(fetchHistory, 0);

    return () => clearTimeout(task);

  }, []);

    // ===========================
  // Delete Resume
  // ===========================

  const handleDelete = async (id) => {

    if (!window.confirm("Delete this resume?")) {

      return;

    }

    try {

      const token = localStorage.getItem("token");

      const response = await api.delete(
        `/resume/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message);

      fetchHistory();

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Delete Failed"
      );

    }

  };
    // ===========================
  // Loading
  // ===========================

  if (loading) {

    return (

      <div className="resume-history-loading">

        <h2>Loading Resume History...</h2>

      </div>

    );

  }

  return (

    <div className="resume-history-page">

      <div className="resume-history-card">

        <div className="history-header">

          <h1>📄 Resume History</h1>

          <p>
            View all your AI analyzed resumes.
          </p>

        </div>

        {

          resumes.length === 0 ? (

            <div className="empty-history">

              <FaFilePdf className="empty-icon" />

              <h2>No Resume Found</h2>

              <p>
                Analyze your first resume to see it here.
              </p>

            </div>

          ) : (

            <div className="resume-list">

              {

                resumes.map((resume) => (

                  <div
                    className="resume-item"
                    key={resume._id}
                  >

                    <div className="resume-info">

                      <FaFilePdf className="resume-icon" />

                      <div>

                        <h3>

                          {resume.fileName}

                        </h3>

                        <p>

                          ATS Score :
                          {" "}
                          <strong>

                            {resume.atsScore}%

                          </strong>

                        </p>

                        <p>

                          <FaCalendarAlt />

                          {" "}

                          {

                            new Date(
                              resume.createdAt
                            ).toLocaleDateString()

                          }

                        </p>

                      </div>

                    </div>

                    <div className="resume-actions">

                      <button
                        className="view-btn"
                        onClick={() =>
                          navigate(
                            `/resume-result/${resume._id}`
                          )
                        }
                      >

                        <FaEye />

                        View

                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(resume._id)
                        }
                      >

                        <FaTrash />

                        Delete

                      </button>

                    </div>

                  </div>

                ))

              }

            </div>

          )

        }
                {/* ================= Back Button ================= */}

        <div className="history-footer">

          <button
            className="back-dashboard-btn"
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

export default ResumeHistory;
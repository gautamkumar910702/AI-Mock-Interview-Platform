import { useEffect, useState } from "react";

import {

  useNavigate,

  useLocation,

  useParams,

} from "react-router-dom";

import api from "../services/api";

import {

  getInterviewVideo,

} from "../services/interviewVideoApi";

import PDFButton from "../components/PDFButton";

import { toast } from "react-toastify";

import {

  FaArrowLeft,

  FaRedo,

  FaDownload,

  FaPlayCircle,

  FaClipboardList,

  FaStar,

  FaChartLine,

  FaClock,

  FaBullseye,

} from "react-icons/fa";

import "./Result.css";

function Result() {

  const navigate = useNavigate();

  const location = useLocation();

  const { id } = useParams();

  // =====================================
  // States
  // =====================================

  const [loading, setLoading] = useState(true);

  const [interview, setInterview] = useState(null);

  const [user, setUser] = useState(null);

  const [video, setVideo] = useState(null);

  const [downloading, setDownloading] = useState(false);

  const [performance, setPerformance] = useState({

    confidence: 0,

    communication: 0,

    technical: 0,

    completion: 0,

  });

  // Load Result
  // =====================================

  async function loadResult() {

    try {

      const token = localStorage.getItem("token");

      // ===============================
      // Interview Details
      // ===============================

      const interviewResponse = await api.get(

        `/interview/${id}`,

        {

          headers: {

            Authorization: `Bearer ${token}`,

          },

        }

      );

      const interviewData =

        interviewResponse.data.interview;

      setInterview(interviewData);

      setUser(interviewResponse.data.user);

      // ===============================
      // Interview Video
      // ===============================

      const savedVideoUrl =

        location.state?.videoUrl ||

        location.state?.interview?.videoUrl ||

        interviewData.videoUrl;

      if (savedVideoUrl) {

        setVideo({

          videoUrl: savedVideoUrl,

        });

      }

      if (!savedVideoUrl) {

      try {

        const videoResponse =

          await getInterviewVideo(id);

        setVideo(

          videoResponse.interviewVideo

        );

      }

      catch (error) {

        if (error.response?.status !== 404) {

          console.error(

            "Unable to load interview video:",

            error.response?.data || error.message

          );

        }

      }

      }

      // ===============================
      // Performance Overview
      // ===============================

      setPerformance({

        confidence:

          interviewData.overallScore || 0,

        communication:

          interviewData.communicationScore ||

          interviewData.overallScore ||

          0,

        technical:

          interviewData.technicalScore ||

          interviewData.overallScore ||

          0,

        completion:

          interviewData.questions?.length

            ? 100

            : 0,

      });

    }

    catch (error) {

      toast.error(

        error.response?.data?.message ||

        "Unable to Load Interview Result"

      );

      navigate("/dashboard");

    }

    finally {

      setLoading(false);

    }

  }

  // =====================================
  // Initial Load
  // =====================================

  useEffect(() => {

    const task = setTimeout(loadResult, 0);

    return () => clearTimeout(task);

  }, []);

  // =====================================
  // Download Recording
  // =====================================

  const handleDownload = async () => {

    if (!video?.videoUrl) {

      toast.error(

        "Interview Recording Not Available"

      );

      return;

    }

    try {

      setDownloading(true);

      const response = await fetch(video.videoUrl);

      if (!response.ok) {
        throw new Error("Unable to download interview recording.");
      }

      const blob = await response.blob();

      const downloadUrl = URL.createObjectURL(blob);

      const link =

        document.createElement("a");

      link.href = downloadUrl;

      link.download =

        "InterviewRecording.webm";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(downloadUrl);

    }

    catch (error) {

      toast.error(

        error.message ||

        "Unable to download interview recording"

      );

    }

    finally {

      setDownloading(false);

    }

  };
    // =====================================
  // Loading
  // =====================================

  if (loading) {

    return (

      <div className="result-loading">

        <h2>Loading Interview Result...</h2>

      </div>

    );

  }

  if (!interview || !user) {

    return null;

  }

  return (

    <div className="result-page">

      <div className="result-container">

        {/* =====================================
            Header
        ===================================== */}

        {/* =====================================
            Overall Score
        ===================================== */}

        <div className="score-card">

          <div className="score-circle">

            <span>

              {interview.overallScore || 0}

            </span>

            <small>

              /100

            </small>

          </div>

          <div className="score-info">

            <h2>

              Overall Performance

            </h2>

            <p>

              Category :

              <strong>

                {" "}

                {interview.category}

              </strong>

            </p>

            <p>

              Difficulty :

              <strong>

                {" "}

                {interview.difficulty}

              </strong>

            </p>

          </div>

        </div>

        {/* =====================================
            Performance Cards
        ===================================== */}

        <div className="performance-grid">

          <div className="performance-card">

            <FaChartLine />

            <h3>

              Confidence

            </h3>

            <h2>

              {performance.confidence}%

            </h2>

          </div>

          <div className="performance-card">

            <FaBullseye />

            <h3>

              Technical

            </h3>

            <h2>

              {performance.technical}%

            </h2>

          </div>

          <div className="performance-card">

            <FaStar />

            <h3>

              Communication

            </h3>

            <h2>

              {performance.communication}%

            </h2>

          </div>

          <div className="performance-card">

            <FaClock />

            <h3>

              Completion

            </h3>

            <h2>

              {performance.completion}%

            </h2>

          </div>

        </div>
        {/* =====================================
            PDF Report
        ===================================== */}

        <div className="pdf-section">

          <PDFButton

            interview={interview}

            user={user}

          />

        </div>

        {/* =====================================
            Interview Recording
        ===================================== */}

        <div className="video-card">

          <h2>

            <FaPlayCircle />

            Interview Recording

          </h2>

          {video?.videoUrl ? (

            <>

              <video

                className="result-video"

                controls

                preload="metadata"

                src={video.videoUrl}

              />

              <div className="video-actions">

                <button

                  className="download-video-btn"

                  onClick={handleDownload}

                  disabled={downloading}

                >

                  <FaDownload />

                  {downloading ? "Downloading..." : "Download Recording"}

                </button>

              </div>

            </>

          ) : (

            <p className="video-unavailable">

              No recording is available for this interview. The recording
              upload may have failed before the result page opened.

            </p>

          )}

        </div>

        {/* =====================================
            AI Overall Feedback
        ===================================== */}

        <div className="feedback-card">

          <h2>

            <FaStar />

            AI Overall Feedback

          </h2>

          <p>

            {

              interview.overallFeedback ||

              "Excellent effort! Keep practicing consistently to improve your technical knowledge, communication skills, confidence, and interview performance."

            }

          </p>

        </div>

        {/* =====================================
            AI Strengths
        ===================================== */}

        <div className="strength-card">

          <h2>

            💪 Strengths

          </h2>

          <ul>

            <li>

              Good understanding of technical concepts.

            </li>

            <li>

              Clear communication throughout the interview.

            </li>

            <li>

              Well structured answers.

            </li>

            <li>

              Good confidence while answering.

            </li>

          </ul>

        </div>

        {/* =====================================
            AI Improvements
        ===================================== */}

        <div className="improvement-card">

          <h2>

            🚀 Suggested Improvements

          </h2>

          <ul>

            <li>

              Add more real-world examples.

            </li>

            <li>

              Reduce hesitation while speaking.

            </li>

            <li>

              Improve answer depth for technical questions.

            </li>

            <li>

              Maintain eye contact with the webcam.

            </li>

          </ul>

        </div>
                {/* =====================================
            Interview Summary
        ===================================== */}

        <div className="summary-card">

          <h2>

            Interview Summary

          </h2>

          <div className="summary-grid">

            <div className="summary-item">

              <h4>Category</h4>

              <p>{interview.category}</p>

            </div>

            <div className="summary-item">

              <h4>Difficulty</h4>

              <p>{interview.difficulty}</p>

            </div>

            <div className="summary-item">

              <h4>Total Questions</h4>

              <p>{interview.questions.length}</p>

            </div>

            <div className="summary-item">

              <h4>Overall Score</h4>

              <p>{interview.overallScore}/100</p>

            </div>

          </div>

        </div>

        {/* =====================================
            Question Analysis
        ===================================== */}

        <div className="questions-section">

          <h2>

            <FaClipboardList />

            Question Analysis

          </h2>

          {

            interview.questions.map((item, index) => (

              <div

                key={item._id || index}

                className="question-result-card"

              >

                <div className="question-header">

                  <h3>

                    Question {index + 1}

                  </h3>

                  <span className="question-score">

                    ⭐ {item.score || 0}/10

                  </span>

                </div>

                <div className="question-body">

                  <p>

                    <strong>Question</strong>

                  </p>

                  <p>

                    {item.question}

                  </p>

                  <br />

                  <p>

                    <strong>Your Answer</strong>

                  </p>

                  <p>

                    {

                      item.answer ||

                      "No Answer Submitted"

                    }

                  </p>

                  <br />

                  <p>

                    <strong>AI Feedback</strong>

                  </p>

                  <p>

                    {

                      item.feedback ||

                      "No feedback available."

                    }

                  </p>

                  <br />

                  <p>

                    <strong>Time Taken</strong>

                  </p>

                  <p>

                    {

                      item.timeTaken || 0

                    } Seconds

                  </p>

                </div>

              </div>

            ))

          }

        </div>

        {/* =====================================
            Bottom Buttons
        ===================================== */}

        <div className="result-buttons">

          <button

            className="dashboard-btn"

            onClick={() =>

              navigate("/dashboard")

            }

          >

            <FaArrowLeft />

            Back to Dashboard

          </button>

          <button

            className="retake-btn"

            onClick={() =>

              navigate("/interview")

            }

          >

            <FaRedo />

            Start New Interview

          </button>

        </div>

      </div>

    </div>

  );

}

export default Result;
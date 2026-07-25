import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import { getWebcamHistory } from "../services/webcamApi";

import {
  FaVideo,
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";

import "./WebcamHistory.css";

function WebcamHistory() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [videos, setVideos] = useState([]);

  // =============================
  // Fetch Webcam History
  // =============================

  async function fetchHistory() {

    try {

      const response =
        await getWebcamHistory();

      setVideos(response.interviews);

    } catch (error) {

      toast.error(

        error.response?.data?.message ||

        "Unable to Load History"

      );

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    const task = setTimeout(fetchHistory, 0);

    return () => clearTimeout(task);

  }, []);
    // =============================
  // Loading
  // =============================

  if (loading) {

    return (

      <div className="webcam-history-loading">

        <h2>Loading Webcam History...</h2>

      </div>

    );

  }

  return (

    <div className="webcam-history-page">

      <div className="webcam-history-card">

        {/* ================= Header ================= */}

        <div className="history-header">

          <h1>

            <FaVideo />

            Webcam Interview History

          </h1>

          <button
            className="history-back-btn"
            onClick={() => navigate("/dashboard")}
          >

            <FaArrowLeft />

            Back

          </button>

        </div>

        {

          videos.length === 0 ? (

            <div className="empty-history">

              <h2>No Webcam Interviews Found</h2>

              <p>

                Record your first webcam interview to see it here.

              </p>

            </div>

          ) : (

            <div className="history-grid">

              {

                videos.map((video) => (

                  <div
                    className="history-item"
                    key={video._id}
                  >

                    {/* ================= Video ================= */}

                    <video
                      controls
                      src={video.videoUrl}
                      className="history-video"
                    />

                    {/* ================= Details ================= */}

                    <div className="history-info">

                      <h3>

                        {video.question}

                      </h3>

                      <p>

                        <FaClock />

                        Duration : {video.duration} sec

                      </p>

                      <p>

                        <FaCalendarAlt />

                        {

                          new Date(

                            video.createdAt

                          ).toLocaleDateString()

                        }

                      </p>

                      <span
                        className={`status ${video.status.toLowerCase()}`}
                      >

                        {video.status}

                      </span>

                    </div>

                  </div>

                ))

              }

            </div>

          )

        }

      </div>

    </div>

  );

}

export default WebcamHistory;
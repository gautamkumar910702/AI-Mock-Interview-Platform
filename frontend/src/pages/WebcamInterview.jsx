import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Webcam from "react-webcam";

import { toast } from "react-toastify";

import { uploadWebcamInterview } from "../services/webcamApi";

import {
  FaVideo,
  FaStop,
  FaArrowLeft,
  FaUpload,
} from "react-icons/fa";

import "./WebcamInterview.css";

function WebcamInterview() {

  const navigate = useNavigate();

  const webcamRef = useRef(null);

  const mediaRecorderRef = useRef(null);

  // ===========================
  // States
  // ===========================

  const [capturing, setCapturing] = useState(false);

  const [recordedChunks, setRecordedChunks] = useState([]);

  const [videoURL, setVideoURL] = useState(null);

  const [timer, setTimer] = useState(0);

  const [uploading, setUploading] = useState(false);

  const question =
    "Explain the difference between SQL and NoSQL databases.";

  // ===========================
  // Recording Timer
  // ===========================

  useEffect(() => {

    let interval;

    if (capturing) {

      interval = setInterval(() => {

        setTimer((prev) => prev + 1);

      }, 1000);

    }

    return () => clearInterval(interval);

  }, [capturing]);

  // ===========================
  // Start Recording
  // ===========================

  const startRecording = () => {

    if (!webcamRef.current?.stream) {

      toast.error("Camera is not ready.");

      return;

    }

    const stream = webcamRef.current.stream;

    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorderRef.current = mediaRecorder;

    setRecordedChunks([]);

    setVideoURL(null);

    setTimer(0);

    mediaRecorder.ondataavailable = (event) => {

      if (event.data && event.data.size > 0) {

        setRecordedChunks((prev) => [

          ...prev,

          event.data,

        ]);

      }

    };

    mediaRecorder.onstop = () => {

      setCapturing(false);

    };

    mediaRecorder.start();

    setCapturing(true);

  };

  // ===========================
  // Stop Recording
  // ===========================

  const stopRecording = () => {

    if (mediaRecorderRef.current) {

      mediaRecorderRef.current.stop();

    }

  };

  // ===========================
  // Generate Preview
  // ===========================

  const handlePreview = () => {

    if (recordedChunks.length === 0) {

      toast.error("No recording found.");

      return;

    }

    const blob = new Blob(recordedChunks, {

      type: "video/webm",

    });

    const url = URL.createObjectURL(blob);

    setVideoURL(url);

  };

  // ===========================
  // Upload Video
  // ===========================

  const handleUpload = async () => {

    if (recordedChunks.length === 0) {

      toast.error("Please record a video first.");

      return;

    }

    try {

      setUploading(true);

      const blob = new Blob(recordedChunks, {

        type: "video/webm",

      });

      const formData = new FormData();

      formData.append(

        "video",

        blob,

        "interview.webm"

      );

      formData.append(

        "question",

        question

      );

      formData.append(

        "transcript",

        ""

      );

      formData.append(

        "duration",

        timer

      );

      const response =

        await uploadWebcamInterview(

          formData

        );

      toast.success(response.message);

    } catch (error) {

      toast.error(

        error.response?.data?.message ||

        "Video Upload Failed"

      );

    } finally {

      setUploading(false);

    }

  };

  // ===========================
  // Timer Format
  // ===========================

  const formattedTime = `${String(
    Math.floor(timer / 60)
  ).padStart(2, "0")}:${String(
    timer % 60
  ).padStart(2, "0")}`;

  return (

    <div className="webcam-page">

      <div className="webcam-card">

        <h1>📹 AI Webcam Interview</h1>

        <p>
          Record your interview using your webcam.
        </p>

        <div className="camera-container">

          <Webcam
            ref={webcamRef}
            audio
            screenshotFormat="image/jpeg"
            className="camera-preview"
          />

        </div>

        <div className="recording-timer">

          <h3>Recording Time</h3>

          <span>{formattedTime}</span>

        </div>        {/* ================= Controls ================= */}

        <div className="recording-controls">

          {

            !capturing ? (

              <button
                className="start-btn"
                onClick={startRecording}
              >

                <FaVideo />

                Start Recording

              </button>

            ) : (

              <button
                className="stop-btn"
                onClick={stopRecording}
              >

                <FaStop />

                Stop Recording

              </button>

            )

          }

          <button
            className="preview-btn"
            onClick={handlePreview}
            disabled={
              recordedChunks.length === 0
            }
          >

            ▶ Preview Video

          </button>

          <button
            className="upload-btn"
            onClick={handleUpload}
            disabled={
              uploading ||
              recordedChunks.length === 0
            }
          >

            <FaUpload />

            {

              uploading
                ? "Uploading..."
                : "Upload Video"

            }

          </button>

          <button
            className="back-btn"
            onClick={() => navigate("/dashboard")}
          >

            <FaArrowLeft />

            Back

          </button>

        </div>

        {/* ================= Recording Status ================= */}

        <div className="recording-status">

          {

            capturing ? (

              <p className="recording-active">

                🔴 Recording in Progress...

              </p>

            ) : (

              <p className="recording-inactive">

                ⚪ Recording Stopped

              </p>

            )

          }

        </div>

        {/* ================= Video Preview ================= */}

        {

          videoURL && (

            <div className="video-preview-section">

              <h2>

                🎥 Recorded Interview

              </h2>

              <video
                controls
                src={videoURL}
                className="recorded-video"
              />

              <div className="video-actions">

                <a
                  href={videoURL}
                  download="InterviewRecording.webm"
                  className="download-btn"
                >

                  ⬇ Download Recording

                </a>

              </div>

            </div>

          )

        }

      </div>

    </div>

  );

}

export default WebcamInterview;
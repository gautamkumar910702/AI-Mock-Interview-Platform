import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import { evaluateVoice } from "../services/voiceApi";

import {
  FaMicrophone,
  FaStop,
  FaArrowLeft,
} from "react-icons/fa";

import "./VoiceInterview.css";

function VoiceInterview() {

  const navigate = useNavigate();

  // ===========================
  // States
  // ===========================

  const [isListening, setIsListening] = useState(false);

  const [transcript, setTranscript] = useState("");

  const [time, setTime] = useState(0);

  const [recognition, setRecognition] = useState(null);

  const [loading, setLoading] = useState(false);

  const [evaluation, setEvaluation] = useState(null);

  const question =
    "Explain the difference between SQL and NoSQL databases.";

  // ===========================
  // Initialize Speech Recognition
  // ===========================

  useEffect(() => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

      toast.error(
        "Speech Recognition is not supported in this browser."
      );

      return;

    }

    const recognitionInstance =
      new SpeechRecognition();

    recognitionInstance.continuous = true;

    recognitionInstance.interimResults = true;

    recognitionInstance.lang = "en-US";

    recognitionInstance.onresult = (event) => {

      let finalTranscript = "";

      for (
        let i = 0;
        i < event.results.length;
        i++
      ) {

        finalTranscript +=
          event.results[i][0].transcript + " ";

      }

      setTranscript(finalTranscript);

    };

    recognitionInstance.onerror = (event) => {

      console.log(event.error);

      toast.error(event.error);

      setIsListening(false);

    };

    recognitionInstance.onend = () => {

      setIsListening(false);

    };

    const task = setTimeout(() => {
      setRecognition(recognitionInstance);
    }, 0);

    return () => clearTimeout(task);

  }, []);

  // ===========================
  // Timer
  // ===========================

  useEffect(() => {

    let interval;

    if (isListening) {

      interval = setInterval(() => {

        setTime((prev) => prev + 1);

      }, 1000);

    }

    return () => clearInterval(interval);

  }, [isListening]);

  // ===========================
  // Start Recording
  // ===========================

  const startListening = () => {

    if (!recognition) {

      return;

    }

    setTranscript("");

    setEvaluation(null);

    setTime(0);

    setIsListening(true);

    recognition.start();

  };

  // ===========================
  // Stop Recording
  // ===========================

  const stopListening = () => {

    if (!recognition) {

      return;

    }

    recognition.stop();

    setIsListening(false);

  };

  // ===========================
  // Evaluate Answer
  // ===========================

  const handleEvaluation = async () => {

    if (!transcript.trim()) {

      toast.error(
        "Please record your answer first."
      );

      return;

    }

    try {

      setLoading(true);

      const response =
        await evaluateVoice(
          question,
          transcript
        );

      setEvaluation(
        response.evaluation
      );

      toast.success(
        "Voice Evaluated Successfully"
      );

    } catch (error) {

      toast.error(

        error.response?.data?.message ||

        "Evaluation Failed"

      );

    } finally {

      setLoading(false);

    }

  };

  // ===========================
  // Timer Format
  // ===========================

  const formattedTime = `${String(
    Math.floor(time / 60)
  ).padStart(2, "0")}:${String(
    time % 60
  ).padStart(2, "0")}`;

  return (

    <div className="voice-page">

      <div className="voice-card">

        <h1>🎙 AI Voice Interview</h1>

        <p>
          Answer the interview question using your voice.
        </p>

        <div className="question-box">

          <h2>Question</h2>

          <p>{question}</p>

        </div>

        <div className="timer-box">

          <h3>Recording Time</h3>

          <span>{formattedTime}</span>

        </div>

        <div className="mic-status">

          {

            isListening ? (

              <p className="listening">

                🔴 Listening...

              </p>

            ) : (

              <p className="stopped">

                ⚪ Microphone Stopped

              </p>

            )

          }

        </div>

        <div className="transcript-box">

          <h3>Live Transcript</h3>

          <textarea
            value={transcript}
            readOnly
            placeholder="Your speech will appear here..."
          />

        </div>
                {/* ================= Controls ================= */}

        <div className="voice-controls">

          {

            !isListening ? (

              <button
                className="start-record-btn"
                onClick={startListening}
              >

                <FaMicrophone />

                Start Recording

              </button>

            ) : (

              <button
                className="stop-record-btn"
                onClick={stopListening}
              >

                <FaStop />

                Stop Recording

              </button>

            )

          }

          <button
            className="evaluate-btn"
            onClick={handleEvaluation}
            disabled={loading}
          >

            {

              loading
                ? "Evaluating..."
                : "🤖 Evaluate Answer"

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

        {/* ================= AI Evaluation ================= */}

        {

          evaluation && (

            <div className="evaluation-card">

              <h2>

                🤖 AI Evaluation Report

              </h2>

              <div className="score-box">

                <h3>

                  Overall Score

                </h3>

                <span>

                  {evaluation.score}%

                </span>

              </div>

              <div className="feedback-box">

                <h3>

                  Feedback

                </h3>

                <p>

                  {evaluation.feedback}

                </p>

              </div>

              <div className="strength-box">

                <h3>

                  ✅ Strengths

                </h3>

                <ul>

                  {

                    evaluation.strengths.map(

                      (item, index) => (

                        <li key={index}>

                          {item}

                        </li>

                      )

                    )

                  }

                </ul>

              </div>

              <div className="improvement-box">

                <h3>

                  📈 Improvements

                </h3>

                <ul>

                  {

                    evaluation.improvements.map(

                      (item, index) => (

                        <li key={index}>

                          {item}

                        </li>

                      )

                    )

                  }

                </ul>

              </div>

            </div>

          )

        }

      </div>

    </div>

  );

}

export default VoiceInterview;
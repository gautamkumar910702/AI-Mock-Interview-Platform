import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

import { toast } from "react-toastify";

import {
  FaMicrophone,
  FaCode,
  FaLayerGroup,
  FaClock,
  FaPlay,
} from "react-icons/fa";

import "./Interview.css";

function Interview() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({

    category: "Java",

    difficulty: "Easy",

    totalQuestions: 5,

  });

  const handleChange = (e) => {

    setFormData((prev) => ({

      ...prev,

      [e.target.name]: e.target.value,

    }));

  };

  const handleStartInterview = async () => {

    try {

      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await api.post(

        "/interview/start",

        formData,

        {

          headers: {

            Authorization: `Bearer ${token}`,

          },

        }

      );

      toast.success(response.data.message);

      navigate(

        `/interview-room/${response.data.interviewId}`

      );

    } catch (error) {

      toast.error(

        error.response?.data?.message ||

        "Failed to Start Interview"

      );

    } finally {

      setLoading(false);

    }

  };
    return (

    <div className="interview-page">

      <div className="interview-card">

        <div className="title">

          <FaMicrophone className="title-icon" />

          <h2>AI Mock Interview</h2>

        </div>

        <p className="subtitle">

          Configure your interview and let AI assess your
          technical skills.

        </p>

        {/* Category */}

        <div className="input-group">

          <label>

            <FaCode />

            Technology

          </label>

          <select

            name="category"

            value={formData.category}

            onChange={handleChange}

          >

            <option value="Java">Java</option>

            <option value="React">React</option>

            <option value="Node JS">Node JS</option>

            <option value="Express JS">Express JS</option>

            <option value="MongoDB">MongoDB</option>

            <option value="JavaScript">JavaScript</option>

            <option value="Python">Python</option>

            <option value="C++">C++</option>

            <option value="SQL">SQL</option>

            <option value="DSA">DSA</option>

            <option value="HR Interview">HR Interview</option>

          </select>

        </div>

        {/* Difficulty */}

        <div className="input-group">

          <label>

            <FaLayerGroup />

            Difficulty

          </label>

          <select

            name="difficulty"

            value={formData.difficulty}

            onChange={handleChange}

          >

            <option value="Easy">

              Easy

            </option>

            <option value="Medium">

              Medium

            </option>

            <option value="Hard">

              Hard

            </option>

          </select>

        </div>

        {/* Questions */}

        <div className="input-group">

          <label>

            <FaClock />

            Total Questions

          </label>

          <select

            name="totalQuestions"

            value={formData.totalQuestions}

            onChange={handleChange}

          >

            <option value={5}>5</option>

            <option value={10}>10</option>

            <option value={15}>15</option>

            <option value={20}>20</option>

          </select>

        </div>

        {/* Summary */}

        <div className="interview-summary">

          <div className="summary-box">

            <h4>Technology</h4>

            <p>{formData.category}</p>

          </div>

          <div className="summary-box">

            <h4>Difficulty</h4>

            <p>{formData.difficulty}</p>

          </div>

          <div className="summary-box">

            <h4>Questions</h4>

            <p>{formData.totalQuestions}</p>

          </div>

          <div className="summary-box">

            <h4>Estimated Time</h4>

            <p>

              {formData.totalQuestions * 2} Minutes

            </p>

          </div>

        </div>

        <button

          className="start-interview-btn"

          onClick={handleStartInterview}

          disabled={loading}

        >

          <FaPlay />

          {

            loading

              ? "Generating AI Questions..."

              : "Start AI Interview"

          }

        </button>

      </div>

    </div>

  );

}

export default Interview;
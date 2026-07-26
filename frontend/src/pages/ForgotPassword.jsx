import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import {
  FaEnvelope,
  FaPaperPlane,
  FaArrowLeft,
} from "react-icons/fa";

import api from "../services/api";

import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/forgot-password",
        {
          email,
        }
      );

      toast.success(response.data.message);
      setEmail("");

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="forgot-page">
      <div className="forgot-card">

        <h1>Forgot Password</h1>

        <p>
          Enter your registered email address and we'll send you a
          password reset link.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="input-box">
            <FaEnvelope className="icon" />

            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            className="forgot-btn"
            disabled={loading}
          >
            <FaPaperPlane />

            {loading
              ? "Sending..."
              : "Send Reset Link"}
          </button>

        </form>

        <Link className="back-login" to="/login">
          <FaArrowLeft />
          Back to Login
        </Link>

      </div>
    </section>
  );
};

export default ForgotPassword;
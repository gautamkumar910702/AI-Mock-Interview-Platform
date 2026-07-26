import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaArrowLeft,
} from "react-icons/fa";

import api from "../services/api";

import "./ResetPassword.css";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password || !formData.confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        `/auth/reset-password/${token}`,
        formData
      );

      toast.success(response.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="reset-page">
      <div className="reset-card">

        <h1>Reset Password</h1>

        <p>
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="input-box">
            <FaLock className="icon" />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <span
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>

          </div>

          <div className="input-box">
            <FaKey className="icon" />

            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <span
              className="password-toggle"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              {showConfirmPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </span>

          </div>

          <button
            className="reset-btn"
            disabled={loading}
          >
            {loading
              ? "Updating..."
              : "Update Password"}
          </button>

        </form>

        <Link
          className="back-login"
          to="/login"
        >
          <FaArrowLeft />
          Back to Login
        </Link>

      </div>
    </section>
  );
}

export default ResetPassword;
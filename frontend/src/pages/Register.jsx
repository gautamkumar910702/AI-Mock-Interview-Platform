import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserPlus,
} from "react-icons/fa";
import api from "../services/api";

import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Handle Input Change
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle Register
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend Validation
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("All Fields are Required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
         "/auth/register",
        formData
      );

      toast.success(response.data.message);

      // Clear Form
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // Redirect to Login
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form
        className="register-card"
        onSubmit={handleSubmit}
      >
        <h2>Create Account</h2>

        {/* Full Name */}

        <div className="input-box">
          <FaUser className="icon" />

          <input
            type="text"
            name="fullName"
            placeholder="Enter Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email */}

        <div className="input-box">
          <FaEnvelope className="icon" />

          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password */}

        <div className="input-box">
          <FaLock className="icon" />

          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <span
            onClick={() =>
              setShowPassword(!showPassword)
            }
          >
            {showPassword ? (
              <FaEyeSlash />
            ) : (
              <FaEye />
            )}
          </span>
        </div>

        {/* Confirm Password */}

        <div className="input-box">
          <FaLock className="icon" />

          <input
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <span
            onClick={() =>
              setShowConfirmPassword(
                !showConfirmPassword
              )
            }
          >
            {showConfirmPassword ? (
              <FaEyeSlash />
            ) : (
              <FaEye />
            )}
          </span>
        </div>

        {/* Button */}

        <button
          type="submit"
          className="register-btn"
          disabled={loading}
        >
          <FaUserPlus />

          {loading
            ? "Registering..."
            : "Register"}
        </button>

        <p>
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
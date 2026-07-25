import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
//import axios from "axios";
import { toast } from "react-toastify";
import api from "./services/api";

import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
} from "react-icons/fa";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await api.post(
         "/auth/login",
        formData
      );

      localStorage.setItem("token", response.data.token);

      // localStorage.setItem(
      //   "user",
      //   JSON.stringify(response.data.user)
      // );

      toast.success(response.data.message);

      setFormData({
        email: "",
        password: "",
      });

      setTimeout(() => {
        // navigate("/");
        navigate("/dashboard");
        //  navigate("/profile");
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
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Welcome Back</h2>

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
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button
          type="submit"
          className="login-btn"
          disabled={loading}
        >
          <FaSignInAlt />

          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="forgot-link">
          <Link to="/forgot-password">
            Forgot Password?
          </Link>
        </div>

        <p className="register-link">
          Don't have an account?{" "}
          <Link to="/register">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
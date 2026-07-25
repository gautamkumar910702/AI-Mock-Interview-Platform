import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import { toast } from "react-toastify";

import {
  FaUserCircle,
  FaCamera,
  FaEnvelope,
  FaUser,
  FaCalendarAlt,
  FaEdit,
  FaArrowLeft,
  FaSignOutAlt,
} from "react-icons/fa";

import "./Profile.css";

function Profile() {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  async function fetchProfile() {
    try {

      const token = localStorage.getItem("token");

      const response = await api.get(
        "/auth/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data.user);

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Unable to Load Profile"
      );

    } finally {

      setLoading(false);

    }
  }

  // =============================
  // Load Profile
  // =============================

  useEffect(() => {
    const task = setTimeout(fetchProfile, 0);

    return () => clearTimeout(task);
  }, []);
    // =============================
  // Upload Image
  // =============================

  const handleImageUpload = async (e) => {
    const image = e.target.files[0];

    if (!image) return;

    try {

      setUploading(true);

      const formData = new FormData();
      formData.append("image", image);

      const token = localStorage.getItem("token");

      const response = await api.post(
        "/auth/upload-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data.user);

      toast.success(response.data.message);

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Upload Failed"
      );

    } finally {

      setUploading(false);

    }
  };

  // =============================
  // Logout
  // =============================

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("Logged Out Successfully");

    navigate("/login");

  };

  // =============================
  // Loading
  // =============================

  if (loading) {
    return (
      <div className="profile-loading">
        <h2>Loading Profile...</h2>
      </div>
    );
  }  return (
    <div className="profile-page">

      <div className="profile-card">

        {/* ================= Profile Image ================= */}

        <div className="profile-image-section">

          {
            user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="profile-image"
              />
            ) : (
              <FaUserCircle className="default-profile-icon" />
            )
          }

          <label
            htmlFor="profileImage"
            className="upload-btn"
          >
            <FaCamera />
            {uploading ? "Uploading..." : "Change Photo"}
          </label>

          <input
            type="file"
            id="profileImage"
            accept="image/*"
            hidden
            onChange={handleImageUpload}
          />

        </div>

        {/* ================= Profile Details ================= */}

        <div className="profile-details">

          <h2>My Profile</h2>

          <div className="profile-info">

            <div className="info-item">
              <FaUser className="info-icon" />
              <div>
                <span>Full Name</span>
                <h3>{user.fullName}</h3>
              </div>
            </div>

            <div className="info-item">
              <FaEnvelope className="info-icon" />
              <div>
                <span>Email Address</span>
                <h3>{user.email}</h3>
              </div>
            </div>

            <div className="info-item">
              <FaCalendarAlt className="info-icon" />
              <div>
                <span>Member Since</span>
                <h3>
                  {new Date(user.createdAt).toLocaleDateString()}
                </h3>
              </div>
            </div>

          </div>

          {/* ================= Action Buttons ================= */}

          <div className="profile-actions">

            <button
              className="edit-profile-btn"
              onClick={() => navigate("/edit-profile")}
            >
              <FaEdit />
              Edit Profile
            </button>

            <button
              className="dashboard-btn"
              onClick={() => navigate("/dashboard")}
            >
              <FaArrowLeft />
              Dashboard
            </button>

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              <FaSignOutAlt />
              Logout
            </button>

          </div>

        </div>

      </div>

    </div>
  );
  }

export default Profile;
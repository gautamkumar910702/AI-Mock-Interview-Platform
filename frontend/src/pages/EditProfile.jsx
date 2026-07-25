import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import api from "../services/api";

import {

  FaUser,

  FaEnvelope,

  FaCamera,

  FaSave,

  FaArrowLeft,

} from "react-icons/fa";

import "./EditProfile.css";

function EditProfile() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [user, setUser] = useState({

    fullName: "",

    email: "",

    profileImage: "",

  });

  const [image, setImage] = useState(null);

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

    }

    catch (error) {

      toast.error(

        error.response?.data?.message ||

        "Unable to Load Profile"

      );

      navigate("/dashboard");

    }

    finally {

      setLoading(false);

    }

  }

  // ==========================
  // Load Profile
  // ==========================

  useEffect(() => {

    const task = setTimeout(fetchProfile, 0);

    return () => clearTimeout(task);

  }, []);

  // ==========================
// Handle Input Change
// ==========================

const handleChange = (e) => {
  setUser({
    ...user,
    [e.target.name]: e.target.value,
  });
};

// ==========================
// Handle Image Change
// ==========================

const handleImageChange = (e) => {
  setImage(e.target.files[0]);
};

// ==========================
// Save Profile
// ==========================

const handleSave = async () => {
  try {
    setSaving(true);

    const token = localStorage.getItem("token");

    // Update Name & Email
    const response = await api.put(
      "/auth/update-profile",
      {
        fullName: user.fullName,
        email: user.email,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    let updatedUser = response.data.user;

    // Upload Image (if selected)
    if (image) {
      const formData = new FormData();
      formData.append("image", image);

      const uploadResponse = await api.post(
        "/auth/upload-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      updatedUser = uploadResponse.data.user;
    }

    setUser(updatedUser);

    toast.success("Profile Updated Successfully");

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Unable to Update Profile"
    );

  } finally {

    setSaving(false);

  }
};

// ==========================
// Loading
// ==========================

if (loading) {
  return (
    <div className="profile-loading">
      <h2>Loading Profile...</h2>
    </div>
  );
}return (
  <div className="edit-profile-page">
    <div className="edit-profile-card">

      <h2>Edit Profile</h2>

      <div className="profile-image-section">
        <img
          src={
            image
              ? URL.createObjectURL(image)
              : user.profileImage || "https://via.placeholder.com/150"
          }
          alt="Profile"
          className="profile-preview"
        />

        <label className="upload-btn">
          <FaCamera />
          Change Photo
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />
        </label>
      </div>

      <div className="form-group">
        <label>
          <FaUser /> Full Name
        </label>

        <input
          type="text"
          name="fullName"
          value={user.fullName}
          onChange={handleChange}
          placeholder="Enter Full Name"
        />
      </div>

      <div className="form-group">
        <label>
          <FaEnvelope /> Email
        </label>

        <input
          type="email"
          name="email"
          value={user.email}
          onChange={handleChange}
          placeholder="Enter Email"
        />
      </div>

      <div className="button-group">

        <button
          className="back-btn"
          onClick={() => navigate("/profile")}
        >
          <FaArrowLeft />
          Back
        </button>

        <button
          className="save-btn"
          onClick={handleSave}
          disabled={saving}
        >
          <FaSave />
          {saving ? "Saving..." : "Save Changes"}
        </button>

      </div>

    </div>
  </div>
);

}

export default EditProfile;
const User = require("../models/Auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailSender = require("../config/mailSender");

// =======================
// Register Controller
// =======================

const register = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Required",
      });
    }

    // Password Match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password do not match",
      });
    }

    // Check Existing User
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User Already Exists",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Remove Password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "Registration Successful",
      user: userResponse,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =======================
// Login Controller
// =======================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are Required",
      });
    }

    // Check User
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User Not Found",
      });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// ===============================
// Upload Profile Image
// ===============================

const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,

        message: "Please Select an Image",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,

      {
        profileImage: req.file.path,
      },

      {
        new: true,
      },
    ).select("-password");

    return res.status(200).json({
      success: true,

      message: "Profile Image Uploaded Successfully",

      user,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// =======================
// Profile Controller
// =======================

const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =======================
// Export
// =======================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is Required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    // Generate Random Token

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;

    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    await mailSender(
      user.email,
      "Reset Password",
      `
        <h2>Password Reset</h2>

        <p>Click the button below to reset your password.</p>

        <a
          href="${resetLink}"
          style="
            background:#2563eb;
            color:white;
            padding:12px 18px;
            text-decoration:none;
            border-radius:6px;
          "
        >
          Reset Password
        </a>

        <p>This link will expire in 15 minutes.</p>
      `,
    );

    res.status(200).json({
      success: true,
      message: "Reset Link Sent Successfully",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Validation
    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Find User with Valid Token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or Expired Token",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update Password
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// ===============================
// Update Profile
// ===============================

const updateProfile = async (req, res) => {
  try {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({
        success: false,

        message: "Full Name and Email are required",
      });
    }

    // Check if another user already has this email

    const existingUser = await User.findOne({
      email: email.toLowerCase(),

      _id: { $ne: req.user.id },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,

        message: "Email already exists",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,

      {
        fullName,

        email: email.toLowerCase(),
      },

      {
        new: true,
      },
    ).select("-password");

    return res.status(200).json({
      success: true,

      message: "Profile Updated Successfully",

      user: updatedUser,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
module.exports = {
  register,

  login,

  forgotPassword,

  resetPassword,

  profile,

  uploadProfileImage,

  updateProfile,
};

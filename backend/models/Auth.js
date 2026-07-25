const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    profileImage: {

    type: String,

    default: "",

},
  },
  {
    timestamps: true,
  }
);

// Export Model
module.exports = mongoose.model("User", authSchema);
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "candidate", "admin"],
      default: "user",
    },

    // Admin approval
    isApproved: {
      type: Boolean,
      default: false,
    },

    // Rejection status
    rejected: {
      type: Boolean,
      default: false,
    },

    // Only useful for voters
    hasVoted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
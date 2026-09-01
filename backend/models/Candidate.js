const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    // Candidate account ke User se connection
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Election me dikhne wala candidate name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Political party / group
    party: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional photo URL
    photo: {
      type: String,
      default: "",
    },

    // Candidate election profile approval
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
      ],
      default: "pending",
    },

    // Total votes
    votes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model(
    "Candidate",
    candidateSchema
  );
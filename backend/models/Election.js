const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["running", "ended"],
      default: "running",
    },

    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      default: null,
    },

    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Election", electionSchema);
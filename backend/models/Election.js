const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["running", "ended"],
      default: "running",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model("Election", electionSchema);
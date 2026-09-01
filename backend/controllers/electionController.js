const Election = require("../models/Election");
const Candidate = require("../models/Candidate");
const User = require("../models/User");
const Vote = require("../models/Vote");

// ================= GET ELECTION STATUS =================

exports.getElectionStatus = async (req, res) => {
  try {
    let election = await Election.findOne();

    // First time election record doesn't exist
    if (!election) {
      election = await Election.create({
        status: "running",
      });
    }

    res.status(200).json({
      success: true,
      status: election.status,
    });
  } catch (error) {
    console.log(
      "Get Election Status Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= END ELECTION =================

exports.endElection = async (req, res) => {
  try {
    let election = await Election.findOne();

    if (!election) {
      election = await Election.create({
        status: "ended",
      });
    } else {
      election.status = "ended";
      await election.save();
    }

    res.status(200).json({
      success: true,
      message: "Election ended successfully.",
      status: election.status,
    });
  } catch (error) {
    console.log(
      "End Election Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= RESET / RESTART ELECTION =================

exports.resetElection = async (req, res) => {
  try {
    // ================= RESET CANDIDATE VOTES =================

    await Candidate.updateMany(
      {},
      {
        $set: {
          votes: 0,
        },
      }
    );

    // ================= RESET USER VOTING STATUS =================

    await User.updateMany(
      {
        role: "user",
      },
      {
        $set: {
          hasVoted: false,
        },
      }
    );

    // ================= DELETE OLD VOTES =================

    await Vote.deleteMany({});

    // ================= START ELECTION =================

    let election = await Election.findOne();

    if (!election) {
      election = await Election.create({
        status: "running",
      });
    } else {
      election.status = "running";
      await election.save();
    }

    res.status(200).json({
      success: true,
      message:
        "New election started successfully. Previous votes have been reset.",
      status: election.status,
    });
  } catch (error) {
    console.log(
      "Reset Election Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};
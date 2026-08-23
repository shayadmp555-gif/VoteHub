const Election = require("../models/Election");
const Candidate = require("../models/Candidate");
const User = require("../models/User");

// ================= END ELECTION =================

exports.endElection = async (req, res) => {
  try {
    let election = await Election.findOne();

    if (!election) {
      election = await Election.create({
        status: "running",
      });
    }

    if (election.status === "ended") {
      return res.status(400).json({
        success: false,
        message: "Election already ended.",
      });
    }

    const candidates = await Candidate.find({
      status: "approved",
    }).sort({ votes: -1 });

    if (candidates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No approved candidates found.",
      });
    }

    const winner = candidates[0];

    election.status = "ended";
    election.winner = winner._id;
    election.endedAt = new Date();

    await election.save();

    res.status(200).json({
      success: true,
      message:
        "Election ended and result declared successfully.",
      winner: {
        id: winner._id,
        name: winner.name,
        party: winner.party,
        votes: winner.votes,
      },
    });
  } catch (error) {
    console.log("End Election Error:", error);

    res.status(500).json({
      success: false,
      message: "Election end nahi ho paya.",
    });
  }
};


// ================= GET ELECTION STATUS =================

exports.getElectionStatus = async (req, res) => {
  try {
    const election = await Election.findOne()
      .populate("winner", "name party votes");

    if (!election) {
      return res.status(200).json({
        success: true,
        status: "running",
        winner: null,
      });
    }

    res.status(200).json({
      success: true,
      status: election.status,
      winner: election.winner,
      endedAt: election.endedAt,
    });
  } catch (error) {
    console.log(
      "Election Status Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Election status load nahi ho raha.",
    });
  }
};


// ================= RESET / START NEW ELECTION =================

exports.resetElection = async (req, res) => {
  try {
    // Find current election
    let election = await Election.findOne();

    // If election document does not exist
    if (!election) {
      election = await Election.create({
        status: "running",
        winner: null,
        endedAt: null,
      });
    } else {
      // Start new election
      election.status = "running";
      election.winner = null;
      election.endedAt = null;

      await election.save();
    }

    // Reset all candidate votes
    await Candidate.updateMany(
      {},
      {
        $set: {
          votes: 0,
        },
      }
    );

    // Allow all normal users to vote again
    // Admin accounts are not affected
    await User.updateMany(
      { role: { $ne: "admin" } },
      {
        $set: {
          hasVoted: false,
        },
      }
    );

    res.status(200).json({
      success: true,
      message:
        "New election started successfully. Users and candidates can vote again.",
    });
  } catch (error) {
    console.log(
      "Reset Election Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Election reset nahi ho paya.",
    });
  }
};
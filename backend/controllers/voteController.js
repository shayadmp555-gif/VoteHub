const Vote = require("../models/Vote");
const User = require("../models/User");
const Candidate = require("../models/Candidate");
const Election = require("../models/Election");

// ================= CAST VOTE =================

exports.castVote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { candidateId } = req.body;

    // ================= CHECK ELECTION =================

    const election = await Election.findOne();

    if (election && election.status === "ended") {
      return res.status(403).json({
        message:
          "Election has ended. Voting is no longer allowed.",
      });
    }

    if (!candidateId) {
      return res.status(400).json({
        message: "Candidate is required",
      });
    }

    // ================= CHECK USER =================

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ================= CHECK APPROVAL =================

    if (!user.isApproved) {
      return res.status(403).json({
        message:
          "Your account is waiting for admin approval.",
      });
    }

    // ================= CHECK ALREADY VOTED =================

    if (user.hasVoted) {
      return res.status(400).json({
        message: "You have already voted",
      });
    }

    // ================= CHECK CANDIDATE =================

    const candidate = await Candidate.findOne({
      _id: candidateId,
      status: "approved",
    });

    if (!candidate) {
      return res.status(404).json({
        message:
          "Candidate not found or not approved",
      });
    }

    // ================= EXTRA DUPLICATE CHECK =================

    const existingVote = await Vote.findOne({
      user: userId,
    });

    if (existingVote) {
      return res.status(400).json({
        message: "You have already voted",
      });
    }

    // ================= CREATE VOTE =================

    await Vote.create({
      user: userId,
      candidate: candidateId,
    });

    // Increase candidate vote count
    candidate.votes += 1;
    await candidate.save();

    // Mark user as voted
    user.hasVoted = true;
    await user.save();

    res.status(201).json({
      success: true,
      message: "Vote submitted successfully",
    });

  } catch (error) {

    console.log("Vote Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ================= GET RESULTS =================

exports.getResults = async (req, res) => {
  try {

    const results = await Candidate.find({
      status: "approved",
    })
      .select("name party photo votes")
      .sort({ votes: -1 });

    res.status(200).json(results);

  } catch (error) {

    console.log("Results Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
const Vote = require("../models/Vote");
const Candidate = require("../models/Candidate");
const User = require("../models/User");
const Election = require("../models/Election");

// ================= CAST VOTE =================

exports.castVote = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Please login first.",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.role !== "user") {
      return res.status(403).json({
        message: "Only voters can vote.",
      });
    }

    if (user.isApproved !== true) {
      return res.status(403).json({
        message: "Your account is not approved.",
      });
    }

    if (user.rejected === true) {
      return res.status(403).json({
        message: "Your account has been rejected.",
      });
    }

    // ================= ELECTION CHECK =================

    const election = await Election.findOne();

    if (election && election.status === "ended") {
      return res.status(403).json({
        message: "Election has ended. Voting is closed.",
      });
    }

    const { candidateId } = req.body;

    if (!candidateId) {
      return res.status(400).json({
        message: "Candidate ID is required.",
      });
    }

    // ================= ALREADY VOTED =================

    if (user.hasVoted === true) {
      return res.status(400).json({
        message: "You have already voted.",
      });
    }

    const existingVote = await Vote.findOne({
      userId: user._id,
    });

    if (existingVote) {
      return res.status(400).json({
        message: "You have already voted.",
      });
    }

    // ================= FIND CANDIDATE =================

    const candidate = await Candidate.findOne({
      _id: candidateId,
      status: "approved",
    });

    if (!candidate) {
      return res.status(404).json({
        message: "Approved candidate not found.",
      });
    }

    // ================= CREATE VOTE =================

    await Vote.create({
      userId: user._id,
      candidateId: candidate._id,
    });

    // ================= INCREASE CANDIDATE VOTES =================

    candidate.votes =
      Number(candidate.votes || 0) + 1;

    await candidate.save();

    // ================= UPDATE USER =================

    user.hasVoted = true;

    await user.save();

    res.status(201).json({
      success: true,
      message: "Vote submitted successfully.",
    });
  } catch (error) {
    console.log("Cast Vote Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

/// ================= GET RESULTS =================

exports.getResults = async (req, res) => {
  try {
    // ================= ELECTION CHECK =================

    const election = await Election.findOne();

    // Results only available after election ends
    if (!election || election.status !== "ended") {
      return res.status(403).json({
        success: false,
        message: "Election is still running. Results will be available after the election ends.",
        resultsAvailable: false,
      });
    }

    // ================= GET RESULTS =================

    const candidates = await Candidate.find({
      status: "approved",
    })
      .select("name party photo votes")
      .sort({ votes: -1 });

    const totalVotes = candidates.reduce(
      (total, candidate) =>
        total + Number(candidate.votes || 0),
      0
    );

    res.status(200).json({
      success: true,
      resultsAvailable: true,
      candidates,
      totalVotes,
    });

  } catch (error) {
    console.log("Get Results Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
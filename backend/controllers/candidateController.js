const Candidate = require("../models/Candidate");
const User = require("../models/User");

// ======================================================
// GET APPROVED CANDIDATES
// Voter dashboard ke liye
// ======================================================

exports.getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find({
      status: "approved",
    })
      .populate(
        "userId",
        "name email role isApproved rejected"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json(candidates);

  } catch (error) {
    console.log(
      "Get Candidates Error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Candidates load nahi ho rahe.",
    });
  }
};


// ======================================================
// GET ALL CANDIDATES
// Admin panel ke liye
// ======================================================

exports.getAllCandidates = async (req, res) => {
  try {
    const candidates =
      await Candidate.find()
        .populate(
          "userId",
          "name email role isApproved rejected"
        )
        .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      candidates,
    });

  } catch (error) {
    console.log(
      "Get All Candidates Error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Candidates load nahi ho rahe.",
    });
  }
};


// ======================================================
// ADD CANDIDATE
// Approved candidate apna election profile submit karega
// ======================================================

exports.addCandidate = async (req, res) => {
  try {
    const {
      name,
      party,
      photo,
    } = req.body;

    // ==================================================
    // LOGIN CHECK
    // ==================================================

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message:
          "Please login first.",
      });
    }

    // ==================================================
    // FIND USER
    // ==================================================

    const user =
      await User.findById(
        req.user.id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found.",
      });
    }

    // ==================================================
    // ROLE CHECK
    // ==================================================

    if (user.role !== "candidate") {
      return res.status(403).json({
        message:
          "Only registered candidates can submit an election profile.",
      });
    }

    // ==================================================
    // APPROVAL CHECK
    // ==================================================

    if (user.isApproved !== true) {
      return res.status(403).json({
        message:
          "Your candidate account is not approved by admin yet.",
      });
    }

    // ==================================================
    // REJECTION CHECK
    // ==================================================

    if (user.rejected === true) {
      return res.status(403).json({
        message:
          "Your candidate account has been rejected by admin.",
      });
    }

    // ==================================================
    // REQUIRED FIELDS
    // ==================================================

    if (
      !name ||
      !name.trim() ||
      !party ||
      !party.trim()
    ) {
      return res.status(400).json({
        message:
          "Candidate name and party are required.",
      });
    }

    // ==================================================
    // CHECK EXISTING PROFILE
    // ==================================================

    const existingCandidate =
      await Candidate.findOne({
        userId: user._id,
      });

    // ==================================================
    // IMPORTANT
    //
    // Agar candidate ka profile already hai,
    // to duplicate profile create nahi hoga.
    //
    // Existing profile ko update karne ke liye
    // PUT /api/candidates/:id use hoga.
    // ==================================================

    if (existingCandidate) {
      return res.status(400).json({
        message:
          "You have already submitted your election profile. You can update your existing profile instead.",
        candidate:
          existingCandidate,
      });
    }

    // ==================================================
    // CREATE CANDIDATE
    // ==================================================

    const candidate =
      await Candidate.create({
        userId: user._id,

        name: name.trim(),

        party: party.trim(),

        photo:
          photo?.trim() || "",

        status: "pending",

        votes: 0,
      });

    return res.status(201).json({
      success: true,

      message:
        "Election profile submitted successfully. Waiting for admin approval.",

      candidate,
    });

  } catch (error) {
    console.log(
      "Add Candidate Error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Candidate registration failed.",
    });
  }
};


// ======================================================
// APPROVE CANDIDATE
// Admin only
// ======================================================

exports.approveCandidate = async (
  req,
  res
) => {
  try {
    const candidate =
      await Candidate.findById(
        req.params.id
      );

    if (!candidate) {
      return res.status(404).json({
        message:
          "Candidate not found.",
      });
    }

    // ==================================================
    // FIND CANDIDATE USER
    // ==================================================

    const user =
      await User.findById(
        candidate.userId
      );

    if (!user) {
      return res.status(404).json({
        message:
          "Candidate user account not found.",
      });
    }

    // ==================================================
    // USER MUST BE APPROVED
    // ==================================================

    if (
      user.isApproved !== true ||
      user.rejected === true
    ) {
      return res.status(400).json({
        message:
          "Candidate account must be approved first.",
      });
    }

    // ==================================================
    // APPROVE ELECTION PROFILE
    // ==================================================

    candidate.status = "approved";

    await candidate.save();

    return res.status(200).json({
      success: true,

      message:
        "Candidate approved successfully.",

      candidate,
    });

  } catch (error) {
    console.log(
      "Approve Candidate Error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Candidate approve failed.",
    });
  }
};


// ======================================================
// REJECT CANDIDATE
// Admin only
// ======================================================

exports.rejectCandidate = async (
  req,
  res
) => {
  try {
    const candidate =
      await Candidate.findById(
        req.params.id
      );

    if (!candidate) {
      return res.status(404).json({
        message:
          "Candidate not found.",
      });
    }

    candidate.status = "rejected";

    await candidate.save();

    return res.status(200).json({
      success: true,

      message:
        "Candidate rejected successfully.",

      candidate,
    });

  } catch (error) {
    console.log(
      "Reject Candidate Error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Candidate reject failed.",
    });
  }
};


// ======================================================
// UPDATE CANDIDATE
// Admin only
// ======================================================

exports.updateCandidate = async (
  req,
  res
) => {
  try {
    const candidate =
      await Candidate.findById(
        req.params.id
      );

    if (!candidate) {
      return res.status(404).json({
        message:
          "Candidate not found.",
      });
    }

    // ==================================================
    // ONLY ALLOWED FIELDS
    // ==================================================

    if (
      req.body.name !== undefined
    ) {
      candidate.name =
        String(req.body.name).trim();
    }

    if (
      req.body.party !== undefined
    ) {
      candidate.party =
        String(req.body.party).trim();
    }

    if (
      req.body.photo !== undefined
    ) {
      candidate.photo =
        String(req.body.photo).trim();
    }

    // ==================================================
    // VALIDATION
    // ==================================================

    if (
      !candidate.name ||
      !candidate.party
    ) {
      return res.status(400).json({
        message:
          "Candidate name and party are required.",
      });
    }

    await candidate.save();

    return res.status(200).json({
      success: true,

      message:
        "Candidate updated successfully.",

      candidate,
    });

  } catch (error) {
    console.log(
      "Update Candidate Error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Candidate update failed.",
    });
  }
};


// ======================================================
// DELETE CANDIDATE
// Admin only
// ======================================================

exports.deleteCandidate = async (
  req,
  res
) => {
  try {
    const candidate =
      await Candidate.findById(
        req.params.id
      );

    if (!candidate) {
      return res.status(404).json({
        message:
          "Candidate not found.",
      });
    }

    await Candidate.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      success: true,

      message:
        "Candidate election profile deleted successfully.",
    });

  } catch (error) {
    console.log(
      "Delete Candidate Error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Candidate delete failed.",
    });
  }
};
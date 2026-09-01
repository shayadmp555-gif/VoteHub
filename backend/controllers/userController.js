const User = require("../models/User");
const Candidate = require("../models/Candidate");

// ================= GET ALL USERS =================
// Admin only

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log(
      "Get All Users Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= APPROVE USER =================
// Admin only

exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Admin cannot be modified
    if (user.role === "admin") {
      return res.status(400).json({
        message: "Admin account cannot be modified.",
      });
    }

    // Approve user account
    user.isApproved = true;
    user.rejected = false;

    await user.save();

    // ==========================================
    // CANDIDATE ACCOUNT
    // Create election candidate profile
    // ==========================================

    if (user.role === "candidate") {
      const existingCandidate =
        await Candidate.findOne({
          userId: user._id,
        });

      // Candidate profile doesn't exist
      if (!existingCandidate) {
        await Candidate.create({
          userId: user._id,

          name: user.name,

          party: "Independent",

          photo: "",

          status: "pending",

          votes: 0,
        });
      }
    }

    return res.status(200).json({
      success: true,

      message:
        user.role === "candidate"
          ? "Candidate account approved successfully. Election profile created and is waiting for approval."
          : "Voter approved successfully.",

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        rejected: user.rejected,
        hasVoted: user.hasVoted,
      },
    });

  } catch (error) {
    console.log(
      "Approve User Error:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ================= REJECT USER =================
// Admin only

exports.rejectUser = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        message:
          "Admin account cannot be modified.",
      });
    }

    user.isApproved = false;
    user.rejected = true;

    await user.save();

    // If candidate account is rejected,
    // also reject its election profile
    if (user.role === "candidate") {
      await Candidate.updateMany(
        {
          userId: user._id,
        },
        {
          status: "rejected",
        }
      );
    }

    res.status(200).json({
      success: true,

      message:
        user.role === "candidate"
          ? "Candidate account rejected successfully."
          : "Voter rejected successfully.",

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        rejected: user.rejected,
        hasVoted: user.hasVoted,
      },
    });
  } catch (error) {
    console.log(
      "Reject User Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= DELETE USER =================
// Admin only

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        message:
          "Admin account cannot be deleted.",
      });
    }

    // Delete candidate profile also
    if (user.role === "candidate") {
      await Candidate.deleteMany({
        userId: user._id,
      });
    }

    await User.findByIdAndDelete(
      user._id
    );

    res.status(200).json({
      success: true,

      message:
        "User permanently deleted successfully.",
    });
  } catch (error) {
    console.log(
      "Delete User Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};
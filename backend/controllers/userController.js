const User = require("../models/User");
const Vote = require("../models/Vote");

// ================= GET ALL USERS =================

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    console.log("===== ALL USERS =====");
    console.log(users);

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });

  } catch (error) {
    console.log("Get Users Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= APPROVE USER =================

exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.isApproved = true;
    user.rejected = false;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User approved successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        rejected: user.rejected,
        hasVoted: user.hasVoted,
      },
    });

  } catch (error) {
    console.log("Approve User Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};


// ================= REJECT USER =================

exports.rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.isApproved = false;
    user.rejected = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User rejected successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        rejected: user.rejected,
        hasVoted: user.hasVoted,
      },
    });

  } catch (error) {
    console.log("Reject User Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};


// ================= PERMANENT DELETE USER =================

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Admin account cannot be deleted
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin account cannot be deleted.",
      });
    }

    // Delete user's vote records
    await Vote.deleteMany({
      user: user._id,
    });

    // Delete user permanently
    await User.findByIdAndDelete(
      user._id
    );

    return res.status(200).json({
      success: true,
      message:
        "User permanently deleted successfully.",
    });

  } catch (error) {
    console.log(
      "Delete User Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
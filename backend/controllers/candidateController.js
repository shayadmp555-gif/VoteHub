const Candidate = require("../models/Candidate");

// ================= GET APPROVED CANDIDATES =================

exports.getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find({
      status: "approved",
    })
      .select("-votes")
      .sort({ createdAt: -1 });

    res.status(200).json(candidates);
  } catch (error) {
    console.log("Get Candidates Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
// ================= GET ALL CANDIDATES =================
// Admin ke liye

exports.getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .sort({ createdAt: -1 });

    res.status(200).json(candidates);
  } catch (error) {
    console.log("Get All Candidates Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= ADD CANDIDATE =================

exports.addCandidate = async (req, res) => {
  try {
    const {
      name,
      party,
      photo,
    } = req.body;

    if (!name || !party) {
      return res.status(400).json({
        message:
          "Candidate name and party are required",
      });
    }

    const candidate = await Candidate.create({
      name,
      party,
      photo: photo || "",
      status: "pending",
      votes: 0,
    });

    res.status(201).json({
      success: true,
      message:
        "Candidate submitted for approval",
      candidate,
    });
  } catch (error) {
    console.log("Add Candidate Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= APPROVE CANDIDATE =================

exports.approveCandidate = async (req, res) => {
  try {
    const candidate =
      await Candidate.findByIdAndUpdate(
        req.params.id,
        {
          status: "approved",
        },
        {
          new: true,
        }
      );

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Candidate approved successfully",
      candidate,
    });
  } catch (error) {
    console.log("Approve Candidate Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= REJECT CANDIDATE =================

exports.rejectCandidate = async (req, res) => {
  try {
    const candidate =
      await Candidate.findByIdAndUpdate(
        req.params.id,
        {
          status: "rejected",
        },
        {
          new: true,
        }
      );

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Candidate rejected successfully",
      candidate,
    });
  } catch (error) {
    console.log("Reject Candidate Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= UPDATE CANDIDATE =================

exports.updateCandidate = async (req, res) => {
  try {
    const candidate =
      await Candidate.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Candidate updated successfully",
      candidate,
    });
  } catch (error) {
    console.log("Update Candidate Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= DELETE CANDIDATE =================

exports.deleteCandidate = async (req, res) => {
  try {
    const candidate =
      await Candidate.findByIdAndDelete(
        req.params.id
      );

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Candidate deleted successfully",
    });
  } catch (error) {
    console.log("Delete Candidate Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
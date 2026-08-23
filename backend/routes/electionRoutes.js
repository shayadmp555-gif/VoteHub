const express = require("express");

const router = express.Router();

const {
  endElection,
  resetElection,
  getElectionStatus,
} = require("../controllers/electionController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// ================= ELECTION ROUTES =================

// Admin can end election
router.patch(
  "/end",
  protect,
  admin,
  endElection
);

// Admin can start a new election
router.patch(
  "/reset",
  protect,
  admin,
  resetElection
);

// Anyone can check election status
router.get(
  "/status",
  getElectionStatus
);

module.exports = router;
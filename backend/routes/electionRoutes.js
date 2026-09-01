const express = require("express");

const {
  getElectionStatus,
  endElection,
  resetElection,
} = require("../controllers/electionController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

// ================= STATUS =================
// Voter can check election status

router.get(
  "/status",
  protect,
  getElectionStatus
);

// ================= END ELECTION =================
// Admin only

router.patch(
  "/end",
  protect,
  admin,
  endElection
);

// ================= RESTART ELECTION =================
// Admin only

router.patch(
  "/reset",
  protect,
  admin,
  resetElection
);

module.exports = router;
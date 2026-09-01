const express = require("express");

const {
  castVote,
  getResults,
} = require("../controllers/voteController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ================= CAST VOTE =================

router.post(
  "/",
  protect,
  castVote
);

// ================= RESULTS =================

router.get(
  "/results",
  protect,
  getResults
);

module.exports = router;